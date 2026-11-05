"use client";

import { EVENT_META, type EventType } from "@/lib/types";

const ORDER: EventType[] = ["feed", "sleep", "diaper"];

export default function ActionButtons({
  onPick,
  sleeping,
}: {
  onPick: (type: EventType) => void;
  sleeping: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {ORDER.map((type) => {
        const meta = EVENT_META[type];
        const label = type === "sleep" && sleeping ? "Soneca · Acordou" : meta.label;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onPick(type)}
            className={`${meta.bg} flex min-h-[72px] w-full items-center justify-center gap-3 rounded-3xl text-xl font-extrabold shadow-[0_4px_14px_rgba(59,66,82,0.08)] transition active:scale-[0.98]`}
          >
            <span className="text-3xl" aria-hidden>
              {meta.emoji}
            </span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
