#!/usr/bin/env python3
"""Planches de contrôle d'une vidéo, à regarder image par image.

  telephone : une image par seconde, en mosaïques de 5 x 3 (vue d'ensemble, lisibilité sur petit écran)
  bande     : 12 images consécutives autour d'un instant (transition, entrée de titre, coupe)
  passage   : toutes les images d'un passage, par bandes de 10 (animation complète)

Exemples :
  python3 planches.py telephone rendus/final/video.mp4 --sortie controle/
  python3 planches.py bande rendus/final/video.mp4 --t 12.4 --sortie controle/
  python3 planches.py passage rendus/final/video.mp4 --debut 0 --fin 3 --sortie controle/
"""
import argparse
import glob
import json
import os
import subprocess


def info(fichier):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=r_frame_rate:format=duration", "-of", "json", fichier],
                       capture_output=True, text=True, check=True)
    d = json.loads(r.stdout)
    n, q = d["streams"][0]["r_frame_rate"].split("/")
    return float(d["format"]["duration"]), float(n) / float(q)


def ffmpeg(args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y"] + args, check=True)


def telephone(fichier, sortie, nom):
    motif = os.path.join(sortie, f"{nom}_telephone_%02d.png")
    ffmpeg(["-i", fichier, "-vf", "fps=1,scale=360:-2,tile=5x3:padding=8:margin=8:color=white", "-fps_mode", "vfr", motif])
    return sorted(glob.glob(os.path.join(sortie, f"{nom}_telephone_*.png")))


def bande(fichier, sortie, nom, t, fps):
    debut = max(t - 5.5 / fps, 0)
    chemin = os.path.join(sortie, f"{nom}_bande_{t:07.3f}s.png")
    ffmpeg(["-ss", f"{debut:.4f}", "-i", fichier,
            "-vf", "scale=320:-2,tile=12x1:padding=4:color=white", "-frames:v", "1", chemin])
    return [chemin]


def passage(fichier, sortie, nom, debut, fin):
    motif = os.path.join(sortie, f"{nom}_passage_{debut:06.2f}-{fin:06.2f}_%03d.png")
    ffmpeg(["-ss", f"{debut:.4f}", "-i", fichier, "-t", f"{fin - debut:.4f}",
            "-vf", "scale=240:-2,tile=10x1:padding=4:color=white", "-fps_mode", "vfr", motif])
    return sorted(glob.glob(os.path.join(sortie, f"{nom}_passage_{debut:06.2f}-{fin:06.2f}_*.png")))


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("mode", choices=["telephone", "bande", "passage"])
    p.add_argument("fichier")
    p.add_argument("--sortie", default="controle")
    p.add_argument("--t", type=float, help="instant central, en secondes (mode bande)")
    p.add_argument("--debut", type=float, default=0.0)
    p.add_argument("--fin", type=float)
    a = p.parse_args()
    os.makedirs(a.sortie, exist_ok=True)
    nom = os.path.splitext(os.path.basename(a.fichier))[0]
    duree, fps = info(a.fichier)
    if a.mode == "telephone":
        images = telephone(a.fichier, a.sortie, nom)
    elif a.mode == "bande":
        if a.t is None:
            p.error("--t est obligatoire en mode bande")
        images = bande(a.fichier, a.sortie, nom, a.t, fps)
    else:
        fin = a.fin if a.fin is not None else duree
        images = passage(a.fichier, a.sortie, nom, a.debut, min(fin, duree))
    print(f"{len(images)} planche(s), vidéo de {duree:.2f} s à {fps:g} i/s :")
    for i in images:
        print(" ", i)
    if a.mode == "passage":
        print(f"Chaque bande = 10 images consécutives, soit {10 / fps:.3f} s.")


if __name__ == "__main__":
    main()
