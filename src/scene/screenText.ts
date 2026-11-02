import * as THREE from "three";

/** One block of text on a screen. Wrapped to the screen width. */
export interface TextLine {
  readonly text: string;
  /** Font size in pixels of a 512-wide canvas (scaled to the real one). */
  readonly size?: number;
  readonly color?: string;
  readonly bold?: boolean;
}

export interface ScreenStyle {
  /** Optional colored strip across the top, e.g. "OFFICE NEWS". */
  readonly banner?: { readonly text: string; readonly color: string };
}

/** Greedy word wrap. `measure` returns a string's rendered width. Pure. */
export const wrapText = (
  text: string,
  maxWidth: number,
  measure: (s: string) => number,
): string[] => {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next) > maxWidth) {
      out.push(line);
      line = word;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
};

const PAD = 18;
const BANNER = 36;
const FONT = "system-ui, sans-serif";

/**
 * A plane whose texture is a canvas you can print text on: TVs, coworker
 * monitors, whiteboards. `width`/`height` are world units; the canvas
 * resolution follows the aspect ratio.
 */
export const createTextScreen = (width: number, height: number) => {
  const px = 1024;
  const k = px / 512;
  const canvas = document.createElement("canvas");
  canvas.width = px;
  canvas.height = Math.round((px * height) / width);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: texture }),
  );

  /** Clears the screen and prints `lines` top to bottom; overflow is cut. */
  const show = (lines: ReadonlyArray<TextLine>, style: ScreenStyle = {}) => {
    const { width: W, height: H } = canvas;
    ctx.fillStyle = "#10141c";
    ctx.fillRect(0, 0, W, H);
    const pad = PAD * k;
    let y = pad;
    if (style.banner) {
      ctx.fillStyle = style.banner.color;
      ctx.fillRect(0, 0, W, BANNER * k);
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${20 * k}px ${FONT}`;
      ctx.textBaseline = "middle";
      ctx.fillText(style.banner.text, pad, (BANNER * k) / 2);
      y = (BANNER + PAD) * k;
    }
    ctx.textBaseline = "top";
    for (const l of lines) {
      const size = (l.size ?? 22) * k;
      ctx.font = `${l.bold ? "bold " : ""}${size}px ${FONT}`;
      ctx.fillStyle = l.color ?? "#e8e8e8";
      for (const row of wrapText(
        l.text,
        W - pad * 2,
        (s) => ctx.measureText(s).width,
      )) {
        if (y + size > H - pad / 2) break;
        ctx.fillText(row, pad, y);
        y += size * 1.25;
      }
      y += size * 0.5;
    }
    texture.needsUpdate = true;
  };

  return { mesh, show };
};
