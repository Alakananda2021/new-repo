import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Check, Copy, Pencil, Accessibility, Sparkles, ShieldCheck } from "lucide-react";
import { ToneToggle } from "./ToneToggle";
import { StateCard } from "./StateCard";
import { AuditSection } from "./AuditSection";
import { ImageContrastScanner } from "./ImageContrastScanner";
import type { State, Tone, FlowSteps } from "../data/states";
import { generateFlowSteps, parseUserFlow } from "../utils/flowParser";
import { runExpandedAudit } from "../utils/expandedAudit";

type FilterType = "all" | State["type"];

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "empty", label: "Empty" },
  { value: "error", label: "Error" },
  { value: "edge", label: "Edge case" },
];

export function ResultsScreen() {
  const navigate = useNavigate();
  const [tone, setTone] = useState<Tone>("professional");
  const [flowSteps, setFlowSteps] = useState<FlowSteps>([]);
  const [userFlowInput, setUserFlowInput] = useState<string>("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [exported, setExported] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const storedFlow = sessionStorage.getItem('userFlow') || "User signs up → verifies email → lands on dashboard";
    setUserFlowInput(storedFlow);
    setFlowSteps(generateFlowSteps(storedFlow, tone));
  }, []);

  useEffect(() => {
    if (userFlowInput) {
      setFlowSteps(generateFlowSteps(userFlowInput, tone));
    }
  }, [tone, userFlowInput]);

  const visibleSteps = useMemo(() => {
    if (filter === "all") return flowSteps;
    return flowSteps
      .map((step) => ({ ...step, states: step.states.filter((s) => s.type === filter) }))
      .filter((step) => step.states.length > 0);
  }, [flowSteps, filter]);

  const { totalCount, criticalCount } = useMemo(() => {
    const all = flowSteps.flatMap((step) => step.states);
    return { totalCount: all.length, criticalCount: all.filter((s) => s.type === "error").length };
  }, [flowSteps]);

  const audit = useMemo(() => {
    if (!userFlowInput) return null;
    return runExpandedAudit(parseUserFlow(userFlowInput));
  }, [userFlowInput]);

  const auditHighCount = audit?.all.filter((i) => i.severity === "high").length ?? 0;

  const auditCategoryLabel = useMemo(() => {
    if (!audit) return "";
    const parts = [
      audit.accessibility.length > 0 && "accessibility",
      audit.aiJourney.length > 0 && "AI journey",
      audit.aiPermissions.length > 0 && "AI permissions",
      audit.gaps.length > 0 && "suggested additions",
    ].filter(Boolean) as string[];
    if (parts.length <= 1) return parts.join("");
    if (parts.length === 2) return parts.join(" and ");
    return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
  }, [audit]);

  const handleEditFlow = () => navigate('/');

  const handleNewFlow = () => {
    sessionStorage.removeItem('userFlow');
    navigate('/');
  };

  const handleExport = async () => {
    const text = flowSteps
      .map((step, i) => {
        const stateLines = step.states
          .map((s) => `  [${s.type}] ${s.title}\n    ${s.microcopy}`)
          .join("\n");
        return `${i + 1}. ${step.stepName} — ${step.stepDescription}\n${stateLines}`;
      })
      .join("\n\n");
    await navigator.clipboard.writeText(`Edgecase — ${userFlowInput}\n\n${text}`);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg-page)]">
      <div className="bg-white border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <button
            onClick={handleNewFlow}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[var(--text-mid)] hover:text-[var(--text-hi)] mb-4 sm:mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            New flow
          </button>

          <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-hi)]">
                  Your edge cases
                </h1>
                {totalCount > 0 && (
                  <span className="text-xs sm:text-sm text-[var(--text-low)]">
                    {totalCount} found
                    {criticalCount > 0 && (
                      <>
                        {" · "}
                        <span className="text-[var(--danger)] font-medium">{criticalCount} critical</span>
                      </>
                    )}
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-[var(--text-mid)] mb-3">
                Contextual states for each step in your user flow
              </p>
              <button
                onClick={handleEditFlow}
                className="group flex items-start gap-2 text-left max-w-full"
                title="Edit this flow"
              >
                <Pencil className="w-3.5 h-3.5 text-[var(--text-low)] group-hover:text-[var(--accent)] flex-shrink-0 mt-0.5 transition-colors" />
                <span className="text-xs sm:text-sm text-[var(--text-low)] group-hover:text-[var(--text-mid)] italic line-clamp-2 transition-colors">
                  "{userFlowInput}"
                </span>
              </button>
            </div>

            <div className="flex flex-col items-stretch sm:items-end gap-3 w-full sm:w-auto">
              <ToneToggle value={tone} onChange={setTone} />
              <button
                onClick={handleExport}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--text-mid)] hover:text-[var(--text-hi)] transition-colors"
              >
                {exported ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[var(--accent)]" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Export all as text
                  </>
                )}
              </button>
            </div>
          </div>

          <div role="group" aria-label="Filter by state type" className="flex flex-wrap gap-2 mt-6">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                aria-pressed={filter === f.value}
                className={`text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${
                  filter === f.value
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "bg-transparent text-[var(--text-mid)] border-[var(--border)] hover:border-[var(--border-strong)] hover:text-[var(--text-hi)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {audit && audit.all.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
          <button
            onClick={() => navigate("/backlog")}
            className="w-full flex items-center justify-between gap-3 rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-4 sm:px-5 py-3.5 sm:py-4 hover:border-[var(--accent)]/50 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[var(--accent-hover)] flex-shrink-0" />
              <span className="text-sm sm:text-base font-medium text-[var(--text-hi)]">
                AI design backlog: {audit.all.length} finding{audit.all.length === 1 ? "" : "s"} across {auditCategoryLabel}
                {auditHighCount > 0 && <span className="text-[var(--danger)]"> · {auditHighCount} high priority</span>}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent-hover)] flex-shrink-0">
              View backlog
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      )}

      <div
        className={`max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 ${
          visibleSteps.length > 1 ? "lg:grid lg:grid-cols-[180px_1fr] lg:gap-10" : ""
        }`}
      >
        {visibleSteps.length > 1 && (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-medium text-[var(--text-low)] mb-3">On this flow</p>
              <nav className="flex flex-col gap-1">
                {visibleSteps.map((step, i) => (
                  <a
                    key={i}
                    href={`#step-${i}`}
                    className="text-xs text-[var(--text-mid)] hover:text-[var(--accent)] truncate py-1 transition-colors"
                  >
                    {i + 1}. {step.stepName}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

        <div className="min-w-0">
          {visibleSteps.length === 0 && (
            <div className="text-center py-16 sm:py-24">
              <p className="text-sm text-[var(--text-mid)]">
                No {filter !== "all" ? filter.toLowerCase() : ""} states match this filter.
              </p>
            </div>
          )}

          {visibleSteps.map((step, stepIndex) => (
            <section key={stepIndex} id={`step-${stepIndex}`} className="mb-12 sm:mb-16 scroll-mt-20">
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-semibold text-[var(--accent)]">
                      {stepIndex + 1}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-display font-semibold text-[var(--text-hi)]">
                    {step.stepName}
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-[var(--text-mid)] ml-9 sm:ml-11">
                  {step.stepDescription}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {step.states.map((state, stateIndex) => (
                  <StateCard key={stateIndex} state={state} />
                ))}
              </div>
            </section>
          ))}

          {audit && (
            <div className="mt-4 sm:mt-6">
              <AuditSection
                id="accessibility-findings"
                icon={<Accessibility className="w-4 h-4 text-blue-700" />}
                accentClass="bg-blue-500/10"
                title="Accessibility"
                description="WCAG-grounded findings, matched to each step's UI pattern"
                items={audit.accessibility}
                beforeItems={<ImageContrastScanner />}
              />
              <AuditSection
                id="ai-journey-findings"
                icon={<Sparkles className="w-4 h-4 text-purple-700" />}
                accentClass="bg-purple-500/10"
                title="AI journey"
                description="Missing moments in AI-driven steps, per Microsoft HAX and Google PAIR guidelines"
                items={audit.aiJourney}
              />
              <AuditSection
                id="ai-permissions-findings"
                icon={<ShieldCheck className="w-4 h-4 text-teal-700" />}
                accentClass="bg-teal-500/10"
                title="AI permissions"
                description="Consent and data-transparency gaps where AI touches sensitive data"
                items={audit.aiPermissions}
              />
            </div>
          )}

          <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-[var(--border)]">
            <div className="text-center">
              <p className="text-sm sm:text-base text-[var(--text-mid)] mb-4">
                Need more edge cases for a different flow?
              </p>
              <button
                onClick={handleNewFlow}
                className="inline-flex items-center gap-2 bg-[var(--accent)] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-sm sm:text-base"
              >
                Generate new flow
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
