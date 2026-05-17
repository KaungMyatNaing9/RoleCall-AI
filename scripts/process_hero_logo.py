"""Copy or process the hero logo for the landing page."""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SRC = Path.home() / "Downloads" / "ChatGPT_Image_May_16_2026_11_34_46_PM.png"
OUT = ROOT / "frontend" / "public" / "rolecall-hero-logo.png"
# Matches --hero-plate in frontend/app/globals.css
HERO_PLATE_BG = np.array([26, 37, 64], dtype=np.float32)


def _saturation(rgb: np.ndarray) -> np.ndarray:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    maxc = np.maximum(np.maximum(r, g), b)
    minc = np.minimum(np.minimum(r, g), b)
    with np.errstate(invalid="ignore"):
        return np.where(maxc > 1e-3, (maxc - minc) / maxc, 0.0)


def _luminance(rgb: np.ndarray) -> np.ndarray:
    return 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]


def export_for_page(src: Path, out: Path = OUT) -> None:
    """Replace the white export background with the hero plate color."""
    rgb = np.array(Image.open(src).convert("RGB"), dtype=np.float32)
    sat = _saturation(rgb)
    lum = _luminance(rgb)

    white_bg = (lum >= 245) & (sat <= 0.08)
    rgb[white_bg] = HERO_PLATE_BG

    rim = (~white_bg) & (lum >= 232) & (sat <= 0.10)
    blend = np.clip((lum[rim] - 232.0) / 20.0, 0.0, 1.0)[..., None]
    rgb[rim] = rgb[rim] * (1.0 - blend) + HERO_PLATE_BG * blend

    out.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB").save(out, optimize=True)
    print(f"Wrote page-matched {out}")


def copy_opaque(src: Path, out: Path = OUT) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, out)
    print(f"Copied {src} -> {out}")


def export_transparent_soft(src: Path, out: Path = OUT) -> None:
    rgb = np.array(Image.open(src).convert("RGB"), dtype=np.float32)
    sat  = _saturation(rgb)
    lum  = _luminance(rgb)

    # Near-white pixels: alpha fades with luminance
    near_white = (lum >= 220) & (sat <= 0.12)
    alpha = np.full(lum.shape, 255, dtype=np.float32)
    # Map lum 220→255 to alpha 255→0
    blend = np.clip((lum - 220) / 35.0, 0.0, 1.0)
    alpha[near_white] = (1.0 - blend[near_white]) * 255

    out_im = np.zeros((*rgb.shape[:2], 4), dtype=np.uint8)
    out_im[..., :3] = rgb.astype(np.uint8)
    out_im[..., 3]  = alpha.astype(np.uint8)
    out.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(out_im, "RGBA").save(out, optimize=True)
    print(f"Wrote soft-alpha transparent {out}")


if __name__ == "__main__":
    args = sys.argv[1:]
    transparent = "--transparent" in args
    raw = "--raw" in args
    args = [a for a in args if a not in {"--transparent", "--raw"}]
    source = Path(args[0]) if args else DEFAULT_SRC
    if not source.is_file():
        raise SystemExit(f"Source image not found: {source}")
    if transparent:
        export_transparent_soft(source)
    elif raw:
        copy_opaque(source)
    else:
        export_for_page(source)
