"use client";

import { useState } from "react";
import { formatDuration, formatTime, startOfLocalDay } from "@/lib/time";
import { DIAPER_LABELS, EVENT_META, FEED_LABELS, type BabyEvent } from "@/lib/types";

export function describe(ev: BabyEvent): string {
  const dur = ev.ended_at ? formatDuration(new Date(ev.ended_at).getTime() - new Date(ev.started_at).getTime()) : null;
  if (ev.type === "feed") {
    const parts = [ev.feed_kind ? FEED_LABELS[ev.feed_kind] : "Mamada"];
    if (ev.amount_ml) parts.push(`${ev.amount_ml} ml`);
    if (dur) parts.push(dur);
    return parts.join(" · ");
  }
  if (ev.type === "sleep") return dur ? `Soneca · ${dur}` : "Soneca · dormindo";
  return `Fralda · ${ev.diaper_kind ? DIAPER_LABELS[ev.diaper_kind] : ""}`;
}

export default function EventList({
  events,
  onDelete,
}: {
  events: BabyEvent[];
  onDelete: (ev: BabyEvent) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const todayStart = startOfLocalDay(0).getTime();
  const groups = [
    { title: "Hoje", items: events.filter((e) => new Date(e.started_at).getTime() >= todayStart) },
    { title: "Ontem", items: events.filter((e) => new Date(e.started_at).getTime() < todayStart) },
  ];

  if (events.length === 0) {
    return <p className="rounded-3xl bg-white/70 p-5 text-center text-ink-soft">Nenhum registro hoje nem ontem ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {groups
        .filter((g) => g.items.length > 0)
        .map((g) => (
          <section key={g.title}>
            <h3 className="mb-2 px-1 text-sm font-bold tracking-wide text-ink-soft uppercase">{g.title}</h3>
            <ul className="flex flex-col gap-2">
              {g.items.map((ev) => {
                const open = selected === ev.id;
                return (
                  <li key={ev.id} className="rounded-3xl bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => setSelected(open ? null : ev.id)}
                      aria-expanded={open}
                      className="flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left"
                    >
                      <span className={`${EVENT_META[ev.type].bg} flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl`} aria-hidden>
                        {EVENT_META[ev.type].emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{describe(ev)}</span>
                        {ev.notes && <span className="block truncate text-sm text-ink-soft">{ev.notes}</span>}
                      </span>
                      <span className="shrink-0 font-bold tabular-nums">{formatTime(ev.started_at)}</span>
                    </button>
                    {open && (
                      <div className="flex gap-2 px-4 pb-3">
                        <button
                          type="button"
                          onClick={() => setSelected(null)}
                          className="min-h-12 flex-1 rounded-2xl bg-cream font-semibold"
                        >
                          Fechar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Excluir “${describe(ev)}” das ${formatTime(ev.started_at)}?`)) onDelete(ev);
                          }}
                          className="min-h-12 flex-1 rounded-2xl bg-feed font-bold"
                        >
                          🗑️ Excluir
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
    </div>
  );
}
