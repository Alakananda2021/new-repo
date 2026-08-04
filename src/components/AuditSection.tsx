import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { BacklogItem } from "../utils/expandedAudit";
import { BacklogItemCard } from "./BacklogItemCard";

interface AuditSectionProps {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  items: BacklogItem[];
  accentClass: string;
  defaultOpen?: boolean;
  beforeItems?: ReactNode;
}

export function AuditSection({ id, icon, title, description, items, accentClass, defaultOpen = false, beforeItems }: AuditSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const highCount = items.filter((i) => i.severity === "high").length;

  if (items.length === 0) return null;

  return (
    <section id={id} className="mb-6 rounded-2xl border border-[var(--border)] bg-white overflow-hidden scroll-mt-20">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`${id}-content`}
        className="w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 text-left hover:bg-[var(--neutral-soft)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${accentClass}`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-semibold text-[var(--text-hi)] text-sm sm:text-base">{title}</h2>
              <span className="text-xs text-[var(--text-low)]">
                {items.length} finding{items.length === 1 ? "" : "s"}
                {highCount > 0 && <span className="text-[var(--danger)] font-medium"> · {highCount} high priority</span>}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-mid)] mt-0.5">{description}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[var(--text-low)] flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div id={`${id}-content`} className="px-4 sm:px-6 pb-5 sm:pb-6">
          {beforeItems}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {items.map((item) => (
              <BacklogItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
