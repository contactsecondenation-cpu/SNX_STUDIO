"""Import the two approved SNX packs as web assets, preserving the source archive."""
from pathlib import Path
from zipfile import ZipFile
from PIL import Image
from io import BytesIO
import json
import tempfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:\Users\jphk\Desktop\PACKS_SNX\Pack Compresser.zip")
PACKS = [
    ("saphir", "SAPHIR", "Saphir & Perle", "Le bleu profond du saphir, la douceur de la perle.", "#adcaf3", "#0c2347"),
    ("amethyste", "AMETHYSTE", "Améthyste & Opale", "L’éclat de l’améthyste, les reflets délicats de l’opale.", "#d6b3ec", "#321c40"),
]
LABELS = {"Telephone": "Téléphone", "Appareil_photo": "Appareil photo", "Reglages": "Réglages", "Meteo": "Météo", "Sante": "Santé", "Traduire": "Traduire", "Photos": "Photos"}
WALL_NAMES = {
    "saphir": ["Ivoire satiné", "Saphir profond", "Soie champagne", "Écrin de saphir"],
    "amethyste": ["Opale aérée", "Géode d’améthyste", "Satin minéral", "Grotte d’opale"],
}
DEFAULTS = ["Telephone", "Messages", "Appareil_photo", "Photos", "Calendrier", "Horloge", "Meteo", "Reglages", "Safari", "Mail", "Apple_Music", "WhatsApp"]

def save_asset(archive, entry, output, max_size=None, quality=90):
    with Image.open(BytesIO(archive.read(entry))) as original:
        image = original.convert("RGB")
        size = image.size
        if max_size:
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
        image.save(output, "WEBP", quality=quality, method=4)
        return size

themes = []
with ZipFile(SOURCE) as outer:
    for slug, keyword, name, description, accent, base in PACKS:
        entry = next(n for n in outer.namelist() if keyword in n and n.endswith(".zip"))
        with tempfile.TemporaryFile() as temp:
            temp.write(outer.read(entry))
            temp.seek(0)
            with ZipFile(temp) as archive:
                manifest_entry = next(n for n in archive.namelist() if n.endswith("Manifeste_pack.json"))
                manifest = json.loads(archive.read(manifest_entry))
                dest = ROOT / "assets" / "packs" / slug
                dest.mkdir(parents=True, exist_ok=True)
                entries = {Path(n).name: n for n in archive.namelist() if n.endswith(".png")}
                files = [f for lot in manifest["icones"]["lots"].values() for f in lot]
                if len(files) != 150 or len(set(files)) != 150:
                    raise ValueError(f"Unexpected icon list in {name}")
                icons = []
                for filename in files:
                    stem = Path(filename).stem
                    path = f"assets/packs/{slug}/{stem}.webp"
                    thumb = f"assets/packs/{slug}/{stem}-thumb.webp"
                    width, height = save_asset(archive, entries[filename], ROOT / path)
                    save_asset(archive, entries[filename], ROOT / thumb, (256, 256), 85)
                    icons.append({"id": f"{slug}-{stem}", "name": LABELS.get(stem, stem.replace("_", " ")), "src": path, "thumb": thumb, "width": width, "height": height})
                walls = []
                for i, filename in enumerate(manifest["fonds"]["fichiers"]):
                    path = f"assets/packs/{slug}/wallpaper-{i+1}.webp"
                    thumb = f"assets/packs/{slug}/wallpaper-{i+1}-thumb.webp"
                    width, height = save_asset(archive, entries[filename], ROOT / path, quality=92)
                    save_asset(archive, entries[filename], ROOT / thumb, (360, 780), 85)
                    walls.append({"id": f"{slug}-wallpaper-{i+1}", "name": WALL_NAMES[slug][i], "src": path, "thumb": thumb, "width": width, "height": height, "fit": "cover", "tone": "light" if i in (0, 2) else "dark"})
                themes.append({"id": slug, "slug": slug, "name": name, "colors": {"accent": accent, "base": base}, "description": description, "cover": walls[1]["thumb"], "wallpapers": walls, "icons": icons, "widgets": [], "defaultIcons": [f"{slug}-{n}" for n in DEFAULTS], "price": None, "availability": "preview", "isNew": True, "metadata": {"originalArchive": Path(entry).name, "widgets": "Aucun widget fourni"}})
                print(f"Imported {name}: {len(icons)} icons, {len(walls)} wallpapers", flush=True)
catalog_path = ROOT / "src/data/premiumPacks.js"
if catalog_path.exists():
    previous = json.loads(catalog_path.read_text(encoding="utf-8").split(" = ", 1)[1].rstrip(";\n"))
    themes = [t for t in previous if t["id"] not in {n[0] for n in PACKS}] + themes
catalog_path.write_text("export const premiumPacks = " + json.dumps(themes, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
