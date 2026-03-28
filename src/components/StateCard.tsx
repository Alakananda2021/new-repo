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

export function StateCard({ state }: StateCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const getTypeStyles = () => {
    switch (state.type) {
      case "error":
        return { border: "border-red-200", badge: "bg-red-100 text-red-700", label: "Error" };
      case "edge":
        return { border: "border-amber-200", badge: "bg-amber-100 text-amber-700", label: "Edge case" };
      case "empty":
        return { border: "border-gray-200", badge: "bg-gray-100 text-gray-700", label: "Empty state" };
    }
  };

  const handleCopyAsImage = async () => {
    if (!cardRef.current) return;
    try {
      const copyButton = cardRef.current.querySelector(".copy-button") as HTMLElement;
      if (copyButton) copyButton.style.opacity = "0";

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
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
      className={`bg-white rounded-xl border ${typeStyles.border} shadow-sm hover:shadow-md transition-shadow overflow-hidden relative group`}
    >
      <button
        onClick={handleCopyAsImage}
        className="copy-button absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-all shadow-sm"
        title="Copy as image"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4 text-gray-600" />
        )}
      </button>

      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3 gap-2">
          <h3 className="font-semibold text-gray-900 flex-1 text-sm sm:text-base pr-8">
            {state.title}
          </h3>
          <span className={`text-xs font-medium px-2 py-1 rounded ${typeStyles.badge} whitespace-nowrap flex-shrink-0`}>
            {typeStyles.label}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
          {state.microcopy}
        </p>

        {state.cta && (
          <button className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
            {state.cta} →
          </button>
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
  const errColor = type === "error" ? "red" : "amber";

  switch (variant) {

    // ── Upload ────────────────────────────────────────────────────────────────

    case "upload-zone":
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 flex flex-col items-center gap-3 bg-gray-50">
          <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
            <Upload className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-1.5 text-center w-full">
            <div className="h-2 bg-gray-300 rounded w-32 mx-auto" />
            <div className="h-1.5 bg-gray-200 rounded w-24 mx-auto" />
          </div>
          <div className="h-7 bg-indigo-100 rounded-lg w-28 border border-indigo-200" />
        </div>
      );

    case "upload-error":
      return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="h-1.5 bg-gray-300 rounded w-3/4" />
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-red-400 h-1.5 rounded-full w-2/3" />
              </div>
            </div>
            <X className="w-4 h-4 text-red-400 flex-shrink-0" />
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <div className="h-1.5 bg-red-200 rounded w-1/2" />
          </div>
        </div>
      );

    // ── Auth ──────────────────────────────────────────────────────────────────

    case "signup-form":
      return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="space-y-1.5">
            <div className="h-1.5 bg-gray-300 rounded w-10" />
            <div className="h-8 bg-white border border-gray-300 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 bg-gray-300 rounded w-14" />
            <div className="h-8 bg-white border border-gray-300 rounded-lg" />
          </div>
          <div className="h-8 bg-indigo-500 rounded-lg" />
        </div>
      );

    // ── Commerce ──────────────────────────────────────────────────────────────

    case "cart-empty":
      return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 sm:p-8 flex flex-col items-center gap-3">
          <ShoppingBag className="w-12 h-12 text-gray-300" strokeWidth={1.5} />
          <div className="space-y-1.5 w-full text-center">
            <div className="h-2 bg-gray-300 rounded w-2/3 mx-auto" />
            <div className="h-1.5 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
          <div className="h-7 bg-indigo-100 rounded-lg w-28 border border-indigo-200" />
        </div>
      );

    case "payment-declined":
      return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="space-y-1.5">
            <div className="h-1.5 bg-gray-300 rounded w-16" />
            <div className="h-9 bg-white border-2 border-red-400 rounded-lg px-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-red-400 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 bg-gray-300 rounded w-1/2" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <div className="h-1.5 bg-red-200 rounded w-3/5" />
            </div>
          </div>
          <div className="h-8 bg-gray-200 rounded-lg opacity-50" />
        </div>
      );

    case "outofstock":
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-3 flex gap-3">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
              <span className="text-white text-xs font-semibold text-center leading-tight">Sold out</span>
            </div>
          </div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-2 bg-gray-300 rounded w-3/4" />
            <div className="h-1.5 bg-gray-200 rounded w-1/2" />
            <div className="h-2 bg-gray-300 rounded w-1/4" />
            <div className="h-6 bg-gray-200 rounded w-20 opacity-40" />
          </div>
        </div>
      );

    // ── Search ────────────────────────────────────────────────────────────────

    case "search-no-results":
      return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 h-9 bg-white border border-gray-300 rounded-lg flex items-center px-3 gap-2">
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <div className="h-1.5 bg-gray-200 rounded flex-1" />
            </div>
            <div className="w-16 h-9 bg-gray-200 rounded-lg" />
          </div>
          <div className="flex flex-col items-center py-4 gap-2">
            <Search className="w-8 h-8 text-gray-200" strokeWidth={1.5} />
            <div className="h-1.5 bg-gray-200 rounded w-28" />
            <div className="h-1.5 bg-gray-200 rounded w-20" />
          </div>
        </div>
      );

    // ── Scheduling ────────────────────────────────────────────────────────────

    case "calendar-empty":
      return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="h-2 bg-gray-300 rounded w-20" />
            <div className="flex gap-1.5">
              <div className="w-6 h-6 bg-gray-200 rounded" />
              <div className="w-6 h-6 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["M","T","W","T","F","S","S"].map((d, i) => (
              <div key={i} className="h-5 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400" style={{ fontSize: "9px" }}>{d}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className="h-5 bg-gray-100 rounded border border-gray-200" />
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            <div className="h-1.5 bg-gray-200 rounded w-full" />
            <div className="h-1.5 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      );

    case "calendar-conflict":
      return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="h-2 bg-gray-300 rounded w-20" />
            <div className="flex gap-1.5">
              <div className="w-6 h-6 bg-gray-200 rounded" />
              <div className="w-6 h-6 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["M","T","W","T","F","S","S"].map((d, i) => (
              <div key={i} className="h-5 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400" style={{ fontSize: "9px" }}>{d}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className={`h-5 rounded border ${
                  i === 9
                    ? "bg-red-100 border-red-300"
                    : i === 10
                    ? "bg-amber-100 border-amber-300"
                    : "bg-gray-100 border-gray-200"
                }`}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <div className="h-1.5 bg-red-200 rounded w-1/2" />
          </div>
        </div>
      );

    case "booking-taken":
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
          {[false, true, false].map((taken, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-2.5 rounded-lg border ${
                taken ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className={`w-3.5 h-3.5 ${taken ? "text-red-400" : "text-gray-400"}`} />
                <div className={`h-1.5 rounded w-12 ${taken ? "bg-red-200" : "bg-gray-300"}`} />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                taken ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
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
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200" />
            <div className="h-1.5 bg-gray-300 rounded w-20" />
          </div>
          <div className="p-4 flex flex-col items-center gap-2 py-6">
            <MessageSquare className="w-10 h-10 text-gray-200" strokeWidth={1.5} />
            <div className="h-1.5 bg-gray-200 rounded w-28" />
            <div className="h-1.5 bg-gray-200 rounded w-20" />
          </div>
          <div className="bg-white border-t border-gray-200 px-3 py-2 flex items-center gap-2">
            <div className="flex-1 h-7 bg-gray-100 rounded-full border border-gray-200" />
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
              <div className="w-3 h-3 bg-indigo-400 rounded-sm" />
            </div>
          </div>
        </div>
      );

    // ── Social ────────────────────────────────────────────────────────────────

    case "post-feed-empty":
      return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 bg-gray-300 rounded w-24" />
              <div className="h-1 bg-gray-200 rounded w-16" />
            </div>
          </div>
          <div className="h-20 bg-white border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-sm font-bold">+</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded w-24" />
          </div>
          <div className="flex gap-3">
            <div className="h-1.5 bg-gray-200 rounded w-12" />
            <div className="h-1.5 bg-gray-200 rounded w-12" />
          </div>
        </div>
      );

    // ── Profile ───────────────────────────────────────────────────────────────

    case "profile-incomplete":
      return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="h-2 bg-gray-300 rounded w-24" />
              <div className="h-1.5 bg-gray-200 rounded w-16" />
            </div>
          </div>
          {[["Name", true], ["Bio", false], ["Location", false]].map(([, filled], i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${filled ? "bg-green-400" : "bg-gray-200"}`} />
                <div className={`h-1.5 rounded w-12 ${filled ? "bg-gray-300" : "bg-gray-200"}`} />
              </div>
              {!filled && <div className="h-1.5 bg-amber-200 rounded w-16" />}
            </div>
          ))}
        </div>
      );

    // ── Existing generic variants ─────────────────────────────────────────────

    case "empty-list":
      return (
        <div className="bg-gray-50 rounded-lg p-4 sm:p-8 border border-gray-200">
          <div className="space-y-2 sm:space-y-3">
            {[0.3, 0.2, 0.1].map((opacity, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3" style={{ opacity }}>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-gray-300 flex-shrink-0" />
                <div className="flex-1 space-y-1 sm:space-y-1.5">
                  <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-3/4" />
                  <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "modal-error":
      return (
        <div className="bg-white rounded-lg border-2 border-gray-300 shadow-lg p-4 sm:p-6">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-${errColor}-100 flex items-center justify-center`}>
              <XCircle className={`w-5 h-5 sm:w-6 sm:h-6 text-${errColor}-600`} />
            </div>
            <div className="space-y-1 sm:space-y-1.5 w-full">
              <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-2/3 mx-auto" />
              <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-full" />
              <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-4/5 mx-auto" />
            </div>
            <div className={`h-7 sm:h-8 bg-${errColor}-500 rounded w-20 sm:w-24`} />
          </div>
        </div>
      );

    case "inline-banner":
      return (
        <div className={`bg-${errColor}-50 border-l-4 border-${errColor}-400 rounded-r-lg p-3 sm:p-4`}>
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className={`w-4 h-4 sm:w-5 sm:h-5 text-${errColor}-600 mt-0.5 flex-shrink-0`} />
            <div className="flex-1 space-y-1.5 sm:space-y-2">
              <div className={`h-1.5 sm:h-2 bg-${errColor}-300 rounded w-full`} />
              <div className={`h-1.5 sm:h-2 bg-${errColor}-300 rounded w-4/5`} />
            </div>
          </div>
        </div>
      );

    case "toast":
      return (
        <div className="flex justify-end">
          <div className="bg-gray-900 text-white rounded-lg shadow-xl p-3 sm:p-4 max-w-xs w-full">
            <div className="flex items-start gap-2 sm:gap-3">
              <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 sm:space-y-1.5 flex-1">
                <div className="h-1.5 sm:h-2 bg-gray-700 rounded w-full" />
                <div className="h-1.5 sm:h-2 bg-gray-700 rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      );

    case "form-error":
      return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-16 sm:w-20" />
            <div className="h-8 sm:h-9 bg-white border-2 border-red-400 rounded px-3 flex items-center">
              <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-3/4" />
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 flex-shrink-0" />
              <div className="h-1 sm:h-1.5 bg-red-300 rounded w-2/3" />
            </div>
          </div>
        </div>
      );

    case "empty-inbox":
      return (
        <div className="bg-gray-50 rounded-lg p-6 sm:p-8 border border-gray-200">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
            <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" strokeWidth={1.5} />
            <div className="space-y-1 sm:space-y-1.5 w-full">
              <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-2/3 mx-auto" />
              <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-1/2 mx-auto" />
            </div>
          </div>
        </div>
      );

    case "confirmation-modal":
      return (
        <div className="bg-white rounded-lg border-2 border-gray-300 shadow-lg p-4 sm:p-6">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="space-y-1 sm:space-y-1.5 w-full">
              <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-3/4 mx-auto" />
              <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-full" />
            </div>
            <div className="h-7 sm:h-8 bg-indigo-500 rounded w-24 sm:w-28" />
          </div>
        </div>
      );

    case "locked-feature":
      return (
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 sm:p-8">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </div>
            <div className="space-y-1 sm:space-y-1.5 w-full">
              <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-2/3 mx-auto" />
              <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-1/2 mx-auto" />
            </div>
            <div className="h-6 sm:h-7 bg-amber-400 rounded w-20 sm:w-24" />
          </div>
        </div>
      );

    case "countdown-timer":
      return (
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 sm:p-6">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
            <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />
            <div className="space-y-1.5 sm:space-y-2 w-full">
              <div className="h-7 sm:h-8 w-16 sm:w-20 bg-amber-200 rounded mx-auto flex items-center justify-center">
                <span className="text-xs font-mono text-amber-700">9:42</span>
              </div>
              <div className="h-1.5 sm:h-2 bg-amber-200 rounded w-3/4 mx-auto" />
            </div>
          </div>
        </div>
      );

    case "loading-skeleton":
      return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1.5 sm:space-y-2">
              <div className="h-2.5 sm:h-3 bg-gray-300 rounded w-3/4 animate-pulse" />
              <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-1/2 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-full animate-pulse" />
            <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-5/6 animate-pulse" />
          </div>
        </div>
      );

    case "duplicate-item":
      return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4 space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-2 sm:gap-3 p-2 bg-white rounded border border-gray-300">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-gray-300 flex-shrink-0" />
            <div className="flex-1 h-1.5 sm:h-2 bg-gray-300 rounded" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 p-2 bg-amber-100 rounded border-2 border-amber-400">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-amber-300 flex-shrink-0" />
            <div className="flex-1 h-1.5 sm:h-2 bg-amber-300 rounded" />
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          </div>
        </div>
      );

    case "disabled-state":
      return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3 opacity-40">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-1/3" />
                <div className="w-8 h-4 sm:w-10 sm:h-5 bg-gray-300 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex flex-col items-center justify-center text-center space-y-2 sm:space-y-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-${errColor}-100 flex items-center justify-center`}>
              <AlertCircle className={`w-5 h-5 text-${errColor}-400`} />
            </div>
            <div className="space-y-1 sm:space-y-1.5 w-full">
              <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-3/4 mx-auto" />
              <div className="h-1.5 sm:h-2 bg-gray-300 rounded w-1/2 mx-auto" />
            </div>
          </div>
        </div>
      );
  }
}
