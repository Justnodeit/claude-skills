#!/usr/bin/env python3
"""Mesure et normalisation de la sonie (ffmpeg ebur128 et loudnorm en deux passes).

  python3 sonie.py mesurer rendus/essais/video.mp4
  python3 sonie.py normaliser audio/mix.wav audio/mix-14.wav --cible -14 --crete -1
  python3 sonie.py normaliser rendus/final/video_brut.mp4 rendus/final/video.mp4 --cible -14

Pour une vidéo, l'image est copiée telle quelle, seul l'audio est réencodé (AAC 256 kb/s).
La normalisation se fait une seule fois, sur le mixage final. Le fichier d'entrée n'est jamais modifié.
"""
import argparse
import json
import os
import re
import subprocess
import sys


def mesurer(fichier):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", fichier, "-vn",
                        "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True)
    resume = r.stderr[r.stderr.rfind("Summary:"):]
    def lire(motif):
        m = re.search(motif, resume, re.S)
        return float(m.group(1)) if m else None
    return {
        "sonie_integree_lufs": lire(r"I:\s+(-?[\d.]+) LUFS"),
        "plage_lu": lire(r"LRA:\s+(-?[\d.]+) LU"),
        "crete_vraie_dbtp": lire(r"True peak:.*?Peak:\s+(-?[\d.]+|-inf) dBFS"),
    }


def normaliser(entree, sortie, cible, crete, plage):
    if os.path.abspath(entree) == os.path.abspath(sortie):
        sys.exit("La sortie doit être un autre fichier que l'entrée.")
    filtre = f"loudnorm=I={cible}:TP={crete}:LRA={plage}"
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", entree, "-vn",
                        "-af", filtre + ":print_format=json", "-f", "null", "-"], capture_output=True, text=True)
    bloc = r.stderr[r.stderr.rfind("{"):r.stderr.rfind("}") + 1]
    m = json.loads(bloc)
    if float(m["input_tp"]) > -0.1:
        print("ATTENTION : le mixage touche déjà 0 dBFS. La saturation est dans le mixage : baissez les pistes avant de normaliser.")
    second = (f"{filtre}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
              f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    est_audio = sortie.lower().endswith((".wav", ".flac", ".aif", ".aiff"))
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", entree, "-af", second, "-ar", "48000"]
    if est_audio:
        cmd += ["-vn", "-c:a", "pcm_s24le" if sortie.lower().endswith(".wav") else "flac"]
    else:
        cmd += ["-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart"]
    subprocess.run(cmd + [sortie], check=True)
    print("Avant :", json.dumps({"I": m["input_i"], "TP": m["input_tp"], "LRA": m["input_lra"]}))
    print("Après :", json.dumps(mesurer(sortie), ensure_ascii=False))


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("action", choices=["mesurer", "normaliser"])
    p.add_argument("entree")
    p.add_argument("sortie", nargs="?")
    p.add_argument("--cible", type=float, default=-14.0, help="sonie intégrée visée en LUFS (défaut -14)")
    p.add_argument("--crete", type=float, default=-1.0, help="crête vraie maximale en dBTP (défaut -1)")
    p.add_argument("--plage", type=float, default=7.0, help="plage de sonie visée en LU (défaut 7)")
    a = p.parse_args()
    if a.action == "mesurer":
        print(json.dumps(mesurer(a.entree), ensure_ascii=False, indent=2))
    else:
        if not a.sortie:
            p.error("indiquez le fichier de sortie")
        normaliser(a.entree, a.sortie, a.cible, a.crete, a.plage)


if __name__ == "__main__":
    main()
