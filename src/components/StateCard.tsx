import { useRef, useState } from "react";
import type { State } from "../data/states";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Lock,
  Mail,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Upload,
  ShoppingBag,
  CreditCard,
  Search,
  MessageSquare,
  User,
  ImageIcon,
  Wifi,
  X,
} from "lucide-react";
import html2canvas from "html2canvas";

interface StateCardProps {
  state: State;
}

const CARD_BG = "#ffffff";

export function StateCard({ state }: StateCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const getTypeStyles = () => {
    switch (state.type) {
      case "error":
        return {
          border: "border-red-500/25",
          badge: "bg-red-500/10 text-red-700 border border-red-500/20",
          label: "Error",
        };
      case "edge":
        return {
          border: "border-amber-500/25",
          badge: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
          label: "Edge case",
        };
      case "empty":
        return {
          border: "border-[var(--border-strong)]",
          badge: "bg-[var(--neutral-soft)] text-[var(--text-mid)] border border-[var(--border-strong)]",
          label: "Empty state",
        };
    }
  };

  const handleCopyAsImage = async () => {
    if (!cardRef.current) return;
    try {
      const copyButton = cardRef.current.querySelector(".copy-button") as HTMLElement;
      if (copyButton) copyButton.style.opacity = "0";

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: CARD_BG,
        scale: 2,
        logging: false,
        useCORS: true,
      });

      if (copyButton) copyButton.style.opacity = "1";

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${state.title.replace(/\s+/g, "-").toLowerCase()}.png`;
          link.click();
          URL.revokeObjectURL(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }, "image/png");
    } catch (error) {
      console.error("Failed to copy image:", error);
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div
      ref={cardRef}
      className={`bg-[var(--card)] rounded-xl border ${typeStyles.border} shadow-sm hover:border-[var(--accent)]/30 transition-colors overflow-hidden relative group`}
    >
      <button
        onClick={handleCopyAsImage}
        aria-label={copied ? "Copied as image" : "Copy as image"}
        title="Copy as image"
        className="copy-button absolute top-4 right-4 z-10 p-2 bg-[var(--neutral-soft)]/90 backdrop-blur-sm border border-[var(--border-strong)] rounded-lg opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:border-[var(--accent)]/40 transition-all shadow-sm"
      >
        {copied ? (
          <Check className="w-4 h-4 text-[var(--accent)]" />
        ) : (
          <Copy className="w-4 h-4 text-[var(--text-mid)]" />
        )}
      </button>

      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3 gap-2">
          <h3 className="font-semibold text-[var(--text-hi)] flex-1 text-sm sm:text-base pr-8">
            {state.title}
          </h3>
          <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap flex-shrink-0 ${typeStyles.badge}`}>
            {typeStyles.label}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-mid)] mb-4 leading-relaxed">
          {state.microcopy}
        </p>

        {state.cta && (
          <span className="block text-xs sm:text-sm font-medium text-[var(--accent)]">
            {state.cta} →
          </span>
        )}
      </div>

      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <PreviewComponent variant={state.preview} type={state.type} />
      </div>
    </div>
  );
}

interface PreviewProps {
  variant: State["preview"];
  type: State["type"];
}

function PreviewComponent({ variant, type }: PreviewProps) {
  const isError = type === "error";

  switch (variant) {

    // ── Upload ────────────────────────────────────────────────────────────────

    case "upload-zone":
      return (
        <div className="border-2 border-dashed border-[var(--border-strong)] rounded-lg p-6 sm:p-8 flex flex-col items-center gap-3 bg-[var(--neutral-soft)]">
          <div className="w-12 h-12 rounded-full bg-[var(--card)] border-2 border-[var(--border)] flex items-center justify-center shadow-sm">
            <Upload className="w-5 h-5 text-[var(--text-low)]" />
          </div>
          <div className="space-y-1.5 text-center w-full">
            <div className="h-2 bg-[var(--border-strong)] rounded w-32 mx-auto" />
            <div className="h-1.5 bg-[var(--border)] rounded w-24 mx-auto" />
          </div>
          <div className="h-7 bg-[var(--accent)]/15 rounded-lg w-28 border border-[var(--accent)]/30" />
        </div>
      );

    case "upload-error":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg border border-[var(--border)] p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="h-1.5 bg-[var(--border-strong)] rounded w-3/4" />
              <div className="w-full bg-[var(--border)] rounded-full h-1.5">
                <div className="bg-red-500 h-1.5 rounded-full w-2/3" />
              </div>
            </div>
            <X className="w-4 h-4 text-red-600 flex-shrink-0" />
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
            <div className="h-1.5 bg-red-500/20 rounded w-1/2" />
          </div>
        </div>
      );

    // ── Auth ──────────────────────────────────────────────────────────────────

    case "signup-form":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg border border-[var(--border)] p-4 space-y-3">
          <div className="space-y-1.5">
            <div className="h-1.5 bg-[var(--border-strong)] rounded w-10" />
            <div className="h-8 bg-[var(--card)] border border-[var(--border-strong)] rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 bg-[var(--border-strong)] rounded w-14" />
            <div className="h-8 bg-[var(--card)] border border-[var(--border-strong)] rounded-lg" />
          </div>
          <div className="h-8 bg-[var(--accent)] rounded-lg" />
        </div>
      );

    // ── Commerce ──────────────────────────────────────────────────────────────

    case "cart-empty":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg border border-[var(--border)] p-6 sm:p-8 flex flex-col items-center gap-3">
          <ShoppingBag className="w-12 h-12 text-[var(--text-low)]" strokeWidth={1.5} />
          <div className="space-y-1.5 w-full text-center">
            <div className="h-2 bg-[var(--border-strong)] rounded w-2/3 mx-auto" />
            <div className="h-1.5 bg-[var(--border)] rounded w-1/2 mx-auto" />
          </div>
          <div className="h-7 bg-[var(--accent)]/15 rounded-lg w-28 border border-[var(--accent)]/30" />
        </div>
      );

    case "payment-declined":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg border border-[var(--border)] p-4 space-y-3">
          <div className="space-y-1.5">
            <div className="h-1.5 bg-[var(--border-strong)] rounded w-16" />
            <div className="h-9 bg-[var(--card)] border-2 border-red-500/60 rounded-lg px-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-red-600 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 bg-[var(--border-strong)] rounded w-1/2" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
              <div className="h-1.5 bg-red-500/20 rounded w-3/5" />
            </div>
          </div>
          <div className="h-8 bg-[var(--border)] rounded-lg opacity-50" />
        </div>
      );

    case "outofstock":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg border border-[var(--border)] p-3 flex gap-3">
          <div className="w-16 h-16 bg-[var(--border)] rounded-lg flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-semibold text-center leading-tight">Sold out</span>
            </div>
          </div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-2 bg-[var(--border-strong)] rounded w-3/4" />
            <div className="h-1.5 bg-[var(--border)] rounded w-1/2" />
            <div className="h-2 bg-[var(--border-strong)] rounded w-1/4" />
            <div className="h-6 bg-[var(--border)] rounded w-20 opacity-40" />
          </div>
        </div>
      );

    // ── Search ────────────────────────────────────────────────────────────────

    case "search-no-results":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg border border-[var(--border)] p-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 h-9 bg-[var(--card)] border border-[var(--border-strong)] rounded-lg flex items-center px-3 gap-2">
              <Search className="w-3.5 h-3.5 text-[var(--text-low)] flex-shrink-0" />
              <div className="h-1.5 bg-[var(--border)] rounded flex-1" />
            </div>
            <div className="w-16 h-9 bg-[var(--border)] rounded-lg" />
          </div>
          <div className="flex flex-col items-center py-4 gap-2">
            <Search className="w-8 h-8 text-[var(--border-strong)]" strokeWidth={1.5} />
            <div className="h-1.5 bg-[var(--border)] rounded w-28" />
            <div className="h-1.5 bg-[var(--border)] rounded w-20" />
          </div>
        </div>
      );

    // ── Scheduling ────────────────────────────────────────────────────────────

    case "calendar-empty":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg border border-[var(--border)] p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="h-2 bg-[var(--border-strong)] rounded w-20" />
            <div className="flex gap-1.5">
              <div className="w-6 h-6 bg-[var(--border)] rounded" />
              <div className="w-6 h-6 bg-[var(--border)] rounded" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["M","T","W","T","F","S","S"].map((d, i) => (
              <div key={i} className="h-5 bg-[var(--border)] rounded flex items-center justify-center">
                <span className="text-[var(--text-low)]" style={{ fontSize: "9px" }}>{d}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className="h-5 bg-[var(--neutral-soft)] rounded border border-[var(--border)]" />
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            <div className="h-1.5 bg-[var(--border)] rounded w-full" />
            <div className="h-1.5 bg-[var(--border)] rounded w-3/4" />
          </div>
        </div>
      );

    case "calendar-conflict":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg border border-[var(--border)] p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="h-2 bg-[var(--border-strong)] rounded w-20" />
            <div className="flex gap-1.5">
              <div className="w-6 h-6 bg-[var(--border)] rounded" />
              <div className="w-6 h-6 bg-[var(--border)] rounded" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["M","T","W","T","F","S","S"].map((d, i) => (
              <div key={i} className="h-5 bg-[var(--border)] rounded flex items-center justify-center">
                <span className="text-[var(--text-low)]" style={{ fontSize: "9px" }}>{d}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className={`h-5 rounded border ${
                  i === 9
                    ? "bg-red-500/15 border-red-500/40"
                    : i === 10
                    ? "bg-amber-500/15 border-amber-500/40"
                    : "bg-[var(--neutral-soft)] border-[var(--border)]"
                }`}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
            <div className="h-1.5 bg-red-500/20 rounded w-1/2" />
          </div>
        </div>
      );

    case "booking-taken":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg border border-[var(--border)] p-4 space-y-2">
          {[false, true, false].map((taken, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-2.5 rounded-lg border ${
                taken ? "bg-red-500/10 border-red-500/30" : "bg-[var(--card)] border-[var(--border)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className={`w-3.5 h-3.5 ${taken ? "text-red-600" : "text-[var(--text-low)]"}`} />
                <div className={`h-1.5 rounded w-12 ${taken ? "bg-red-500/25" : "bg-[var(--border-strong)]"}`} />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                taken ? "bg-red-500/15 text-red-700" : "bg-[var(--accent)]/15 text-[var(--accent)]"
              }`} style={{ fontSize: "10px" }}>
                {taken ? "Taken" : "Open"}
              </span>
            </div>
          ))}
        </div>
      );

    // ── Messaging ─────────────────────────────────────────────────────────────

    case "chat-empty":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="bg-[var(--card)] border-b border-[var(--border)] px-3 py-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--border)]" />
            <div className="h-1.5 bg-[var(--border-strong)] rounded w-20" />
          </div>
          <div className="p-4 flex flex-col items-center gap-2 py-6">
            <MessageSquare className="w-10 h-10 text-[var(--border-strong)]" strokeWidth={1.5} />
            <div className="h-1.5 bg-[var(--border)] rounded w-28" />
            <div className="h-1.5 bg-[var(--border)] rounded w-20" />
          </div>
          <div className="bg-[var(--card)] border-t border-[var(--border)] px-3 py-2 flex items-center gap-2">
            <div className="flex-1 h-7 bg-[var(--neutral-soft)] rounded-full border border-[var(--border)]" />
            <div className="w-7 h-7 rounded-full bg-[var(--accent)]/15 flex items-center justify-center">
              <div className="w-3 h-3 bg-[var(--accent)] rounded-sm" />
            </div>
          </div>
        </div>
      );

    // ── Social ────────────────────────────────────────────────────────────────

    case "post-feed-empty":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg border border-[var(--border)] p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-[var(--border)]" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 bg-[var(--border-strong)] rounded w-24" />
              <div className="h-1 bg-[var(--border)] rounded w-16" />
            </div>
          </div>
          <div className="h-20 bg-[var(--card)] border border-dashed border-[var(--border-strong)] rounded-lg flex flex-col items-center justify-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-[var(--neutral-soft)] flex items-center justify-center">
              <span className="text-[var(--text-low)] text-sm font-bold">+</span>
            </div>
            <div className="h-1.5 bg-[var(--border)] rounded w-24" />
          </div>
          <div className="flex gap-3">
            <div className="h-1.5 bg-[var(--border)] rounded w-12" />
            <div className="h-1.5 bg-[var(--border)] rounded w-12" />
          </div>
        </div>
      );

    // ── Profile ───────────────────────────────────────────────────────────────

    case "profile-incomplete":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg border border-[var(--border)] p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--border)] flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-[var(--text-low)]" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="h-2 bg-[var(--border-strong)] rounded w-24" />
              <div className="h-1.5 bg-[var(--border)] rounded w-16" />
            </div>
          </div>
          {[["Name", true], ["Bio", false], ["Location", false]].map(([, filled], i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${filled ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
                <div className={`h-1.5 rounded w-12 ${filled ? "bg-[var(--border-strong)]" : "bg-[var(--border)]"}`} />
              </div>
              {!filled && <div className="h-1.5 bg-amber-500/25 rounded w-16" />}
            </div>
          ))}
        </div>
      );

    // ── Existing generic variants ─────────────────────────────────────────────

    case "empty-list":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg p-4 sm:p-8 border border-[var(--border)]">
          <div className="space-y-2 sm:space-y-3">
            {[0.5, 0.35, 0.2].map((opacity, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3" style={{ opacity }}>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-[var(--border-strong)] flex-shrink-0" />
                <div className="flex-1 space-y-1 sm:space-y-1.5">
                  <div className="h-1.5 sm:h-2 bg-[var(--border-strong)] rounded w-3/4" />
                  <div className="h-1.5 sm:h-2 bg-[var(--border-strong)] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "modal-error":
      return (
        <div className="bg-[var(--card)] rounded-lg border-2 border-[var(--border-strong)] shadow-lg p-4 sm:p-6">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${isError ? "bg-red-500/15" : "bg-amber-500/15"}`}>
              <XCircle className={`w-5 h-5 sm:w-6 sm:h-6 ${isError ? "text-red-600" : "text-amber-600"}`} />
            </div>
            <div className="space-y-1 sm:space-y-1.5 w-full">
              <div className="h-1.5 sm:h-2 bg-[var(--border-strong)] rounded w-2/3 mx-auto" />
              <div className="h-1.5 sm:h-2 bg-[var(--border)] rounded w-full" />
              <div className="h-1.5 sm:h-2 bg-[var(--border)] rounded w-4/5 mx-auto" />
            </div>
            <div className={`h-7 sm:h-8 rounded w-20 sm:w-24 ${isError ? "bg-red-500" : "bg-amber-500"}`} />
          </div>
        </div>
      );

    case "inline-banner":
      return (
        <div className={`rounded-r-lg p-3 sm:p-4 border-l-4 ${isError ? "bg-red-500/10 border-red-500" : "bg-amber-500/10 border-amber-500"}`}>
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 ${isError ? "text-red-600" : "text-amber-600"}`} />
            <div className="flex-1 space-y-1.5 sm:space-y-2">
              <div className={`h-1.5 sm:h-2 rounded w-full ${isError ? "bg-red-500/30" : "bg-amber-500/30"}`} />
              <div className={`h-1.5 sm:h-2 rounded w-4/5 ${isError ? "bg-red-500/30" : "bg-amber-500/30"}`} />
            </div>
          </div>
        </div>
      );

    case "toast":
      return (
        <div className="flex justify-end">
          <div className="bg-[var(--neutral-soft)] border border-[var(--border-strong)] text-[var(--text-hi)] rounded-lg shadow-xl p-3 sm:p-4 max-w-xs w-full">
            <div className="flex items-start gap-2 sm:gap-3">
              <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 sm:space-y-1.5 flex-1">
                <div className="h-1.5 sm:h-2 bg-[var(--border-strong)] rounded w-full" />
                <div className="h-1.5 sm:h-2 bg-[var(--border-strong)] rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      );

    case "form-error":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg border border-[var(--border)] p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="h-1.5 sm:h-2 bg-[var(--border-strong)] rounded w-16 sm:w-20" />
            <div className="h-8 sm:h-9 bg-[var(--card)] border-2 border-red-500/60 rounded px-3 flex items-center">
              <div className="h-1.5 sm:h-2 bg-[var(--border-strong)] rounded w-3/4" />
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600 flex-shrink-0" />
              <div className="h-1 sm:h-1.5 bg-red-500/30 rounded w-2/3" />
            </div>
          </div>
        </div>
      );

    case "empty-inbox":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg p-6 sm:p-8 border border-[var(--border)]">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
            <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--border-strong)]" strokeWidth={1.5} />
            <div className="space-y-1 sm:space-y-1.5 w-full">
              <div className="h-1.5 sm:h-2 bg-[var(--border-strong)] rounded w-2/3 mx-auto" />
              <div className="h-1.5 sm:h-2 bg-[var(--border)] rounded w-1/2 mx-auto" />
            </div>
          </div>
        </div>
      );

    case "confirmation-modal":
      return (
        <div className="bg-[var(--card)] rounded-lg border-2 border-[var(--border-strong)] shadow-lg p-4 sm:p-6">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--accent)]/15 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent)]" />
            </div>
            <div className="space-y-1 sm:space-y-1.5 w-full">
              <div className="h-1.5 sm:h-2 bg-[var(--border-strong)] rounded w-3/4 mx-auto" />
              <div className="h-1.5 sm:h-2 bg-[var(--border)] rounded w-full" />
            </div>
            <div className="h-7 sm:h-8 bg-[var(--accent)] rounded w-24 sm:w-28" />
          </div>
        </div>
      );

    case "locked-feature":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg border-2 border-dashed border-[var(--border-strong)] p-6 sm:p-8">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--border)] flex items-center justify-center">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--text-low)]" />
            </div>
            <div className="space-y-1 sm:space-y-1.5 w-full">
              <div className="h-1.5 sm:h-2 bg-[var(--border-strong)] rounded w-2/3 mx-auto" />
              <div className="h-1.5 sm:h-2 bg-[var(--border)] rounded w-1/2 mx-auto" />
            </div>
            <div className="h-6 sm:h-7 bg-amber-500 rounded w-20 sm:w-24" />
          </div>
        </div>
      );

    case "countdown-timer":
      return (
        <div className="bg-amber-500/10 rounded-lg border border-amber-500/25 p-4 sm:p-6">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
            <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
            <div className="space-y-1.5 sm:space-y-2 w-full">
              <div className="h-7 sm:h-8 w-16 sm:w-20 bg-amber-500/20 rounded mx-auto flex items-center justify-center">
                <span className="text-xs font-semibold text-amber-800">9:42</span>
              </div>
              <div className="h-1.5 sm:h-2 bg-amber-500/20 rounded w-3/4 mx-auto" />
            </div>
          </div>
        </div>
      );

    case "loading-skeleton":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg border border-[var(--border)] p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--border-strong)] animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1.5 sm:space-y-2">
              <div className="h-2.5 sm:h-3 bg-[var(--border-strong)] rounded w-3/4 animate-pulse" />
              <div className="h-1.5 sm:h-2 bg-[var(--border-strong)] rounded w-1/2 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="h-1.5 sm:h-2 bg-[var(--border-strong)] rounded w-full animate-pulse" />
            <div className="h-1.5 sm:h-2 bg-[var(--border-strong)] rounded w-5/6 animate-pulse" />
          </div>
        </div>
      );

    case "duplicate-item":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg border border-[var(--border)] p-3 sm:p-4 space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-2 sm:gap-3 p-2 bg-[var(--card)] rounded border border-[var(--border-strong)]">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-[var(--border-strong)] flex-shrink-0" />
            <div className="flex-1 h-1.5 sm:h-2 bg-[var(--border-strong)] rounded" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 p-2 bg-amber-500/10 rounded border-2 border-amber-500/40">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-amber-500/25 flex-shrink-0" />
            <div className="flex-1 h-1.5 sm:h-2 bg-amber-500/25 rounded" />
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          </div>
        </div>
      );

    case "disabled-state":
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg border border-[var(--border)] p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3 opacity-40">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-1.5 sm:h-2 bg-[var(--border-strong)] rounded w-1/3" />
                <div className="w-8 h-4 sm:w-10 sm:h-5 bg-[var(--border-strong)] rounded-full" />
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="bg-[var(--neutral-soft)] rounded-lg p-4 sm:p-6 border border-[var(--border)]">
          <div className="flex flex-col items-center justify-center text-center space-y-2 sm:space-y-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${isError ? "bg-red-500/15" : "bg-amber-500/15"}`}>
              <AlertCircle className={`w-5 h-5 ${isError ? "text-red-600" : "text-amber-600"}`} />
            </div>
            <div className="space-y-1 sm:space-y-1.5 w-full">
              <div className="h-1.5 sm:h-2 bg-[var(--border-strong)] rounded w-3/4 mx-auto" />
              <div className="h-1.5 sm:h-2 bg-[var(--border)] rounded w-1/2 mx-auto" />
            </div>
          </div>
        </div>
      );
  }
}
