"use client";

import { useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import TimePicker from "@/components/TimePicker";
import { createClient } from "@/lib/supabase/client";
import { formatTimer, fromTimeInput } from "@/lib/time";
import {
  DIAPER_LABELS,
  EVENT_META,
  FEED_LABELS,
  type BabyEvent,
  type DiaperKind,
  type EventType,
  type FeedKind,
} from "@/lib/types";

type Insert = Partial<Omit<BabyEvent, "id" | "created_at">>;

const bigOption =
  "flex min-h-16 w-full items-center justify-center gap-2 rounded-3xl text-lg font-bold shadow-sm transition active:scale-[0.98] disabled:opacity-60";
const field =
  "min-h-12 w-full rounded-2xl border border-ink/15 bg-white px-4 text-lg outline-none focus:border-sleep-strong focus:ring-4 focus:ring-sleep";

function resolveTime(value: string | null): Date {
  return value ? fromTimeInput(value) : new Date();
}

export default function EventSheet({
  type,
  babyId,
  openSleep,
  onClose,
  onSaved,
}: {
  type: EventType;
  babyId: string;
  openSleep: BabyEvent | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [openedAt] = useState(() => Date.now());
  const [time, setTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mamada
  const [bottle, setBottle] = useState(false);
  const [ml, setMl] = useState("");
  const [duration, setDuration] = useState("");

  // Soneca passada
  const [pastSleep, setPastSleep] = useState(false);
  const [sleepStart, setSleepStart] = useState("");
  const [sleepEnd, setSleepEnd] = useState("");

  const meta = EVENT_META[type];
  const note = notes.trim() || null;

  async function run(action: () => PromiseLike<{ error: unknown }>) {
    setSaving(true);
    setError(null);
    const { error } = await action();
    if (error) {
      setSaving(false);
      setError("Não foi possível salvar. Verifique sua conexão e tente de novo.");
      return;
    }
    onSaved();
  }

  function insert(row: Insert) {
    const supabase = createClient();
    return run(() => supabase.from("events").insert({ baby_id: babyId, type, notes: note, ...row }));
  }

  function saveFeed(kind: FeedKind) {
    const start = resolveTime(time);
    const mins = parseInt(duration, 10);
    const amount = parseInt(ml, 10);
    if (kind === "bottle" && !(amount > 0)) {
      setError("Informe a quantidade em ml.");
      return;
    }
    insert({
      feed_kind: kind,
      started_at: start.toISOString(),
      ended_at: mins > 0 ? new Date(start.getTime() + mins * 60_000).toISOString() : null,
      amount_ml: kind === "bottle" ? amount : null,
    });
  }

  function saveDiaper(kind: DiaperKind) {
    insert({ diaper_kind: kind, started_at: resolveTime(time).toISOString() });
  }

  function startSleep() {
    insert({ started_at: resolveTime(time).toISOString(), ended_at: null });
  }

  function wakeUp() {
    if (!openSleep) return;
    const end = resolveTime(time);
    if (end.getTime() < new Date(openSleep.started_at).getTime()) {
      setError("O horário de acordar é antes do início da soneca.");
      return;
    }
    const supabase = createClient();
    run(() =>
      supabase
        .from("events")
        .update({ ended_at: end.toISOString(), ...(note ? { notes: note } : {}) })
        .eq("id", openSleep.id),
    );
  }

  function savePastSleep() {
    if (!sleepStart || !sleepEnd) {
      setError("Informe o início e o fim da soneca.");
      return;
    }
    const end = fromTimeInput(sleepEnd);
    const start = fromTimeInput(sleepStart, end);
    if (start.getTime() >= end.getTime()) {
      setError("O fim da soneca precisa ser depois do início.");
      return;
    }
    insert({ started_at: start.toISOString(), ended_at: end.toISOString() });
  }

  const notesBlock = (
    <div className="flex flex-col gap-3">
      {!showMore ? (
        <button
          type="button"
          onClick={() => setShowMore(true)}
          className="min-h-12 self-start font-semibold text-ink-soft underline underline-offset-4"
        >
          {type === "feed" ? "+ Duração e observação" : "+ Adicionar observação"}
        </button>
      ) : (
        <>
          {type === "feed" && (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-ink-soft">Duração (minutos, opcional)</span>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={duration}
                onChange={(e) => setDuration(e.target.value.replace(/\D/g, ""))}
                className={field}
              />
            </label>
          )}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-ink-soft">Observação (opcional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={500}
              className={`${field} py-2`}
            />
          </label>
        </>
      )}
    </div>
  );

  return (
    <BottomSheet title={`${meta.emoji} ${meta.label}`} onClose={onClose}>
      <div className="flex flex-col gap-5">
        {type === "feed" && (
          <>
            <TimePicker value={time} onChange={setTime} />
            {notesBlock}
            {!bottle ? (
              <div className="flex flex-col gap-3">
                {(["breast_left", "breast_right"] as const).map((k) => (
                  <button key={k} type="button" disabled={saving} onClick={() => saveFeed(k)} className={`${bigOption} bg-feed`}>
                    {FEED_LABELS[k]}
                  </button>
                ))}
                <button type="button" disabled={saving} onClick={() => setBottle(true)} className={`${bigOption} bg-feed`}>
                  🍼 {FEED_LABELS.bottle}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-ink-soft">Quantidade (ml)</span>
                  <input
                    autoFocus
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={ml}
                    onChange={(e) => setMl(e.target.value.replace(/\D/g, ""))}
                    placeholder="0"
                    className={`${field} text-center text-2xl font-bold`}
                  />
                </label>
                <div className="flex gap-2">
                  {[10, 30].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setMl(String((parseInt(ml, 10) || 0) + n))}
                      className="min-h-12 flex-1 rounded-2xl bg-white font-bold shadow-sm"
                    >
                      +{n} ml
                    </button>
                  ))}
                </div>
                <button type="button" disabled={saving} onClick={() => saveFeed("bottle")} className={`${bigOption} bg-ink text-cream`}>
                  {saving ? "Salvando…" : "Salvar mamadeira"}
                </button>
                <button type="button" onClick={() => setBottle(false)} className="min-h-12 font-semibold text-ink-soft">
                  Voltar
                </button>
              </div>
            )}
          </>
        )}

        {type === "diaper" && (
          <>
            <TimePicker value={time} onChange={setTime} />
            {notesBlock}
            <div className="flex flex-col gap-3">
              {(["pee", "poop", "both"] as const).map((k) => (
                <button key={k} type="button" disabled={saving} onClick={() => saveDiaper(k)} className={`${bigOption} bg-diaper`}>
                  {k === "both" ? "Os dois" : DIAPER_LABELS[k]}
                </button>
              ))}
            </div>
          </>
        )}

        {type === "sleep" && openSleep && (
          <>
            <p className="rounded-3xl bg-sleep p-4 text-center text-lg font-bold">
              Dormindo há {formatTimer(openedAt - new Date(openSleep.started_at).getTime())}
            </p>
            <TimePicker label="Acordou quando?" value={time} onChange={setTime} />
            {notesBlock}
            <button type="button" disabled={saving} onClick={wakeUp} className={`${bigOption} bg-ink text-cream`}>
              ☀️ Acordou
            </button>
          </>
        )}

        {type === "sleep" && !openSleep && !pastSleep && (
          <>
            <TimePicker label="Começou a dormir quando?" value={time} onChange={setTime} />
            {notesBlock}
            <button type="button" disabled={saving} onClick={startSleep} className={`${bigOption} bg-sleep`}>
              😴 {time ? `Começou a dormir às ${time}` : "Começou a dormir agora"}
            </button>
            <button
              type="button"
              onClick={() => setPastSleep(true)}
              className="min-h-12 font-semibold text-ink-soft underline underline-offset-4"
            >
              Registrar soneca que já terminou
            </button>
          </>
        )}

        {type === "sleep" && !openSleep && pastSleep && (
          <>
            <div className="flex gap-3">
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-sm font-semibold text-ink-soft">Dormiu às</span>
                <input type="time" value={sleepStart} onChange={(e) => setSleepStart(e.target.value)} className={`${field} text-center`} />
              </label>
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-sm font-semibold text-ink-soft">Acordou às</span>
                <input type="time" value={sleepEnd} onChange={(e) => setSleepEnd(e.target.value)} className={`${field} text-center`} />
              </label>
            </div>
            {notesBlock}
            <button type="button" disabled={saving} onClick={savePastSleep} className={`${bigOption} bg-ink text-cream`}>
              {saving ? "Salvando…" : "Salvar soneca"}
            </button>
            <button type="button" onClick={() => setPastSleep(false)} className="min-h-12 font-semibold text-ink-soft">
              Voltar
            </button>
          </>
        )}

        {error && (
          <p className="rounded-2xl bg-feed/60 px-4 py-3 text-sm" role="alert">
            {error}
          </p>
        )}
      </div>
    </BottomSheet>
  );
}
