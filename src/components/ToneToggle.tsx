import type { Tone } from "../data/states";

interface ToneToggleProps {
  value: Tone;
  onChange: (tone: Tone) => void;
}

export function ToneToggle({ value, onChange }: ToneToggleProps) {
  const options: { value: Tone; label: string }[] = [
    { value: "professional", label: "Professional" },
    { value: "playful", label: "Playful" },
    { value: "chaotic", label: "Chaotic" },
  ];

  return (
    <div className="inline-flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
            value === option.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
