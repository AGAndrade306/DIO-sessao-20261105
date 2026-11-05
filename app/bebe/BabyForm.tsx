"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { todayInputValue } from "@/lib/time";
import type { Baby } from "@/lib/types";

const inputClass =
  "min-h-14 w-full rounded-2xl border border-ink/15 bg-white px-4 text-lg outline-none focus:border-sleep-strong focus:ring-4 focus:ring-sleep";

export default function BabyForm({ baby }: { baby: Baby | null }) {
  const router = useRouter();
  const [name, setName] = useState(baby?.name ?? "");
  const [birthDate, setBirthDate] = useState(baby?.birth_date ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = todayInputValue();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Digite o nome do bebê.");
    if (!birthDate) return setError("Informe a data de nascimento.");
    if (birthDate > today) return setError("A data de nascimento não pode ser no futuro.");

    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    const { error } = await supabase
      .from("babies")
      .upsert({ owner_id: user.id, name: name.trim(), birth_date: birthDate }, { onConflict: "owner_id" });
    if (error) {
      setSaving(false);
      setError("Não foi possível salvar. Verifique sua conexão e tente de novo.");
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <label className="flex flex-col gap-2">
        <span className="font-semibold">Nome</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
          maxLength={60}
          placeholder="Ex.: Helena"
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="font-semibold">Data de nascimento</span>
        <input
          type="date"
          value={birthDate}
          max={today}
          onChange={(e) => setBirthDate(e.target.value)}
          className={inputClass}
        />
      </label>
      {error && (
        <p className="rounded-2xl bg-feed/60 px-4 py-3 text-sm" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="min-h-14 rounded-3xl bg-ink text-lg font-bold text-cream shadow-sm transition active:scale-[0.98] disabled:opacity-60"
      >
        {saving ? "Salvando…" : "Salvar"}
      </button>
      {baby && (
        <Link href="/" className="flex min-h-12 items-center justify-center font-semibold text-ink-soft">
          Voltar
        </Link>
      )}
    </form>
  );
}
