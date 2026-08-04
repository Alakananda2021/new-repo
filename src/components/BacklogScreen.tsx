import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Check, Copy, Accessibility, Sparkles, ShieldCheck, Lightbulb } from "lucide-react";
import { parseUserFlow } from "../utils/flowParser";
import { runExpandedAudit, type BacklogCategory, type BacklogItem } from "../utils/expandedAudit";
import { BacklogItemCard } from "./BacklogItemCard";

type FilterType = "all" | BacklogCategory;

const FILTERS: { value: FilterType; label: string; icon: typeof Accessibility }[] = [
  { value: "all", label: "All", icon: Sparkles },
  { value: "accessibility", label: "Accessibility", icon: Accessibility },
  { value: "ai-journey", label: "AI journey", icon: Sparkles },
  { value: "ai-permissions", label: "AI permissions", icon: ShieldCheck },
  { value: "gap", label: "Suggested", icon: Lightbulb },
];

export function BacklogScreen() {
  const navigate = useNavigate();
  const [userFlowInput, setUserFlowInput] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [exported, setExported] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const storedFlow = sessionStorage.getItem("userFlow");
    if (!storedFlow) {
      navigate("/");
      return;
    }
    setUserFlowInput(storedFlow);
  }, [navigate]);

  const audit = useMemo(() => {
    if (!userFlowInput) return null;
    return runExpandedAudit(parseUserFlow(userFlowInput));
  }, [userFlowInput]);

  const visibleItems: BacklogItem[] = useMemo(() => {
    if (!audit) return [];
    if (filter === "all") return audit.all;
    return audit.all.filter((i) => i.category === filter);
  }, [audit, filter]);

  const counts = useMemo(() => {
    if (!audit) return { high: 0, medium: 0, low: 0 };
    return {
      high: audit.all.filter((i) => i.severity === "high").length,
      medium: audit.all.filter((i) => i.severity === "medium").length,
      low: audit.all.filter((i) => i.severity === "low").length,
    };
  }, [audit]);

  const handleExport = async () => {
    if (!audit) return;
    const text = visibleItems
      .map((i) => {
        const step = i.stepName ? ` (Step ${i.stepIndex !== undefined ? i.stepIndex + 1 : "?"}: ${i.stepName})` : "";
        return `[${i.score}/100 · ${i.severity}] ${i.category} — ${i.title}${step}\n  ${i.description}\n  Why: ${i.why}`;
      })
      .join("\n\n");
    await navigator.clipboard.writeText(`Edgecase — AI Design Backlog\n"${userFlowInput}"\n\n${text}`);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  if (!audit) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg-page)]">
      <div className="bg-white border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <button
            onClick={() => navigate("/results")}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[var(--text-mid)] hover:text-[var(--text-hi)] mb-4 sm:mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Back to results
          </button>

          <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-hi)] mb-2">
                AI design backlog
              </h1>
              <p className="text-sm sm:text-base text-[var(--text-mid)] mb-1">
                Every accessibility, AI-journey, and AI-permissions finding for this flow — plus gaps the flow doesn't cover at all — ranked by recommendation score.
              </p>
              <p className="text-xs sm:text-sm text-[var(--text-low)] italic line-clamp-1">"{userFlowInput}"</p>
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium text-[var(--text-mid)] hover:text-[var(--text-hi)] transition-colors flex-shrink-0"
            >
              {exported ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[var(--accent)]" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Export as text
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mt-6 mb-5">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[var(--text-mid)]">{counts.high} high</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[var(--text-mid)]">{counts.medium} medium</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--border-strong)]" />
              <span className="text-[var(--text-mid)]">{counts.low} low</span>
            </div>
          </div>

          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const Icon = f.icon;
              const count = f.value === "all" ? audit.all.length : audit.all.filter((i) => i.category === f.value).length;
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  aria-pressed={filter === f.value}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border transition-colors ${
                    filter === f.value
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-transparent text-[var(--text-mid)] border-[var(--border)] hover:border-[var(--border-strong)] hover:text-[var(--text-hi)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {f.label}
                  <span>({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {visibleItems.length === 0 ? (
          <div className="text-center py-16 sm:py-24">
            <p className="text-sm text-[var(--text-mid)]">No findings in this category for this flow.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {visibleItems.map((item) => (
              <BacklogItemCard key={item.id} item={item} showCategory />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
