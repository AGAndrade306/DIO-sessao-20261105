import { formatTime, timeAgo } from "@/lib/time";
import { EVENT_META, type BabyEvent, type EventType } from "@/lib/types";

const TITLES: Record<EventType, string> = { feed: "Mamada", sleep: "Soneca", diaper: "Fralda" };

export default function LastSeenCards({
  last,
  now,
}: {
  last: Record<EventType, BabyEvent | null>;
  now: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(Object.keys(TITLES) as EventType[]).map((type) => {
        const ev = last[type];
        // Soneca: conta a partir de quando acordou (ou "dormindo" se ainda aberta).
        const ref = ev ? (type === "sleep" && ev.ended_at ? ev.ended_at : ev.started_at) : null;
        const sleepingNow = type === "sleep" && ev && !ev.ended_at;
        return (
          <div key={type} className={`${EVENT_META[type].bg} min-w-0 rounded-3xl p-3 shadow-sm`}>
            <p className="truncate text-xs font-bold text-ink-soft">
              {EVENT_META[type].emoji} {TITLES[type]}
            </p>
            {!ref ? (
              <p className="mt-1 text-sm font-semibold text-ink-soft">Sem registro</p>
            ) : sleepingNow ? (
              <>
                <p className="mt-1 text-base leading-tight font-extrabold">Dormindo</p>
                <p className="text-xs text-ink-soft">desde {formatTime(ref)}</p>
              </>
            ) : (
              <>
                <p className="mt-1 text-base leading-tight font-extrabold">{timeAgo(ref, new Date(now))}</p>
                <p className="text-xs text-ink-soft">
                  {type === "sleep" ? "acordou " : ""}às {formatTime(ref)}
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
