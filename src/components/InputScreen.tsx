import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { SYNTHETIC_FLOWS } from "../data/syntheticFlows";
import { parseUserFlow } from "../utils/flowParser";

const EXAMPLE_IDS = ["ec-001", "so-001", "pr-001", "hc-001", "ft-001", "fd-001", "tr-001", "ed-001"];
const EXAMPLES = EXAMPLE_IDS
  .map((id) => SYNTHETIC_FLOWS.find((f) => f.id === id))
  .filter((f): f is NonNullable<typeof f> => Boolean(f));

const RECENTS_KEY = "edgecase:recent-flows";
const MAX_RECENTS = 5;

function loadRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(flow: string) {
  const existing = loadRecents().filter((f) => f !== flow);
  const next = [flow, ...existing].slice(0, MAX_RECENTS);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
}

export function InputScreen() {
  const navigate = useNavigate();
  const [userFlow, setUserFlow] = useState(() => sessionStorage.getItem("userFlow") || "");
  const [recents, setRecents] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  const stepCount = useMemo(() => parseUserFlow(userFlow).length, [userFlow]);

  const isTooShort = userFlow.trim().length > 0 && userFlow.trim().length < 10;
  const canGenerate = userFlow.trim().length >= 10;

  const focusInput = () => {
    textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    textareaRef.current?.focus();
  };

  const handleSeeExample = () => {
    setUserFlow(EXAMPLES[0].steps.join(" → "));
    requestAnimationFrame(focusInput);
  };

  const handleGenerate = () => {
    if (!canGenerate) return;
    saveRecent(userFlow.trim());
    sessionStorage.setItem("userFlow", userFlow.trim());
    navigate("/loading");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div>
      <div className="px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] text-[var(--accent-hover)] text-xs sm:text-sm font-medium px-3.5 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            For designers who ship real products
          </div>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-[var(--text-hi)] text-center mb-4 sm:mb-5 tracking-tight leading-[1.05]">
          Design the states
          <br />
          you forgot.
        </h1>

        <p className="text-base sm:text-lg text-[var(--text-mid)] text-center max-w-xl mx-auto mb-8 sm:mb-10">
          Paste any user flow and Edgecase generates the empty states, error messages, and edge cases your happy path is hiding.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
          <button
            onClick={focusInput}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[var(--accent-hover)] transition-colors text-sm sm:text-base"
          >
            Generate my edge cases
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleSeeExample}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[var(--text-hi)] font-semibold py-3 px-6 rounded-xl border border-[var(--border-strong)] hover:bg-[var(--neutral-soft)] transition-colors text-sm sm:text-base"
          >
            See an example
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-low)] text-center mb-12 sm:mb-16">
          Free · No account needed
        </p>

        <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm focus-within:border-[var(--accent)]/60 focus-within:ring-4 focus-within:ring-[var(--accent-soft)] transition-all overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--neutral-soft)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" />
            <span className="ml-2 text-xs text-[var(--text-low)]">your-flow.txt</span>
          </div>
          <label htmlFor="flow-input" className="sr-only">
            Describe your user flow
          </label>
          <textarea
            ref={textareaRef}
            id="flow-input"
            value={userFlow}
            onChange={(e) => setUserFlow(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="User signs up → verifies email → lands on dashboard"
            aria-describedby="flow-hint"
            className="w-full h-36 sm:h-40 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-[var(--text-hi)] placeholder-[var(--text-low)] bg-transparent resize-none focus:outline-none"
          />
          <div id="flow-hint" className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-t border-[var(--border)] text-xs text-[var(--text-low)]">
            <span>
              {isTooShort ? (
                <span className="text-[var(--warning)]" role="status">keep going — describe at least one full step</span>
              ) : (
                "separate steps with → , or a new line"
              )}
            </span>
            <span>{stepCount > 0 ? `${stepCount} step${stepCount === 1 ? "" : "s"}` : ""}</span>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="mt-4 sm:mt-5 w-full inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-semibold py-3.5 sm:py-4 px-6 rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[var(--accent)] text-sm sm:text-base"
        >
          Generate states
          <ArrowRight className="w-4 h-4" />
          <kbd className="hidden sm:inline-block ml-1 text-[10px] bg-white/15 px-1.5 py-0.5 rounded">
            ⌘⏎
          </kbd>
        </button>

        {recents.length > 0 && (
          <div className="mt-8 sm:mt-10">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-medium text-[var(--text-low)]">
              <Clock className="w-3.5 h-3.5" />
              Recent
            </div>
            <div className="flex flex-wrap gap-2">
              {recents.map((flow, i) => (
                <button
                  key={i}
                  onClick={() => setUserFlow(flow)}
                  className="max-w-full truncate text-left text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-[var(--text-mid)] hover:border-[var(--accent)]/40 hover:text-[var(--text-hi)] transition-colors"
                  title={flow}
                >
                  {flow}
                </button>
              ))}
            </div>
          </div>
        )}

        <div id="examples" className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-[var(--border)] scroll-mt-20">
          <div className="flex items-center gap-1.5 mb-3 justify-center sm:justify-start">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-xs sm:text-sm font-medium text-[var(--text-hi)]">
              Not sure where to start? Try an example
            </span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {EXAMPLES.map((example) => (
              <button
                key={example.id}
                onClick={() => {
                  setUserFlow(example.steps.join(" → "));
                  focusInput();
                }}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-[var(--accent)]/25 bg-[var(--accent-soft)] text-[var(--accent-hover)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/15 transition-colors"
              >
                {example.flowName}
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>

      <section className="bg-[var(--text-hi)] text-white px-4 sm:px-6 py-16 sm:py-20 mt-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Stop designing for the demo.
          </h2>
          <p className="text-white/70 mb-8">Find your edge cases in the next two minutes — free, no account needed.</p>
          <button
            onClick={focusInput}
            className="inline-flex items-center gap-2 bg-[var(--accent)] text-white font-semibold py-3 px-6 rounded-xl hover:brightness-110 transition-all text-sm sm:text-base"
          >
            Generate my edge cases
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <footer className="bg-[var(--text-hi)] text-white/60 px-4 sm:px-6 py-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <span>© 2026 Edgecase</span>
          <a
            href="https://github.com/Alakananda2021/new-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
