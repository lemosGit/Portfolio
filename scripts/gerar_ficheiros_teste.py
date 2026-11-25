#!/usr/bin/env python3
"""
Ficheiros de teste do plano de testes (M9-01, docs/05-qa/plano-testes.md §3.4).
Gera em tests/fixtures/gerados/ (fora do git): imagens e PDFs com tamanhos certos para os
limites do cliente (RF-30.42: 10 MB, JPG/PNG/WebP/HEIC/PDF/DOC/DOCX) e provas do Design.
Uso: python3 scripts/gerar_ficheiros_teste.py
"""
import os
import zlib
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "tests" / "fixtures" / "gerados"
MB = 1024 * 1024


def pdf(path: Path, size: int) -> None:
    """PDF mínimo válido, acolchoado com um comentário até ao tamanho pedido."""
    head = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 0/Kids[]>>endobj\n"
    tail = b"trailer<</Root 1 0 R>>\n%%EOF\n"
    pad = max(0, size - len(head) - len(tail) - 2)
    path.write_bytes(head + b"%" + b"x" * pad + b"\n" + tail)


def png(path: Path, w: int, h: int, noise: bool = False) -> None:
    """PNG RGB sem dependências; com ruído não comprime (fica grande)."""
    import struct

    def chunk(t: bytes, d: bytes) -> bytes:
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)

    rows = b"".join(b"\x00" + (os.urandom(w * 3) if noise else bytes([244, 239, 230]) * w) for _ in range(h))
    data = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
    data += chunk(b"IDAT", zlib.compress(rows, 1)) + chunk(b"IEND", b"")
    path.write_bytes(data)


SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="148" height="210" viewBox="0 0 148 210">
<rect width="148" height="210" fill="#f4efe6"/><rect x="6" y="6" width="136" height="198" fill="none" stroke="#b88c3e"/>
<text x="74" y="100" font-family="serif" font-size="18" text-anchor="middle" fill="#1e2d23">Teste &amp; Demo</text>
<text x="74" y="125" font-family="serif" font-size="7" text-anchor="middle">{label}</text></svg>
"""


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    png(OUT / "foto-referencia-4mb.png", 1200, 1150, noise=True)  # ~4 MB, aceite (US-015)
    pdf(OUT / "enunciado-2mb.pdf", 2 * MB)  # aceite (US-015, Académico)
    pdf(OUT / "documento-12mb.pdf", 12 * MB)  # recusado antes do envio: > 10 MB (US-015)
    pdf(OUT / "limite-10mb.pdf", 10 * MB)  # no limite: aceite
    (OUT / "ficheiro.txt").write_text("formato fora da lista (RF-30.42)\n")  # recusado
    (OUT / "falso.pdf").write_bytes(b"MZ" + b"\x00" * 1000)  # extensão .pdf mas não é PDF: recusado
    for v in ("v1", "v2", "v3"):
        png(OUT / f"convite-{v}-frente.png", 740, 1050)  # prova com pré-visualização (Design)
        (OUT / f"convite-{v}-frente.svg").write_text(SVG.format(label=v.upper()))  # prova sem pré-visualização (L5)
    pdf(OUT / "monografia-final.pdf", 1 * MB)  # entrega final do Académico (US-026)
    pdf(OUT / "convite-final.pdf", 1 * MB)  # ficheiros digitais do Design (US-036)
    for f in sorted(OUT.iterdir()):
        print(f"{f.stat().st_size / MB:7.2f} MB  {f.name}")


if __name__ == "__main__":
    main()
