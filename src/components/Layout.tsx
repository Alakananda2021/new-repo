import { useState } from "react";
import { Outlet, useLocation, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Describe a flow",
    body: "Paste or type any user flow in plain language — sign up, checkout, onboarding, whatever you're designing.",
  },
  {
    step: "02",
    title: "Edgecase reads it",
    body: "Each step gets parsed for its intent — auth, upload, payment, search — so the states it generates actually fit.",
  },
  {
    step: "03",
    title: "Get the states you'd miss",
    body: "Empty states, errors, and edge cases for every step, in a tone you pick. Copy any card as an image and drop it in your file.",
  },
];

export function Layout() {
  const location = useLocation();
  const isResultsScreen = location.pathname === "/results";
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-hi)]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--text-hi)] flex items-center justify-center text-white text-sm font-semibold group-hover:bg-[var(--accent)] transition-colors">
              {"{}"}
            </div>
            <span className="font-display font-semibold text-[var(--text-hi)] text-sm sm:text-base tracking-tight">
              Edgecase
            </span>
          </Link>

          {!isResultsScreen && (
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <a
                href="#examples"
                className="hidden sm:inline text-[var(--text-mid)] hover:text-[var(--text-hi)] transition-colors"
              >
                Examples
              </a>
              <button
                onClick={() => setPanelOpen((v) => !v)}
                aria-expanded={panelOpen}
                aria-controls="how-it-works-panel"
                className="text-[var(--text-mid)] hover:text-[var(--text-hi)] transition-colors px-2 py-1"
              >
                How it works
              </button>
            </div>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.button
              aria-label="Close panel"
              onClick={() => setPanelOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              id="how-it-works-panel"
              role="region"
              aria-label="How it works"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="fixed top-14 sm:top-16 left-0 right-0 z-50 border-b border-[var(--border)] bg-white shadow-lg shadow-black/5"
            >
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 relative">
                <button
                  onClick={() => setPanelOpen(false)}
                  aria-label="Close how it works panel"
                  className="absolute top-6 right-4 sm:right-6 p-1.5 rounded-md text-[var(--text-mid)] hover:text-[var(--text-hi)] hover:bg-[var(--neutral-soft)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                  {HOW_IT_WORKS.map((item) => (
                    <div key={item.step}>
                      <span className="text-xs font-semibold text-[var(--accent)]">{item.step}</span>
                      <h3 className="font-display font-semibold text-sm sm:text-base text-[var(--text-hi)] mt-1.5 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--text-mid)] leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="pt-14 sm:pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
