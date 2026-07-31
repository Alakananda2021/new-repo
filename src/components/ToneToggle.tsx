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
    <div role="group" aria-label="Tone" className="inline-flex bg-[var(--neutral-soft)] border border-[var(--border)] rounded-lg p-1 w-full sm:w-auto">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
            value === option.value
              ? "bg-white text-[var(--text-hi)] shadow-sm"
              : "text-[var(--text-mid)] hover:text-[var(--text-hi)]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
