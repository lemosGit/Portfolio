#!/usr/bin/env python3
"""Provas fictícias do guia do Design (convite de casamento V1–V3) e as pré-visualizações WebP (≤ 1600 px, ≤ 150 KB)."""
import glob
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "design" / "provas"


def font(size: int, bold: bool = True):
    pat = "DejaVuSerif-Bold.ttf" if bold else "DejaVuSerif.ttf"
    for p in glob.glob(f"/usr/share/fonts/**/{pat}", recursive=True):
        return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def convite(nome: str, escala: float, data: str, versao: str) -> None:
    w, h = 1100, 1560
    im = Image.new("RGB", (w, h), (244, 239, 230))
    d = ImageDraw.Draw(im)
    d.rectangle([44, 44, w - 44, h - 44], outline=(184, 140, 62), width=5)
    d.arc([w / 2 - 150, 110, w / 2 + 150, 330], 20, 160, fill=(184, 140, 62), width=5)
    linhas = [
        ("COM A BÊNÇÃO DOS NOSSOS PAIS", font(30, False), (95, 95, 95), 380),
        ("Ana", font(int(120 * escala)), (30, 45, 35), 520),
        ("&", font(70), (184, 140, 62), 0),
        ("Paulo", font(int(120 * escala)), (30, 45, 35), 0),
        (data, font(42), (30, 30, 30), 0),
        ("Igreja da Sagrada Família, Luanda · 16h", font(32, False), (95, 95, 95), 0),
    ]
    y = 0
    for txt, f, cor, y0 in linhas:
        y = y0 or y
        tw = d.textlength(txt, font=f)
        d.text(((w - tw) / 2, y), txt, font=f, fill=cor)
        y += f.size + 55
    d.arc([w / 2 - 150, h - 330, w / 2 + 150, h - 110], 200, 340, fill=(184, 140, 62), width=5)
    d.text((w - 140, h - 100), versao, font=font(28, False), fill=(160, 160, 160))
    png = OUT / f"convite-{versao.lower()}-frente.png"
    im.save(png, "PNG")
    prev = im.copy()
    prev.thumbnail((1200, 1200))
    prev.save(png.with_suffix(".preview.webp"), "WEBP", quality=80)


OUT.mkdir(parents=True, exist_ok=True)
convite("V1", 0.75, "Domingo, 19 de dezembro de 2026", "V1")
convite("V2", 1.0, "Domingo, 19 de dezembro de 2026", "V2")
convite("V3", 1.0, "Sábado, 19 de dezembro de 2026", "V3")
for f in sorted(OUT.iterdir()):
    print(f"{f.stat().st_size // 1024:5d} KB  {f.name}")
