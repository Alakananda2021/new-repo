import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";

// Generation is synchronous under the hood — this is a short, honest
// transition (not a fake progress bar) that mirrors the shape of the
// results page so the jump doesn't feel jarring. Skeletons read as
// faster than a blank spinner even at the same duration.
const STATUS = ["reading your flow…", "matching states…"];
const DURATION_MS = 900;

export function LoadingScreen() {
  const navigate = useNavigate();
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const messageTimer = setTimeout(() => setStatusIndex(1), DURATION_MS / 2);
    const navTimer = setTimeout(() => navigate("/results"), DURATION_MS);
    return () => {
      clearTimeout(messageTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg-page)]">
      <div className="bg-white border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="h-4 w-20 rounded bg-[var(--border)] animate-pulse mb-5" />
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-56 sm:w-72 rounded bg-[var(--border)] animate-pulse" />
          </div>
          <div className="h-3 w-full max-w-md rounded bg-[var(--neutral-soft)] animate-pulse mb-2" />
          <AnimatePresence mode="wait">
            <motion.p
              key={statusIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs font-medium text-[var(--accent)] mt-3"
            >
              {STATUS[statusIndex]}
              <span className="caret-blink">▍</span>
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {[0, 1].map((section) => (
          <div key={section} className="mb-12 sm:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--neutral-soft)] animate-pulse flex-shrink-0" />
              <div className="h-4 w-40 rounded bg-[var(--neutral-soft)] animate-pulse" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {[0, 1].map((card) => (
                <div
                  key={card}
                  className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-3.5 w-32 rounded bg-[var(--border)] animate-pulse" />
                    <div className="h-5 w-16 rounded bg-[var(--border)] animate-pulse" />
                  </div>
                  <div className="h-3 w-full rounded bg-[var(--neutral-soft)] animate-pulse mb-2" />
                  <div className="h-3 w-2/3 rounded bg-[var(--neutral-soft)] animate-pulse mb-5" />
                  <div className="h-24 rounded-lg bg-[var(--neutral-soft)] animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
