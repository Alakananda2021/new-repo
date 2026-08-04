import type { RGB } from "./contrast";

export interface ColorSample {
  color: RGB;
  frequency: number; // 0-1 fraction of sampled pixels
}

const BUCKET = 24; // quantization step — groups near-identical shades (anti-aliasing, jpeg noise) together

function quantize(v: number): number {
  return Math.min(255, Math.round(v / BUCKET) * BUCKET);
}

// Loads an image file into a downscaled canvas and returns its most common
// colors by pixel frequency. Runs entirely in the browser — the image never
// leaves the device.
export async function extractDominantColors(file: File, maxColors = 8): Promise<ColorSample[]> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataUrl;
  });

  const maxDim = 300;
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, w, h);

  const { data } = ctx.getImageData(0, 0, w, h);
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  let sampled = 0;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 128) continue; // skip transparent pixels
    const r = quantize(data[i]);
    const g = quantize(data[i + 1]);
    const b = quantize(data[i + 2]);
    const key = `${r},${g},${b}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      buckets.set(key, { r, g, b, count: 1 });
    }
    sampled += 1;
  }

  if (sampled === 0) return [];

  return Array.from(buckets.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, maxColors)
    .map((c) => ({ color: { r: c.r, g: c.g, b: c.b }, frequency: c.count / sampled }));
}
