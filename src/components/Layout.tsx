import { Outlet, useLocation, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";

export function Layout() {
  const location = useLocation();
  const isResultsScreen = location.pathname === '/results';

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">E</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm sm:text-base">Edgecase</span>
          </Link>

          {!isResultsScreen && (
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">Docs</a>
              <a href="#" className="hover:text-gray-900 transition-colors">About</a>
            </div>
          )}
        </div>
      </nav>

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
