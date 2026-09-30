"""Import the original 150-icon Jade Imperial pack, distinct from classic Jade."""
from pathlib import Path
from zipfile import ZipFile
from PIL import Image
from io import BytesIO
import json

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:\Users\jphk\Desktop\PACKS_SNX\01_JADE_IMPERIAL")
SLUG = "jade-premium"
DEST = ROOT / "assets/packs" / SLUG
DEST.mkdir(parents=True, exist_ok=True)
catalog_path = ROOT / "src/data/premiumPacks.js"
catalog = json.loads(catalog_path.read_text(encoding="utf-8").split(" = ", 1)[1].rstrip(";\n"))
labels = {Path(i["src"]).stem: i["name"] for i in catalog[0]["icons"]}

def convert(archive, entry, filename, thumb=False):
    with Image.open(BytesIO(archive.read(entry))) as source:
        image = source.convert("RGB")
        size = image.size
        if thumb:
            image.thumbnail((256, 256) if size[0] == size[1] else (360, 780), Image.Resampling.LANCZOS)
        image.save(DEST / filename, "WEBP", quality=85 if thumb else 92, method=4)
        return size

icons = []
for archive_path in sorted((SOURCE / "02_Archives_par_lots").glob("SNX_JADE_IMPERIAL_*_ICONS.zip")):
    with ZipFile(archive_path) as archive:
        for entry in archive.namelist():
            if not entry.lower().endswith(".png"):
                continue
            stem = Path(entry).stem
            width, height = convert(archive, entry, stem + ".webp")
            convert(archive, entry, stem + "-thumb.webp", True)
            icons.append({"id": f"{SLUG}-{stem}", "name": labels.get(stem, stem.replace("_", " ")), "src": f"assets/packs/{SLUG}/{stem}.webp", "thumb": f"assets/packs/{SLUG}/{stem}-thumb.webp", "width": width, "height": height})
    print(f"Imported lot {archive_path.name}", flush=True)
if len(icons) != 150 or len({i["id"] for i in icons}) != 150:
    raise ValueError("Jade Imperial must contain 150 unique icons")
walls = []
with ZipFile(SOURCE / "03_Fonds_et_planches/SNX_JADE_IMPERIAL_FONDS_IPHONE17_PRO_MAX.zip") as archive:
    for index, entry in enumerate(n for n in archive.namelist() if n.lower().endswith(".png")):
        filename = f"wallpaper-{index+1}.webp"
        thumb = f"wallpaper-{index+1}-thumb.webp"
        width, height = convert(archive, entry, filename)
        convert(archive, entry, thumb, True)
        walls.append({"id": f"{SLUG}-wallpaper-{index+1}", "name": ["Ivoire satiné", "Jade profond", "Soie champagne", "Écrin de jade"][index], "src": f"assets/packs/{SLUG}/{filename}", "thumb": f"assets/packs/{SLUG}/{thumb}", "width": width, "height": height, "fit": "cover", "tone": "dark" if index == 1 else "light"})
defaults = ["Telephone", "Messages", "Appareil_photo", "Photos", "Calendrier", "Horloge", "Meteo", "Reglages", "Safari", "Mail", "Apple_Music", "WhatsApp"]
theme = {"id": SLUG, "slug": SLUG, "name": "Jade Impérial", "colors": {"accent": "#91c7a9", "base": "#0f3025"}, "description": "Jade précieux, ivoire et champagne. La signature impériale.", "cover": walls[1]["thumb"], "wallpapers": walls, "icons": icons, "widgets": [], "defaultIcons": [f"{SLUG}-{stem}" for stem in defaults], "price": None, "availability": "preview", "metadata": {"originalArchive": "SNX_JADE_IMPERIAL — 8 lots de 150 icônes", "widgets": "Aucun widget fourni"}}
catalog = [theme] + [t for t in catalog if t["id"] != SLUG]
catalog_path.write_text("export const premiumPacks = " + json.dumps(catalog, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
print("Jade Imperial Premium: 150 icons, 4 wallpapers", flush=True)
