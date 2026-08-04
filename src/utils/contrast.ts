// WCAG 2.1 relative luminance + contrast ratio — the same formula used
// throughout this app's own color system (see the design-token decisions
// in index.css). Kept here as a single shared source of truth.

export interface RGB {
  r: number;
  g: number;
  b: number;
}

function relativeLuminance({ r, g, b }: RGB): number {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: RGB, b: RGB): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function rgbToHex({ r, g, b }: RGB): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export type ContrastVerdict = "fail" | "large-text-only" | "pass" | "pass-aaa";

export function verdictFor(ratio: number): ContrastVerdict {
  if (ratio >= 7) return "pass-aaa";
  if (ratio >= 4.5) return "pass";
  if (ratio >= 3) return "large-text-only";
  return "fail";
}
