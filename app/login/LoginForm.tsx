"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthErr = { message: string; code?: string; status?: number };

function friendlyError(err: AuthErr): string {
  const code = err.code ?? "";
  const m = err.message.toLowerCase();
  if (code === "email_address_not_authorized" || m.includes("not authorized"))
    return "Este e-mail não está autorizado a receber links. Sem um SMTP próprio, o Supabase só envia e-mails para membros da equipe do projeto.";
  if (["email_provider_disabled", "signup_disabled", "otp_disabled"].includes(code) || m.includes("disabled") || m.includes("not allowed"))
    return "O login por e-mail (ou o cadastro de novos usuários) está desativado no Supabase.";
  if (m.includes("invalid api key") || code === "bad_jwt")
    return "Chave do Supabase inválida. Confira as variáveis de ambiente na Vercel.";
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || m.includes("rate limit") || m.includes("security purposes"))
    return "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.";
  if (code === "email_address_invalid" || (m.includes("invalid") && m.includes("email")))
    return "Esse e-mail não parece válido.";
  if (m.includes("sending") || m.includes("smtp"))
    return "O Supabase não conseguiu enviar o e-mail. Verifique a configuração de SMTP.";
  if (m.includes("fetch") || m.includes("network"))
    return "Sem conexão com o servidor. Verifique sua internet.";
  return "Não foi possível enviar o link agora. Tente novamente.";
}

export default function LoginForm({ initialError }: { initialError: string | null }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(initialError);
  const [detail, setDetail] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDetail(null);
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
      console.error("Erro ao enviar link mágico:", error);
      setStatus("idle");
      setError(friendlyError(error));
      setDetail([error.code ?? error.status, error.message].filter(Boolean).join(": "));
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
          {detail && <span className="mt-1 block text-xs break-words text-ink-soft">Detalhe: {detail}</span>}
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
