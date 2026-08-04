import type { BacklogItem, BacklogCategory, Severity } from "../utils/expandedAudit";
import { Accessibility, Sparkles, ShieldCheck, Lightbulb } from "lucide-react";

const CATEGORY_STYLES: Record<BacklogCategory, { badge: string; icon: typeof Accessibility; label: string }> = {
  accessibility: { badge: "bg-blue-500/10 text-blue-700 border-blue-500/20", icon: Accessibility, label: "Accessibility" },
  "ai-journey": { badge: "bg-purple-500/10 text-purple-700 border-purple-500/20", icon: Sparkles, label: "AI journey" },
  "ai-permissions": { badge: "bg-teal-500/10 text-teal-700 border-teal-500/20", icon: ShieldCheck, label: "AI permissions" },
  gap: { badge: "bg-orange-500/10 text-orange-700 border-orange-500/20", icon: Lightbulb, label: "Suggested" },
};

const SEVERITY_STYLES: Record<Severity, string> = {
  high: "bg-red-500/10 text-red-700 border-red-500/20",
  medium: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  low: "bg-[var(--neutral-soft)] text-[var(--text-mid)] border-[var(--border-strong)]",
};

interface BacklogItemCardProps {
  item: BacklogItem;
  showCategory?: boolean;
}

export function BacklogItemCard({ item, showCategory = false }: BacklogItemCardProps) {
  const cat = CATEGORY_STYLES[item.category];
  const Icon = cat.icon;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {showCategory && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border ${cat.badge}`}>
              <Icon className="w-3 h-3" />
              {cat.label}
            </span>
          )}
          {item.stepName && (
            <span className="text-xs text-[var(--text-low)]">
              {item.stepIndex !== undefined ? `Step ${item.stepIndex + 1} · ` : ""}
              {item.stepName}
            </span>
          )}
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${SEVERITY_STYLES[item.severity]}`}
          title={`Recommendation score: ${item.score}/100`}
        >
          {item.score}
        </span>
      </div>

      <h3 className="font-semibold text-[var(--text-hi)] text-sm sm:text-base mb-1.5">{item.title}</h3>
      <p className="text-xs sm:text-sm text-[var(--text-mid)] leading-relaxed mb-3">{item.description}</p>

      <div className="pt-3 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--text-low)] leading-relaxed">
          <span className="font-medium text-[var(--text-mid)]">Why: </span>
          {item.why}
        </p>
      </div>
    </div>
  );
}
