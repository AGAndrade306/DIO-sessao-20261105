"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import ActionButtons from "@/components/ActionButtons";
import EventList from "@/components/EventList";
import EventSheet from "@/components/EventSheet";
import LastSeenCards from "@/components/LastSeenCards";
import SleepTimer from "@/components/SleepTimer";
import Toast from "@/components/Toast";
import { createClient } from "@/lib/supabase/client";
import { formatAge, startOfLocalDay } from "@/lib/time";
import type { Baby, BabyEvent, EventType } from "@/lib/types";

type Data = {
  last: Record<EventType, BabyEvent | null>;
  openSleep: BabyEvent | null;
  recent: BabyEvent[];
};

export default function HomeClient({ baby }: { baby: Baby }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [sheet, setSheet] = useState<EventType | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const lastOf = (type: EventType) =>
      supabase
        .from("events")
        .select("*")
        .eq("baby_id", baby.id)
        .eq("type", type)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle<BabyEvent>();

    const [feed, sleep, diaper, open, recent] = await Promise.all([
      lastOf("feed"),
      lastOf("sleep"),
      lastOf("diaper"),
      supabase
        .from("events")
        .select("*")
        .eq("baby_id", baby.id)
        .eq("type", "sleep")
        .is("ended_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle<BabyEvent>(),
      supabase
        .from("events")
        .select("*")
        .eq("baby_id", baby.id)
        .gte("started_at", startOfLocalDay(-1).toISOString())
        .order("started_at", { ascending: false })
        .limit(300)
        .returns<BabyEvent[]>(),
    ]);

    const firstError = [feed, sleep, diaper, open, recent].find((r) => r.error)?.error;
    if (firstError) {
      setError("Não foi possível carregar os registros. Verifique sua conexão.");
      return;
    }
    setError(null);
    setNow(Date.now());
    setData({
      last: { feed: feed.data, sleep: sleep.data, diaper: diaper.data },
      openSleep: open.data,
      recent: recent.data ?? [],
    });
  }, [baby.id]);

  useEffect(() => {
    // Carga inicial e atualização a cada minuto / ao voltar para o app.
    const initial = setTimeout(load, 0);
    const tick = setInterval(() => setNow(Date.now()), 60_000);
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(initial);
      clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const closeSheet = useCallback(() => setSheet(null), []);

  const onSaved = useCallback(async () => {
    setSheet(null);
    showToast("Registrado ✓");
    await load();
  }, [load, showToast]);

  async function wakeUp() {
    if (!data?.openSleep) return;
    setBusy(true);
    const { error } = await createClient()
      .from("events")
      .update({ ended_at: new Date().toISOString() })
      .eq("id", data.openSleep.id);
    setBusy(false);
    if (error) return showToast("Não foi possível salvar. Tente de novo.");
    showToast("Registrado ✓");
    await load();
  }

  async function remove(ev: BabyEvent) {
    const { error } = await createClient().from("events").delete().eq("id", ev.id);
    if (error) return showToast("Não foi possível excluir. Tente de novo.");
    showToast("Registro excluído");
    await load();
  }

  return (
    <>
      <main className="flex flex-col gap-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[calc(16rem+env(safe-area-inset-bottom))]">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold">{baby.name}</h1>
            <p className="text-ink-soft" suppressHydrationWarning>
              {formatAge(baby.birth_date, new Date(now))}
            </p>
          </div>
          <div className="flex shrink-0 items-center">
            <Link href="/bebe" className="flex min-h-12 items-center px-2 text-sm font-semibold text-ink-soft">
              Editar
            </Link>
            <form action="/auth/sair" method="post">
              <button type="submit" className="min-h-12 px-2 text-sm font-semibold text-ink-soft">
                Sair
              </button>
            </form>
          </div>
        </header>

        {error && (
          <div className="rounded-3xl bg-feed/60 p-4" role="alert">
            <p>{error}</p>
            <button type="button" onClick={load} className="mt-2 min-h-12 font-bold underline underline-offset-4">
              Tentar de novo
            </button>
          </div>
        )}

        {!data && !error && <p className="py-10 text-center text-ink-soft">Carregando…</p>}

        {data && (
          <>
            <LastSeenCards last={data.last} now={now} />
            {data.openSleep && <SleepTimer sleep={data.openSleep} now={now} onWake={wakeUp} busy={busy} />}
            <section>
              <h2 className="mb-3 px-1 text-lg font-extrabold">Histórico</h2>
              <EventList events={data.recent} onDelete={remove} />
            </section>
          </>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30">
        <div className="mx-auto w-full max-w-[480px] bg-gradient-to-t from-cream from-80% to-transparent px-4 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <ActionButtons onPick={setSheet} sleeping={!!data?.openSleep} />
        </div>
      </div>

      {sheet && (
        <EventSheet
          type={sheet}
          babyId={baby.id}
          openSleep={data?.openSleep ?? null}
          onClose={closeSheet}
          onSaved={onSaved}
        />
      )}
      <Toast message={toast} />
    </>
  );
}
