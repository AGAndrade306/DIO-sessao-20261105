"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("rate limit") || m.includes("security purposes") || m.includes("too many"))
    return "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.";
  if (m.includes("invalid") && m.includes("email")) return "Esse e-mail não parece válido.";
  if (m.includes("fetch") || m.includes("network"))
    return "Sem conexão com o servidor. Verifique sua internet.";
  return "Não foi possível enviar o link agora. Tente novamente.";
}

export default function LoginForm({ initialError }: { initialError: string | null }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(initialError);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setError("Digite um e-mail válido.");
      return;
    }
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: value,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus("idle");
      setError(friendlyError(error.message));
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-3xl bg-sleep p-6 text-center shadow-sm" role="status">
        <p className="text-4xl">📬</p>
        <p className="mt-3 text-lg font-bold">Confira seu e-mail e toque no link para entrar.</p>
        <p className="mt-2 text-sm text-ink-soft">Enviamos para {email.trim()}.</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 min-h-12 text-sm font-semibold underline underline-offset-4"
        >
          Usar outro e-mail
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <label className="flex flex-col gap-2">
        <span className="font-semibold">Seu e-mail</span>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
          className="min-h-14 rounded-2xl border border-ink/15 bg-white px-4 text-lg outline-none focus:border-sleep-strong focus:ring-4 focus:ring-sleep"
        />
      </label>
      {error && (
        <p className="rounded-2xl bg-feed/60 px-4 py-3 text-sm" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="min-h-14 rounded-3xl bg-ink text-lg font-bold text-cream shadow-sm transition active:scale-[0.98] disabled:opacity-60"
      >
        {status === "sending" ? "Enviando…" : "Enviar link de acesso"}
      </button>
      <p className="text-center text-sm text-ink-soft">Sem senha: você entra pelo link que chega no e-mail.</p>
    </form>
  );
}
