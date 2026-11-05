"use client";

import { toTimeInput } from "@/lib/time";

/** "Foi agora" (value = null) ou horário ajustado ("HH:MM"). */
export default function TimePicker({
  label = "Quando?",
  value,
  onChange,
}: {
  label?: string;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const chip = "min-h-12 flex-1 rounded-2xl px-3 font-semibold transition";
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-ink-soft">{label}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`${chip} ${value === null ? "bg-ink text-cream" : "bg-white text-ink"}`}
        >
          Foi agora
        </button>
        {value === null ? (
          <button type="button" onClick={() => onChange(toTimeInput(new Date()))} className={`${chip} bg-white`}>
            Ajustar horário
          </button>
        ) : (
          <input
            type="time"
            value={value}
            onChange={(e) => onChange(e.target.value || null)}
            aria-label="Horário"
            className={`${chip} border-2 border-ink bg-white text-center text-lg`}
          />
        )}
      </div>
    </div>
  );
}
