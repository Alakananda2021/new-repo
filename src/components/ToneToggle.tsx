import type { Tone } from "../data/states";

interface ToneToggleProps {
  value: Tone;
  onChange: (tone: Tone) => void;
}

export function ToneToggle({ value, onChange }: ToneToggleProps) {
  const options: { value: Tone; label: string }[] = [
    { value: "professional", label: "professional" },
    { value: "playful", label: "playful" },
    { value: "chaotic", label: "chaotic" },
  ];

  return (
    <div role="group" aria-label="Tone" className="inline-flex bg-[var(--ink-900)] border border-[var(--ink-700)] rounded-lg p-1 w-full sm:w-auto font-mono">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
            value === option.value
              ? "bg-[var(--accent)] text-[var(--ink-950)]"
              : "text-[var(--text-mid)] hover:text-[var(--text-hi)]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
