#!/usr/bin/env python3
"""Transforme une transcription au mot (Whisper) en cartons de sous-titres.

Règles appliquées (references/05-typographie-et-sous-titres.md) :
- une ligne, 1 à 5 mots, 24 caractères au plus en 9:16 (42 en 16:9) ;
- affichage de 0,4 s au moins, 1,8 s au plus quand c'est possible ;
- cartons jointifs (pas d'écran vide entre deux cartons) ;
- pas de coupe après un mot outil (article, préposition, pronom sujet) ni entre un chiffre et son unité ;
- un mot-clé proposé par carton (à relire) ;
- typographie française (apostrophe typographique, espace insécable avant : ; ? !).

Entrée : JSON de openai-whisper (--word_timestamps True) ou liste [{"word", "start", "end"}].
Sorties : JSON de cartons (pour Remotion) et, en option, fichier .srt.

Exemple :
  python3 sous_titres.py audio/voix.json --format 9:16 --sortie audio/cartons.json --srt rendus/final/sous-titres.srt
"""
import argparse
import json
import re
import sys

MAX_CARACTERES = {"9:16": 24, "4:5": 28, "1:1": 28, "16:9": 42}
MAX_MOTS = 5
DUREE_MIN = 0.4
DUREE_MAX = 1.8

MOTS_OUTILS = set("""
le la les l' un une des du de d' au aux ce cet cette ces mon ma mes ton ta tes son sa ses notre nos votre vos leur leurs
à a en dans sur sous par pour avec sans chez vers entre et ou mais donc or ni car que qu' qui dont où si s'
je j' tu il elle on nous vous ils elles me m' te t' se lui y ne n' pas plus très tout tous toute toutes
est c' ça cela
""".split())

UNITES = set("% € $ euros euro dollars h min s ms km m cm kg g go mo ko fois ans an mois jours jour heures heure minutes secondes".split())


def lire_mots(chemin):
    with open(chemin, encoding="utf-8") as f:
        donnees = json.load(f)
    mots = []
    if isinstance(donnees, dict) and "segments" in donnees:
        for seg in donnees["segments"]:
            for m in seg.get("words", []):
                mots.append(m)
    elif isinstance(donnees, list):
        mots = donnees
    else:
        sys.exit("Format non reconnu : il faut le JSON de Whisper avec --word_timestamps True, ou une liste de mots.")
    propres = []
    for m in mots:
        texte = str(m.get("word", m.get("mot", ""))).strip()
        if not texte:
            continue
        propres.append({"mot": texte, "debut": float(m["start"] if "start" in m else m["debut"]),
                        "fin": float(m["end"] if "end" in m else m["fin"])})
    if not propres:
        sys.exit("Aucun mot horodaté trouvé. Relancez Whisper avec --word_timestamps True.")
    return propres


def normaliser(mot):
    return re.sub(r"[^\w'%€$]", "", mot.lower().replace("’", "'"))


def est_outil(mot):
    n = normaliser(mot)
    if n in MOTS_OUTILS:
        return True
    # élisions collées : « l'outil » commence par un mot outil mais porte du sens, on ne le compte pas comme outil
    return False


def est_nombre(mot):
    return bool(re.fullmatch(r"[\d][\d\s.,]*", normaliser(mot)))


def fin_de_phrase(mot):
    return mot.rstrip()[-1:] in ".!?:;"


def longueur(mots):
    return len(" ".join(m["mot"] for m in mots))


def couper(mots, max_car):
    cartons, courant = [], []
    for i, mot in enumerate(mots):
        candidat = courant + [mot]
        trop_long = longueur(candidat) > max_car or len(candidat) > MAX_MOTS
        trop_lent = courant and (mot["fin"] - courant[0]["debut"]) > DUREE_MAX and len(courant) >= 2
        if courant and (trop_long or trop_lent):
            # ne pas finir un carton sur un mot outil ou sur un nombre suivi de son unité
            report = []
            while len(courant) > 1 and (est_outil(courant[-1]["mot"]) or
                                        (est_nombre(courant[-1]["mot"]) and normaliser(mot["mot"]) in UNITES)):
                report.insert(0, courant.pop())
            cartons.append(courant)
            courant = report + [mot]
            if longueur(courant) > max_car and len(courant) > 1:
                cartons.append(courant[:-1])
                courant = [mot]
        else:
            courant = candidat
        if fin_de_phrase(mot["mot"]) or (mot["mot"].endswith(",") and len(courant) >= 3):
            cartons.append(courant)
            courant = []
    if courant:
        cartons.append(courant)
    return cartons


def fusionner_courts(cartons, max_car):
    i = 0
    while i < len(cartons):
        c = cartons[i]
        duree = c[-1]["fin"] - c[0]["debut"]
        if duree < DUREE_MIN and len(cartons) > 1:
            voisin = i + 1 if i + 1 < len(cartons) else i - 1
            fusion = (c + cartons[voisin]) if voisin > i else (cartons[voisin] + c)
            if longueur(fusion) <= max_car + 6 and len(fusion) <= MAX_MOTS + 1:
                lo, hi = min(i, voisin), max(i, voisin)
                cartons[lo:hi + 1] = [fusion]
                i = max(lo - 1, 0)
                continue
        i += 1
    return cartons


def typographie(texte):
    texte = texte.replace("'", "’")
    texte = re.sub(r"\s*([:;?!])", " \\1", texte)
    texte = re.sub(r'"([^"]*)"', "« \\1 »", texte)
    texte = texte.replace("—", ",").replace("–", ",")
    return texte


def mot_cle(mots):
    candidats = [m["mot"] for m in mots if not est_outil(m["mot"])]
    if not candidats:
        return None
    nombres = [c for c in candidats if est_nombre(c) or "%" in c or "€" in c]
    if nombres:
        return nombres[0].strip(".,;:!?")
    noms_propres = [c for c in candidats[1:] if c[:1].isupper()]
    if noms_propres:
        return noms_propres[0].strip(".,;:!?")
    return max(reversed(candidats), key=lambda c: len(normaliser(c))).strip(".,;:!?")


def construire(cartons):
    sortie = []
    for i, c in enumerate(cartons):
        debut = c[0]["debut"]
        fin = cartons[i + 1][0]["debut"] if i + 1 < len(cartons) else c[-1]["fin"]
        fin = max(fin, debut + DUREE_MIN) if i + 1 == len(cartons) else fin
        texte = typographie(" ".join(m["mot"] for m in c))
        sortie.append({
            "debut": round(debut, 3),
            "fin": round(fin, 3),
            "texte": texte,
            "motCle": typographie(mot_cle(c)) if mot_cle(c) else None,
            "mots": [{"mot": typographie(m["mot"]), "debut": round(m["debut"], 3), "fin": round(m["fin"], 3)} for m in c],
        })
    return sortie


def srt_temps(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def ecrire_srt(cartons, chemin):
    with open(chemin, "w", encoding="utf-8") as f:
        for i, c in enumerate(cartons, 1):
            f.write(f"{i}\n{srt_temps(c['debut'])} --> {srt_temps(c['fin'])}\n{c['texte']}\n\n")


def rapport(cartons, max_car):
    alertes = []
    for i, c in enumerate(cartons, 1):
        d = c["fin"] - c["debut"]
        if d < DUREE_MIN:
            alertes.append(f"carton {i} : {d:.2f} s, sous le minimum de {DUREE_MIN} s (« {c['texte']} »)")
        if len(c["texte"]) > max_car:
            alertes.append(f"carton {i} : {len(c['texte'])} caractères, au-dessus de {max_car} (« {c['texte']} »)")
        dernier = c["mots"][-1]["mot"]
        if est_outil(dernier) and not fin_de_phrase(dernier) and i < len(cartons):
            alertes.append(f"carton {i} : finit sur un mot outil (« {c['texte']} »)")
    return alertes


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("transcription")
    p.add_argument("--format", default="9:16", choices=sorted(MAX_CARACTERES))
    p.add_argument("--max-caracteres", type=int)
    p.add_argument("--sortie", default="cartons.json")
    p.add_argument("--srt")
    a = p.parse_args()
    max_car = a.max_caracteres or MAX_CARACTERES[a.format]
    mots = lire_mots(a.transcription)
    cartons = construire(fusionner_courts(couper(mots, max_car), max_car))
    with open(a.sortie, "w", encoding="utf-8") as f:
        json.dump(cartons, f, ensure_ascii=False, indent=2)
    if a.srt:
        ecrire_srt(cartons, a.srt)
    duree_moy = sum(c["fin"] - c["debut"] for c in cartons) / len(cartons)
    print(f"{len(mots)} mots, {len(cartons)} cartons, {duree_moy:.2f} s en moyenne -> {a.sortie}")
    for alerte in rapport(cartons, max_car):
        print("A REGARDER :", alerte)
    print("Relisez les coupes et les mots-clés proposés avant le rendu.")


if __name__ == "__main__":
    main()
