import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { extractDominantColors, type ColorSample } from "../utils/dominantColors";
import { contrastRatio, rgbToHex, verdictFor, type ContrastVerdict } from "../utils/contrast";

interface ColorPair {
  a: ColorSample;
  b: ColorSample;
  ratio: number;
  verdict: ContrastVerdict;
}

const VERDICT_LABEL: Record<ContrastVerdict, string> = {
  fail: "Fails AA",
  "large-text-only": "Large text only",
  pass: "Passes AA",
  "pass-aaa": "Passes AAA",
};

const VERDICT_STYLE: Record<ContrastVerdict, string> = {
  fail: "bg-red-500/10 text-red-700 border-red-500/20",
  "large-text-only": "bg-amber-500/10 text-amber-700 border-amber-500/20",
  pass: "bg-green-500/10 text-green-700 border-green-500/20",
  "pass-aaa": "bg-green-500/10 text-green-700 border-green-500/20",
};

// Minimum share of sampled pixels a color needs to count as significant,
// rather than compression artifacts or a stray anti-aliased edge.
const MIN_FREQUENCY = 0.015;
const MAX_PAIRS_SHOWN = 8;

function buildPairs(colors: ColorSample[]): ColorPair[] {
  const significant = colors.filter((c) => c.frequency >= MIN_FREQUENCY);
  const pairs: ColorPair[] = [];
  for (let i = 0; i < significant.length; i++) {
    for (let j = i + 1; j < significant.length; j++) {
      const ratio = contrastRatio(significant[i].color, significant[j].color);
      if (ratio < 1.15) continue; // near-identical shades, not a meaningful pair
      pairs.push({ a: significant[i], b: significant[j], ratio, verdict: verdictFor(ratio) });
    }
  }
  // Worst first — the most actionable failures surface immediately.
  return pairs.sort((x, y) => x.ratio - y.ratio).slice(0, MAX_PAIRS_SHOWN);
}

export function ImageContrastScanner() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pairs, setPairs] = useState<ColorPair[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);
    setPairs(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const colors = await extractDominantColors(file);
      if (colors.length < 2) {
        setError("Couldn't find enough distinct colors in this image to compare.");
      } else {
        setPairs(buildPairs(colors));
      }
    } catch {
      setError("Couldn't read that image — try a PNG or JPG screenshot.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPairs(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--neutral-soft)] p-4 sm:p-5 mb-4">
      <h3 className="font-semibold text-[var(--text-hi)] text-sm sm:text-base mb-1">
        Check contrast on your actual design
      </h3>
      <p className="text-xs sm:text-sm text-[var(--text-mid)] mb-4">
        Optional — upload a screenshot and this automatically scans its most common colors for WCAG contrast failures. Processed entirely in your browser; the image is never uploaded anywhere.
      </p>

      {!previewUrl && (
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[var(--border-strong)] rounded-lg py-8 px-4 cursor-pointer hover:border-[var(--accent)]/50 hover:bg-white transition-colors">
          <Upload className="w-5 h-5 text-[var(--text-low)]" />
          <span className="text-sm font-medium text-[var(--text-hi)]">Upload a screenshot</span>
          <span className="text-xs text-[var(--text-low)]">PNG or JPG</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      )}

      {previewUrl && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-shrink-0 w-full sm:w-40">
            <img
              src={previewUrl}
              alt="Uploaded screenshot for contrast analysis"
              className="w-full sm:w-40 h-32 sm:h-auto object-cover rounded-lg border border-[var(--border)]"
            />
            <button
              onClick={handleClear}
              aria-label="Remove screenshot"
              className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/90 border border-[var(--border)] hover:bg-white transition-colors"
            >
              <X className="w-3.5 h-3.5 text-[var(--text-mid)]" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-[var(--text-mid)] py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning colors…
              </div>
            )}

            {error && <p className="text-sm text-[var(--danger)] py-2">{error}</p>}

            {pairs && pairs.length === 0 && (
              <p className="text-sm text-[var(--text-mid)] py-2">
                No two colors in this image were common enough to compare — try a more representative crop.
              </p>
            )}

            {pairs && pairs.length > 0 && (
              <ul className="space-y-2">
                {pairs.map((pair, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-white px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex flex-shrink-0">
                        <span
                          className="w-6 h-6 rounded-l-md border border-[var(--border)]"
                          style={{ backgroundColor: rgbToHex(pair.a.color) }}
                          title={rgbToHex(pair.a.color)}
                        />
                        <span
                          className="w-6 h-6 rounded-r-md border border-l-0 border-[var(--border)]"
                          style={{ backgroundColor: rgbToHex(pair.b.color) }}
                          title={rgbToHex(pair.b.color)}
                        />
                      </div>
                      <span className="text-xs text-[var(--text-mid)] truncate">
                        {rgbToHex(pair.a.color)} vs {rgbToHex(pair.b.color)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-mono text-[var(--text-low)]">{pair.ratio.toFixed(1)}:1</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${VERDICT_STYLE[pair.verdict]}`}>
                        {VERDICT_LABEL[pair.verdict]}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
