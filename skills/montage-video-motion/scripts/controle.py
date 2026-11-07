#!/usr/bin/env python3
"""Contrôles automatiques d'un rendu avant livraison (étage 1 de references/10-controle-image-par-image.md).

  python3 controle.py rendus/final/video.mp4 --format 9:16 --sonie -14
  python3 controle.py rendus/final/video.mp4 --format 16:9 --duree-min 50 --duree-max 65 --rapport controle/rapport-auto.json

Classe chaque point en BLOQUANT, A_REGARDER ou OK. Code de sortie 1 s'il reste un bloquant.
"""
import argparse
import json
import re
import struct
import subprocess
import sys

FORMATS = {"9:16": (1080, 1920), "4:5": (1080, 1350), "1:1": (1080, 1080), "16:9": (1920, 1080), "16:9-4k": (3840, 2160)}


def sonde(fichier):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", fichier],
                       capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def demarrage_rapide(fichier):
    """True si l'atome moov précède mdat (lecture possible avant téléchargement complet)."""
    with open(fichier, "rb") as f:
        while True:
            entete = f.read(8)
            if len(entete) < 8:
                return None
            taille, type_ = struct.unpack(">I4s", entete)
            if taille == 1:
                taille = struct.unpack(">Q", f.read(8))[0]
                saut = taille - 16
            elif taille == 0:
                return None
            else:
                saut = taille - 8
            if type_ == b"moov":
                return True
            if type_ == b"mdat":
                return False
            f.seek(saut, 1)


def analyses(fichier, a_audio, gel):
    cmd = ["ffmpeg", "-hide_banner", "-nostats", "-i", fichier,
           "-vf", f"blackdetect=d=0.06:pix_th=0.10,freezedetect=n=-60dB:d={gel}"]
    if a_audio:
        cmd += ["-af", "ebur128=peak=true"]
    cmd += ["-f", "null", "-"]
    r = subprocess.run(cmd, capture_output=True, text=True)
    err = r.stderr
    noirs = [(float(a), float(b), float(c)) for a, b, c in
             re.findall(r"black_start:([\d.]+) black_end:([\d.]+) black_duration:([\d.]+)", err)]
    gels_debut = [float(x) for x in re.findall(r"freeze_start: ([\d.]+)", err)]
    gels_duree = [float(x) for x in re.findall(r"freeze_duration: ([\d.]+)", err)]
    res = {"noirs": noirs, "gels": list(zip(gels_debut, gels_duree))}
    if a_audio:
        resume = err[err.rfind("Summary:"):]
        i = re.search(r"I:\s+(-?[\d.]+|-inf) LUFS", resume)
        tp = re.search(r"True peak:.*?Peak:\s+(-?[\d.]+|-inf) dBFS", resume, re.S)
        lra = re.search(r"LRA:\s+(-?[\d.]+) LU", resume)
        res["sonie"] = float(i.group(1)) if i and i.group(1) != "-inf" else None
        res["crete"] = float(tp.group(1)) if tp and tp.group(1) != "-inf" else None
        res["plage"] = float(lra.group(1)) if lra else None
    return res


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("fichier")
    p.add_argument("--format", choices=sorted(FORMATS), help="format attendu")
    p.add_argument("--sonie", type=float, default=-14.0, help="sonie intégrée visée en LUFS (défaut -14)")
    p.add_argument("--tolerance", type=float, default=1.0, help="écart de sonie toléré en LU (défaut 1)")
    p.add_argument("--duree-min", type=float)
    p.add_argument("--duree-max", type=float)
    p.add_argument("--gel", type=float, default=1.5, help="durée d'image figée signalée, en s (défaut 1,5)")
    p.add_argument("--special", action="store_true", help="livraison spéciale (ProRes, transparence) : codec non contrôlé")
    p.add_argument("--muette", action="store_true", help="vidéo muette voulue : l'absence d'audio n'est pas un défaut")
    p.add_argument("--rapport", help="écrire le résultat en JSON")
    a = p.parse_args()

    points = []
    def note(niveau, quoi, detail):
        points.append({"niveau": niveau, "controle": quoi, "detail": detail})

    d = sonde(a.fichier)
    v = next((s for s in d["streams"] if s["codec_type"] == "video"), None)
    au = next((s for s in d["streams"] if s["codec_type"] == "audio"), None)
    duree = float(d["format"].get("duration", 0))
    if not v:
        sys.exit("Aucune piste vidéo.")
    l, h = int(v["width"]), int(v["height"])
    n, q = v.get("r_frame_rate", "0/1").split("/")
    fps = float(n) / float(q or 1)

    if a.format:
        attendu = FORMATS[a.format]
        note("OK" if (l, h) == attendu else "BLOQUANT", "taille", f"{l} x {h} (attendu {attendu[0]} x {attendu[1]})")
    else:
        note("A_REGARDER", "taille", f"{l} x {h}, format non précisé (--format)")
    note("OK" if fps in (24, 25, 30, 50, 60) or abs(fps - 29.97) < 0.01 or abs(fps - 59.94) < 0.01 else "A_REGARDER",
         "cadence", f"{fps:g} i/s")
    if not a.special:
        note("OK" if v.get("codec_name") == "h264" else "BLOQUANT", "codec", v.get("codec_name"))
        note("OK" if v.get("pix_fmt") == "yuv420p" else "BLOQUANT", "échantillonnage", v.get("pix_fmt"))
        couleurs = v.get("color_primaries") or v.get("color_space")
        note("OK" if couleurs in ("bt709",) else "A_REGARDER", "espace couleur", couleurs or "non renseigné")
        if a.fichier.lower().endswith((".mp4", ".mov", ".m4v")):
            rapide = demarrage_rapide(a.fichier)
            note("OK" if rapide else "BLOQUANT", "démarrage rapide (+faststart)",
                 "moov avant mdat" if rapide else "moov après mdat : réencoder avec -movflags +faststart")
    if a.duree_min is not None or a.duree_max is not None:
        ok = (a.duree_min is None or duree >= a.duree_min) and (a.duree_max is None or duree <= a.duree_max)
        note("OK" if ok else "BLOQUANT", "durée", f"{duree:.2f} s")
    else:
        note("OK", "durée", f"{duree:.2f} s")

    res = analyses(a.fichier, au is not None, a.gel)
    seuil_noir = 2.5 / fps if fps else 0.08
    noirs = [x for x in res["noirs"] if x[2] > seuil_noir and x[1] < duree - 0.05]
    note("BLOQUANT" if noirs else "OK", "images noires",
         "; ".join(f"{s:.2f} à {e:.2f} s" for s, e, _ in noirs) or "aucune")
    note("A_REGARDER" if res["gels"] else "OK", f"images figées plus de {a.gel:g} s",
         "; ".join(f"à {s:.2f} s pendant {dd:.2f} s" for s, dd in res["gels"]) or "aucune")

    if not au:
        note("OK" if a.muette else "BLOQUANT", "audio",
             "aucune piste audio (vidéo muette déclarée)" if a.muette else "aucune piste audio (--muette si c'est voulu)")
    else:
        if res.get("sonie") is None:
            note("BLOQUANT", "audio", "piste muette")
        else:
            ecart = abs(res["sonie"] - a.sonie)
            note("OK" if ecart <= a.tolerance else "BLOQUANT", "sonie intégrée",
                 f"{res['sonie']:.1f} LUFS (cible {a.sonie:g})")
        if res.get("crete") is not None:
            note("OK" if res["crete"] <= -1.0 else "BLOQUANT", "crête vraie", f"{res['crete']:.1f} dBTP (max -1)")
        if res.get("plage") is not None:
            note("OK" if res["plage"] <= 9 else "A_REGARDER", "plage de sonie", f"{res['plage']:.1f} LU")

    largeur = max(len(x["controle"]) for x in points)
    for x in points:
        print(f"{x['niveau']:<11} {x['controle']:<{largeur}}  {x['detail']}")
    bloquants = sum(1 for x in points if x["niveau"] == "BLOQUANT")
    print(f"\n{bloquants} bloquant(s). Cet étage ne remplace pas les planches : regardez-les (planches.py).")
    if a.rapport:
        with open(a.rapport, "w", encoding="utf-8") as f:
            json.dump({"fichier": a.fichier, "points": points}, f, ensure_ascii=False, indent=2)
    sys.exit(1 if bloquants else 0)


if __name__ == "__main__":
    main()
