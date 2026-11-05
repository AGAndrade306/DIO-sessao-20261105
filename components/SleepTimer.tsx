import { formatTime, formatTimer } from "@/lib/time";
import type { BabyEvent } from "@/lib/types";

export default function SleepTimer({
  sleep,
  now,
  onWake,
  busy,
}: {
  sleep: BabyEvent;
  now: number;
  onWake: () => void;
  busy: boolean;
}) {
  return (
    <section className="rounded-3xl bg-sleep p-4 shadow-sm" aria-live="polite">
      <p className="text-sm font-bold text-ink-soft">😴 Soneca em andamento · desde {formatTime(sleep.started_at)}</p>
      <p className="mt-1 text-2xl font-extrabold">
        Dormindo há {formatTimer(now - new Date(sleep.started_at).getTime())}
      </p>
      <button
        type="button"
        onClick={onWake}
        disabled={busy}
        className="mt-3 min-h-[60px] w-full rounded-3xl bg-ink text-lg font-bold text-cream transition active:scale-[0.98] disabled:opacity-60"
      >
        ☀️ Acordou
      </button>
    </section>
  );
}
