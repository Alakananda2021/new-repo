import { useState } from "react";
import { useNavigate } from "react-router";
import { Sparkles } from "lucide-react";

export function InputScreen() {
  const navigate = useNavigate();
  const [userFlow, setUserFlow] = useState("");

  const handleGenerate = () => {
    if (userFlow.trim()) {
      sessionStorage.setItem('userFlow', userFlow);
      navigate('/loading');
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-2xl w-full">
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 text-center mb-3 sm:mb-4 tracking-tight">
          Design the states you forgot.
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 text-center mb-8 sm:mb-12">
          Turn any user flow into empty states, errors, and edge cases.
        </p>

        <div className="mb-3 sm:mb-4">
          <textarea
            value={userFlow}
            onChange={(e) => setUserFlow(e.target.value)}
            placeholder="Describe your user flow… (e.g. User signs up → verifies email → lands on dashboard)"
            className="w-full h-36 sm:h-40 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-shadow"
          />
        </div>

        <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 text-center">
          Be specific about user actions, transitions, and expected outcomes.
        </p>

        <button
          onClick={handleGenerate}
          disabled={!userFlow.trim()}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-3.5 sm:py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none text-sm sm:text-base"
        >
          Generate states
        </button>

        <div className="mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-gray-200">
          <p className="text-xs sm:text-sm text-gray-500 text-center">
            Edgecase analyzes your flow and generates thoughtful empty states, errors, and edge cases—so you can design complete experiences.
          </p>
        </div>
      </div>
    </div>
  );
}
