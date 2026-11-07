#!/usr/bin/env python3
"""Repère les longues pauses d'un rush et propose une liste de coupes, puis l'applique si on le demande.

Étape 1, analyser (ne modifie rien) :
  python3 silences.py rushes/rush.mp4 --seuil -35 --pause-min 0.6 --pause-gardee 0.25 --sortie montage/coupes.json

Étape 2, après relecture de coupes.json par l'utilisateur, rendre une copie coupée :
  python3 silences.py rushes/rush.mp4 --coupes montage/coupes.json --rendre montage/rush-coupe.mp4

Le fichier source n'est jamais modifié. Chaque silence plus long que --pause-min est ramené à --pause-gardee.
Après les coupes, les horodatages changent : refaites la transcription sur la copie coupée.
"""
import argparse
import json
import os
import re
import subprocess
import sys


def duree(fichier):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", fichier],
                       capture_output=True, text=True, check=True)
    return float(json.loads(r.stdout)["format"]["duration"])


def a_une_video(fichier):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=index",
                        "-of", "csv=p=0", fichier], capture_output=True, text=True)
    return bool(r.stdout.strip())


def detecter(fichier, seuil, pause_min):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", fichier, "-vn",
                        "-af", f"silencedetect=noise={seuil}dB:d={pause_min}", "-f", "null", "-"],
                       capture_output=True, text=True)
    debuts = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", r.stderr)]
    fins = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    return list(zip(debuts, fins + [None] * (len(debuts) - len(fins))))


def calculer(fichier, seuil, pause_min, pause_gardee):
    total = duree(fichier)
    coupes = []
    for debut, fin in detecter(fichier, seuil, pause_min):
        fin = total if fin is None else fin
        debut = max(debut, 0.0)
        marge = pause_gardee / 2
        a, b = debut + marge, fin - marge
        if debut <= 0.01:
            a = 0.0  # silence d'ouverture : on le retire en entier sauf la marge de fin
        if fin >= total - 0.01:
            b = total
        if b - a > 0.05:
            coupes.append({"debut": round(a, 3), "fin": round(b, 3), "duree": round(b - a, 3)})
    segments, t = [], 0.0
    for c in coupes:
        if c["debut"] > t:
            segments.append({"debut": round(t, 3), "fin": c["debut"]})
        t = c["fin"]
    if t < total:
        segments.append({"debut": round(t, 3), "fin": round(total, 3)})
    gagne = sum(c["duree"] for c in coupes)
    return {"source": os.path.basename(fichier), "duree_source": round(total, 3),
            "duree_apres": round(total - gagne, 3), "reglages": {"seuil_db": seuil, "pause_min": pause_min,
                                                                 "pause_gardee": pause_gardee},
            "coupes": coupes, "segments": segments}


def rendre(fichier, plan, sortie):
    segs = plan["segments"]
    if not segs:
        sys.exit("Aucun segment à garder.")
    video = a_une_video(fichier)
    parties, entrees = [], ""
    for i, s in enumerate(segs):
        if video:
            parties.append(f"[0:v]trim=start={s['debut']}:end={s['fin']},setpts=PTS-STARTPTS[v{i}];")
            entrees += f"[v{i}]"
        parties.append(f"[0:a]atrim=start={s['debut']}:end={s['fin']},asetpts=PTS-STARTPTS,"
                       f"afade=t=in:d=0.01,afade=t=out:st={max(s['fin'] - s['debut'] - 0.01, 0)}:d=0.01[a{i}];")
        entrees += f"[a{i}]"
    n = len(segs)
    if video:
        graphe = "".join(parties) + f"{entrees}concat=n={n}:v=1:a=1[v][a]"
        carte = ["-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p"]
    else:
        graphe = "".join(parties) + f"{entrees}concat=n={n}:v=0:a=1[a]"
        carte = ["-map", "[a]"]
    script = sortie + ".filtre.txt"
    with open(script, "w") as f:
        f.write(graphe)
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-stats", "-y", "-i", fichier, "-filter_complex_script", script] + carte
    if sortie.lower().endswith((".mp4", ".mov", ".m4a")):
        cmd += ["-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart"]
    cmd.append(sortie)
    subprocess.run(cmd, check=True)
    os.remove(script)
    print(f"Copie coupée : {sortie} ({plan['duree_apres']} s au lieu de {plan['duree_source']} s)")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("fichier")
    p.add_argument("--seuil", type=float, default=-35, help="niveau sous lequel c'est un silence, en dB (défaut -35)")
    p.add_argument("--pause-min", type=float, default=0.6, help="durée d'un silence à resserrer, en s (défaut 0,6)")
    p.add_argument("--pause-gardee", type=float, default=0.25, help="silence gardé à la place, en s (défaut 0,25)")
    p.add_argument("--sortie", default="coupes.json")
    p.add_argument("--coupes", help="liste de coupes déjà relue, à appliquer")
    p.add_argument("--rendre", help="fichier de sortie coupé (le source n'est jamais modifié)")
    a = p.parse_args()
    if a.rendre and os.path.abspath(a.rendre) == os.path.abspath(a.fichier):
        sys.exit("La sortie doit être un autre fichier que le rush source.")
    if a.coupes:
        with open(a.coupes, encoding="utf-8") as f:
            plan = json.load(f)
    else:
        plan = calculer(a.fichier, a.seuil, a.pause_min, a.pause_gardee)
        with open(a.sortie, "w", encoding="utf-8") as f:
            json.dump(plan, f, ensure_ascii=False, indent=2)
        print(f"{len(plan['coupes'])} silences à resserrer, {plan['duree_source']} s -> {plan['duree_apres']} s")
        for c in plan["coupes"]:
            print(f"  coupe {c['debut']:8.2f} -> {c['fin']:8.2f}  ({c['duree']:.2f} s)")
        print(f"Liste écrite dans {a.sortie}. Relisez-la avant de lancer --rendre.")
    if a.rendre:
        rendre(a.fichier, plan, a.rendre)


if __name__ == "__main__":
    main()
