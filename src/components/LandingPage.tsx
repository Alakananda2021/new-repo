import { useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { SYNTHETIC_FLOWS } from "../data/syntheticFlows";
import { generateFlowSteps } from "../utils/flowParser";

const PREVIEW_FLOW = SYNTHETIC_FLOWS.find((f) => f.id === "ec-001")!;

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Paste your flow",
    body: "Drop in a user flow in plain language — sign up, checkout, onboarding, whatever you're designing.",
  },
  {
    step: "2",
    title: "Get the states you missed",
    body: "Empty, error, and edge cases — ranked by type, contextual to each step, in a tone you pick.",
  },
  {
    step: "3",
    title: "Ship with confidence",
    body: "Copy any card as an image for your file, or export the whole set as text for engineering.",
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  const previewSteps = useMemo(
    () => generateFlowSteps(PREVIEW_FLOW.steps.join(" → "), "professional"),
    []
  );

  // Curated for variety, not just the first (always-empty) state per step —
  // a preview that only shows "Empty" undersells what the tool actually catches.
  const previewCards = useMemo(() => {
    const all = previewSteps.flatMap((step, stepIndex) =>
      step.states.map((state) => ({ state, stepIndex, stepName: step.stepName }))
    );
    const byType = (type: string) => all.filter((c) => c.state.type === type);
    const picked = [byType("error")[0], byType("edge")[0], byType("empty")[0], byType("empty")[1]].filter(
      Boolean
    ) as typeof all;
    const seen = new Set(picked.map((c) => c.state.title));
    for (const c of all) {
      if (picked.length >= 4) break;
      if (!seen.has(c.state.title)) {
        picked.push(c);
        seen.add(c.state.title);
      }
    }
    return picked.slice(0, 4);
  }, [previewSteps]);

  const previewTotal = useMemo(
    () => previewSteps.flatMap((s) => s.states).length,
    [previewSteps]
  );
  const previewCritical = useMemo(
    () => previewSteps.flatMap((s) => s.states).filter((s) => s.type === "error").length,
    [previewSteps]
  );

  const handleSeeExample = () => {
    sessionStorage.setItem("userFlow", PREVIEW_FLOW.steps.join(" → "));
    navigate("/app/results");
  };

  const badgeStyles: Record<string, string> = {
    empty: "bg-[var(--neutral-soft)] text-[var(--text-mid)] border border-[var(--border-strong)]",
    error: "bg-red-50 text-red-700 border border-red-200",
    edge: "bg-amber-50 text-amber-700 border border-amber-200",
  };
  const badgeLabel: Record<string, string> = { empty: "Empty", error: "Error", edge: "Edge" };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-hi)]">
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--text-hi)] flex items-center justify-center text-white text-sm font-semibold group-hover:bg-[var(--accent)] transition-colors">
              {"{}"}
            </div>
            <span className="font-display font-semibold text-[var(--text-hi)] text-sm sm:text-base tracking-tight">
              Edgecase
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-6 text-sm">
            <a href="#how-it-works" className="text-[var(--text-mid)] hover:text-[var(--text-hi)] transition-colors">
              How it works
            </a>
            <a href="#examples" className="text-[var(--text-mid)] hover:text-[var(--text-hi)] transition-colors">
              Examples
            </a>
          </div>

          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 bg-[var(--text-hi)] text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2 rounded-lg hover:bg-[var(--accent)] transition-colors"
          >
            Open the app
          </Link>
        </div>
      </nav>

      <section className="px-4 sm:px-6 pt-16 sm:pt-24 pb-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] text-[var(--accent-hover)] text-xs sm:text-sm font-medium px-3.5 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            For designers who ship real products
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] mb-5">
            Design the states
            <br />
            you forgot.
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-mid)] max-w-xl mx-auto mb-8">
            Paste any user flow and Edgecase generates the empty states, error messages, and edge cases your happy path is hiding — before your users find them.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
            <Link
              to="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[var(--accent-hover)] transition-colors text-sm sm:text-base"
            >
              Generate my edge cases
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleSeeExample}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[var(--text-hi)] font-semibold py-3 px-6 rounded-xl border border-[var(--border-strong)] hover:bg-[var(--neutral-soft)] transition-colors text-sm sm:text-base"
            >
              See an example
            </button>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-low)]">Free · No account needed</p>
        </div>
      </section>

      <section id="examples" className="px-4 sm:px-6 py-12 sm:py-16 scroll-mt-16">
        <div className="max-w-4xl mx-auto rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--neutral-soft)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" />
            <span className="ml-2 text-xs text-[var(--text-low)]">edgecase.design/flow/checkout</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr]">
            <div className="p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-[var(--border)]">
              <p className="text-xs font-semibold text-[var(--text-low)] uppercase tracking-wide mb-3">Your flow</p>
              <div className="flex flex-col gap-1.5 mb-4">
                {previewSteps.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs sm:text-sm px-2.5 py-2 rounded-lg bg-[var(--neutral-soft)] text-[var(--text-hi)]"
                  >
                    <span className="w-4 h-4 rounded-full bg-white border border-[var(--border-strong)] flex items-center justify-center text-[10px] flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="truncate">{step.stepName}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/app"
                onClick={() => sessionStorage.setItem("userFlow", PREVIEW_FLOW.steps.join(" → "))}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-[var(--accent)] text-white text-xs sm:text-sm font-semibold py-2 rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate states
              </Link>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[var(--text-low)] uppercase tracking-wide">Generated states</p>
                <p className="text-xs text-[var(--text-low)]">
                  {previewTotal} found
                  {previewCritical > 0 && (
                    <>
                      {" · "}
                      <span className="text-[var(--danger)] font-medium">{previewCritical} critical</span>
                    </>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {previewCards.map(({ state, stepIndex }, i) => (
                  <div key={i} className="rounded-lg border border-[var(--border)] p-3 sm:p-3.5">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${badgeStyles[state.type]}`}>
                        {badgeLabel[state.type]}
                      </span>
                      <span className="text-[10px] text-[var(--text-low)] flex-shrink-0">Step {stepIndex + 1}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-[var(--text-hi)] mb-1 leading-snug">
                      {state.title}
                    </p>
                    <p className="text-[11px] sm:text-xs text-[var(--text-mid)] leading-relaxed line-clamp-2">
                      {state.microcopy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-4 sm:px-6 py-16 sm:py-20 scroll-mt-16">
        <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-12">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Your happy path is 20% of the design.
          </h2>
          <p className="text-[var(--text-mid)]">Edgecase covers the other 80% in three steps.</p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6">
              <div className="w-7 h-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent-hover)] text-sm font-semibold flex items-center justify-center mb-4">
                {item.step}
              </div>
              <h3 className="font-display font-semibold text-[var(--text-hi)] mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--text-mid)] leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--text-hi)] text-white px-4 sm:px-6 py-16 sm:py-20 mt-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Stop designing for the demo.
          </h2>
          <p className="text-white/70 mb-8">Find your edge cases in the next two minutes — free, no account needed.</p>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 bg-[var(--accent)] text-white font-semibold py-3 px-6 rounded-xl hover:brightness-110 transition-all text-sm sm:text-base"
          >
            Generate my edge cases
            <ArrowRight className="w-4 h-4" />
          </Link>
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
