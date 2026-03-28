import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ToneToggle } from "./ToneToggle";
import { StateCard } from "./StateCard";
import type { Tone, FlowSteps } from "../data/states";
import { generateFlowSteps } from "../utils/flowParser";

export function ResultsScreen() {
  const navigate = useNavigate();
  const [tone, setTone] = useState<Tone>("professional");
  const [flowSteps, setFlowSteps] = useState<FlowSteps>([]);
  const [userFlowInput, setUserFlowInput] = useState<string>("");

  useEffect(() => {
    const storedFlow = sessionStorage.getItem('userFlow') || "User signs up → verifies email → lands on dashboard";
    setUserFlowInput(storedFlow);
    setFlowSteps(generateFlowSteps(storedFlow, tone));
  }, []);

  useEffect(() => {
    if (userFlowInput) {
      setFlowSteps(generateFlowSteps(userFlowInput, tone));
    }
  }, [tone, userFlowInput]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            New flow
          </button>

          <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                  Your edge cases
                </h1>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-2">
                Contextual states for each step in your user flow
              </p>
              <p className="text-xs sm:text-sm text-gray-500 italic line-clamp-2">
                "{userFlowInput}"
              </p>
            </div>

            <ToneToggle value={tone} onChange={setTone} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {flowSteps.map((step, stepIndex) => (
          <section key={stepIndex} className="mb-12 sm:mb-16">
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs sm:text-sm font-semibold text-indigo-600">
                    {stepIndex + 1}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {step.stepName}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-gray-600 ml-9 sm:ml-11">
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

        <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Need more edge cases for a different flow?
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all text-sm sm:text-base"
            >
              <Sparkles className="w-4 h-4" />
              Generate new flow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
