import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Clock, Terminal } from "lucide-react";
import { SYNTHETIC_FLOWS } from "../data/syntheticFlows";

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

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  const stepCount = useMemo(() => {
    const parts = userFlow.split(/→|->|\s+\bthen\b\s+|,\s*|\n|\s+-\s+/gi).filter((s) => s.trim());
    return parts.length;
  }, [userFlow]);

  const isTooShort = userFlow.trim().length > 0 && userFlow.trim().length < 10;
  const canGenerate = userFlow.trim().length >= 10;

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
    <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-2xl w-full">
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[var(--ink-800)] border border-[var(--ink-600)] flex items-center justify-center">
            <Terminal className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent)]" strokeWidth={1.75} />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--text-hi)] text-center mb-3 sm:mb-4 tracking-tight">
          Design the states you forgot.
        </h1>

        <p className="text-base sm:text-lg text-[var(--text-mid)] text-center mb-8 sm:mb-12">
          Turn any user flow into empty states, errors, and edge cases.
        </p>

        <div className="rounded-xl border border-[var(--ink-600)] bg-[var(--ink-900)] focus-within:border-[var(--accent)]/60 transition-colors overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--ink-700)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--ink-700)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--ink-700)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--ink-700)]" />
            <span className="ml-2 font-mono text-xs text-[var(--text-low)]">flow.txt</span>
          </div>
          <textarea
            value={userFlow}
            onChange={(e) => setUserFlow(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="User signs up → verifies email → lands on dashboard"
            className="w-full h-36 sm:h-40 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-mono text-[var(--text-hi)] placeholder-[var(--text-low)] bg-transparent focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-t border-[var(--ink-700)] font-mono text-xs text-[var(--text-low)]">
            <span>
              {isTooShort ? (
                <span className="text-[var(--warning)]">keep going — describe at least one full step</span>
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
          className="mt-4 sm:mt-5 w-full inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-[var(--ink-950)] font-mono font-medium py-3.5 sm:py-4 px-6 rounded-xl hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:brightness-100 text-sm sm:text-base"
        >
          generate states
          <ArrowRight className="w-4 h-4" />
          <kbd className="hidden sm:inline-block ml-1 text-[10px] font-sans bg-black/15 px-1.5 py-0.5 rounded">
            ⌘⏎
          </kbd>
        </button>

        {recents.length > 0 && (
          <div className="mt-8 sm:mt-10">
            <div className="flex items-center gap-1.5 mb-3 font-mono text-xs text-[var(--text-low)]">
              <Clock className="w-3.5 h-3.5" />
              recent
            </div>
            <div className="flex flex-wrap gap-2">
              {recents.map((flow, i) => (
                <button
                  key={i}
                  onClick={() => setUserFlow(flow)}
                  className="max-w-full truncate text-left text-xs sm:text-sm font-mono px-3 py-1.5 rounded-lg border border-[var(--ink-700)] bg-[var(--ink-900)] text-[var(--text-mid)] hover:border-[var(--accent)]/40 hover:text-[var(--text-hi)] transition-colors"
                  title={flow}
                >
                  {flow}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 sm:mt-10 pt-8 sm:pt-10 border-t border-[var(--ink-700)]">
          <p className="font-mono text-xs text-[var(--text-low)] mb-3 text-center sm:text-left">
            or try an example
          </p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {EXAMPLES.map((example) => (
              <button
                key={example.id}
                onClick={() => setUserFlow(example.steps.join(" → "))}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-[var(--ink-700)] bg-[var(--ink-900)] text-[var(--text-mid)] hover:border-[var(--accent)]/40 hover:text-[var(--text-hi)] transition-colors"
              >
                {example.flowName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
