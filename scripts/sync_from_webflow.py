#!/usr/bin/env python3
"""Synchronise les skills Claude publiés sur nodeit.fr vers ce dépôt.

Source : la collection CMS Webflow « Ressources » du site nodeit.fr, items
publiés dont le type est « Skills IA ». Chaque item porte une archive .zip
(champ « Fichier PDF » ou « url fichier pdf »).

Pour chaque skill nouveau, ou dont l'archive a changé depuis le dernier
passage (l'URL Webflow change à chaque nouveau fichier), le script :
  1. télécharge et décompresse l'archive ;
  2. place le skill dans skills/<nom>/ avec un SKILL.md à la racine ;
  3. refuse tout le lot si un secret (clé d'API, jeton) est détecté ;
  4. met à jour sources.json, le tableau du README et marketplace.json.

Variables d'environnement :
  WEBFLOW_TOKEN    jeton d'API du site (lecture CMS suffit), obligatoire
  DRY_RUN=1        affiche ce qui changerait sans rien écrire
  RENDER_ONLY=1    régénère README et marketplace.json depuis sources.json
"""

import io
import json
import os
import re
import shutil
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILLS = ROOT / "skills"
MANIFEST = ROOT / "sources.json"
README = ROOT / "README.md"
MARKETPLACE = ROOT / ".claude-plugin" / "marketplace.json"

COLLECTION_ID = "69d557e7a9418ef55912aa1c"  # Ressources
SKILLS_OPTION_ID = "4bc6a4a9516d27c2bcbca5fdcc86ffca"  # type « Skills IA »
SITE = "https://www.nodeit.fr"
UTM = "utm_source=github&utm_medium=referral&utm_campaign=claude-skills"

SECRET_PATTERNS = [
    r"sk-[A-Za-z0-9_-]{20,}",
    r"sk-ant-[A-Za-z0-9_-]{20,}",
    r"gh[pousr]_[A-Za-z0-9]{30,}",
    r"github_pat_[A-Za-z0-9_]{30,}",
    r"AKIA[0-9A-Z]{16}",
    r"xox[abpr]-[A-Za-z0-9-]{10,}",
    r"EAA[A-Za-z0-9]{40,}",
    r"AIza[0-9A-Za-z_-]{35}",
    r"-----BEGIN [A-Z ]*PRIVATE KEY-----",
    r"\bSK[0-9a-f]{32}\b",
]
TEXT_SUFFIXES = {".md", ".txt", ".json", ".js", ".ts", ".tsx", ".py", ".css",
                 ".html", ".yml", ".yaml", ".svg", ".sh", ".env", ""}
JUNK = {"__MACOSX", ".DS_Store"}


def log(msg):
    print(msg, flush=True)


def webflow_items(token):
    items, offset = [], 0
    while True:
        url = (f"https://api.webflow.com/v2/collections/{COLLECTION_ID}"
               f"/items/live?limit=100&offset={offset}")
        req = urllib.request.Request(url, headers={
            "Authorization": f"Bearer {token}",
            "accept": "application/json",
        })
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.load(r)
        batch = data.get("items", [])
        items.extend(batch)
        total = data.get("pagination", {}).get("total", len(items))
        offset += len(batch)
        if not batch or offset >= total:
            return items


def archive_url(field_data):
    f = field_data.get("fichier-pdf")
    if isinstance(f, dict) and f.get("url"):
        return f["url"]
    return field_data.get("url-fichier-pdf-2") or ""


def slugify(text):
    text = text.lower()
    for a, b in (("é", "e"), ("è", "e"), ("ê", "e"), ("à", "a"), ("ç", "c"),
                 ("ô", "o"), ("î", "i"), ("û", "u"), ("ù", "u")):
        text = text.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def read_frontmatter(path):
    text = path.read_text(encoding="utf-8", errors="ignore")
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        return {}, text
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line and not line.startswith(" "):
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip().strip('"').strip("'")
    return meta, text


def clean_tree(path):
    for p in sorted(path.rglob("*"), reverse=True):
        if p.name in JUNK or p.name.startswith("._"):
            shutil.rmtree(p) if p.is_dir() else p.unlink()


def scan_secrets(path):
    hits = []
    for p in path.rglob("*"):
        if p.is_file() and p.suffix.lower() in TEXT_SUFFIXES:
            text = p.read_text(encoding="utf-8", errors="ignore")
            for pat in SECRET_PATTERNS:
                if re.search(pat, text):
                    hits.append(f"{p.relative_to(path)} ({pat})")
    return hits


def import_skill(item, known_folder):
    fd = item["fieldData"]
    url = archive_url(fd)
    raw = urllib.request.urlopen(url, timeout=120).read()
    tmp = Path(tempfile.mkdtemp())
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        for member in z.namelist():
            target = (tmp / member).resolve()
            if not str(target).startswith(str(tmp.resolve())):
                raise RuntimeError(f"chemin refusé dans l'archive : {member}")
        z.extractall(tmp)
    clean_tree(tmp)

    skill_files = sorted(tmp.rglob("SKILL.md"), key=lambda p: len(p.parts))
    if skill_files:
        src = skill_files[0].parent
        meta, _ = read_frontmatter(skill_files[0])
        folder = known_folder or slugify(meta.get("name") or fd["slug"])
    else:
        mds = [p for p in tmp.rglob("*.md")]
        if len(mds) != 1:
            raise RuntimeError(f"{fd['slug']} : ni SKILL.md ni fichier .md unique")
        folder = known_folder or slugify(fd["slug"].replace("-skill-md", "").replace("-md", ""))
        src = tmp / "_skill"
        src.mkdir()
        body = mds[0].read_text(encoding="utf-8", errors="ignore")
        if not body.startswith("---\n"):
            desc = (fd.get("description-courte") or fd["name"]).replace('"', "'")
            body = f'---\nname: {folder}\ndescription: "{desc}"\n---\n\n' + body
        (src / "SKILL.md").write_text(body, encoding="utf-8")

    hits = scan_secrets(src)
    if hits:
        raise RuntimeError(f"{fd['slug']} : secret probable, import annulé : {hits}")
    return folder, src


def skill_description(folder):
    meta, _ = read_frontmatter(SKILLS / folder / "SKILL.md")
    return meta.get("description", "")


def render(manifest):
    rows = []
    for slug, entry in sorted(manifest.items(), key=lambda kv: kv[1]["folder"]):
        page = f"{SITE}/ressources/{slug}?{UTM}"
        rows.append(f"| [`{entry['folder']}`](skills/{entry['folder']}) | "
                    f"{entry['summary']} | [Fiche sur nodeit.fr]({page}) |")
    table = "\n".join(["| Skill | Ce qu'il fait | Page |", "|---|---|---|"] + rows)
    text = README.read_text(encoding="utf-8")
    text = re.sub(r"(<!-- skills:start -->).*?(<!-- skills:end -->)",
                  lambda m: m.group(1) + "\n" + table + "\n" + m.group(2), text, flags=re.S)
    README.write_text(text, encoding="utf-8")

    market = json.loads(MARKETPLACE.read_text(encoding="utf-8"))
    market["plugins"][0]["skills"] = [
        f"./skills/{e['folder']}" for e in sorted(manifest.values(), key=lambda e: e["folder"])
    ]
    MARKETPLACE.write_text(json.dumps(market, ensure_ascii=False, indent=2) + "\n",
                           encoding="utf-8")


def main():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    if os.environ.get("RENDER_ONLY"):
        render(manifest)
        return 0

    token = os.environ.get("WEBFLOW_TOKEN")
    if not token:
        log("WEBFLOW_TOKEN manquant")
        return 1
    dry = bool(os.environ.get("DRY_RUN"))

    changed = []
    for item in webflow_items(token):
        fd = item.get("fieldData", {})
        if fd.get("type-de-ressource") != SKILLS_OPTION_ID:
            continue
        url = archive_url(fd)
        if not url:
            log(f"- {fd.get('slug')} : aucune archive, ignoré")
            continue
        slug = fd["slug"]
        known = manifest.get(slug)
        if known and known.get("url") == url:
            continue
        log(f"+ {slug} : {'mise à jour' if known else 'nouveau skill'}")
        if dry:
            changed.append(slug)
            continue
        folder, src = import_skill(item, known.get("folder") if known else None)
        dest = SKILLS / folder
        if dest.exists():
            shutil.rmtree(dest)
        shutil.copytree(src, dest)
        manifest[slug] = {
            "folder": folder,
            "title": fd.get("name", ""),
            "summary": (fd.get("description-courte") or "").strip(),
            "url": url,
        }
        changed.append(slug)

    if changed and not dry:
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
                            encoding="utf-8")
        render(manifest)
    log(f"{len(changed)} skill(s) {'à importer' if dry else 'importé(s)'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
