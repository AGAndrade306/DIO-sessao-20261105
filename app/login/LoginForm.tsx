"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";
type AuthErr = { message: string; code?: string; status?: number };

function friendlyError(err: AuthErr): string {
  const code = err.code ?? "";
  const m = err.message.toLowerCase();
  if (code === "invalid_credentials" || m.includes("invalid login credentials"))
    return "E-mail ou senha incorretos.";
  if (code === "email_not_confirmed" || m.includes("not confirmed"))
    return "Seu e-mail ainda não foi confirmado. Abra o link de confirmação que enviamos (ou desative a confirmação de e-mail no Supabase).";
  if (code === "user_already_exists" || code === "email_exists" || m.includes("already registered"))
    return "Já existe uma conta com este e-mail. Use a aba “Entrar”.";
  if (code === "weak_password" || m.includes("password should"))
    return "Senha fraca. Use pelo menos 6 caracteres.";
  if (code === "email_address_invalid" || (m.includes("invalid") && m.includes("email")))
    return "Esse e-mail não parece válido.";
  if (["email_provider_disabled", "signup_disabled"].includes(code) || m.includes("signups not allowed") || m.includes("disabled"))
    return "O cadastro por e-mail está desativado no Supabase.";
  if (code === "email_address_not_authorized" || m.includes("not authorized"))
    return "O Supabase não pode enviar o e-mail de confirmação para este endereço. Desative “Confirm email” no Supabase ou configure um SMTP próprio.";
  if (m.includes("invalid api key") || code === "bad_jwt")
    return "Chave do Supabase inválida. Confira as variáveis de ambiente na Vercel.";
  if (code.startsWith("over_") || m.includes("rate limit") || m.includes("security purposes"))
    return "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.";
  if (m.includes("fetch") || m.includes("network"))
    return "Sem conexão com o servidor. Verifique sua internet.";
  return "Não foi possível entrar agora. Tente novamente.";
}

const inputClass =
  "min-h-14 rounded-2xl border border-ink/15 bg-white px-4 text-lg outline-none focus:border-sleep-strong focus:ring-4 focus:ring-sleep";

export default function LoginForm({ initialError }: { initialError: string | null }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [detail, setDetail] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setDetail(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDetail(null);
    const value = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(value)) return setError("Digite um e-mail válido.");
    if (password.length < 6) return setError("A senha precisa ter pelo menos 6 caracteres.");

    setBusy(true);
    const supabase = createClient();
    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email: value, password })
        : await supabase.auth.signUp({
            email: value,
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
          });

    if (result.error) {
      console.error("Erro de autenticação:", result.error);
      setBusy(false);
      setError(friendlyError(result.error));
      setDetail([result.error.code ?? result.error.status, result.error.message].filter(Boolean).join(": "));
      return;
    }

    if (!result.data.session) {
      // Cadastro com "Confirm email" ligado no Supabase: precisa confirmar antes de entrar.
      setBusy(false);
      setCheckEmail(true);
      return;
    }

    // A home redireciona para /bebe se ainda não houver bebê cadastrado.
    router.replace("/");
    router.refresh();
  }

  if (checkEmail) {
    return (
      <div className="rounded-3xl bg-sleep p-6 text-center shadow-sm" role="status">
        <p className="text-4xl">📬</p>
        <p className="mt-3 text-lg font-bold">Conta criada! Confira seu e-mail e toque no link para confirmar.</p>
        <p className="mt-2 text-sm text-ink-soft">Depois disso é só entrar com seu e-mail e senha.</p>
        <button
          type="button"
          onClick={() => {
            setCheckEmail(false);
            switchMode("signin");
          }}
          className="mt-4 min-h-12 text-sm font-semibold underline underline-offset-4"
        >
          Voltar para entrar
        </button>
      </div>
    );
  }

  const tab = "min-h-12 flex-1 rounded-2xl font-bold transition";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex gap-1 rounded-3xl bg-white p-1 shadow-sm" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signin"}
          onClick={() => switchMode("signin")}
          className={`${tab} ${mode === "signin" ? "bg-ink text-cream" : "text-ink-soft"}`}
        >
          Entrar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          onClick={() => switchMode("signup")}
          className={`${tab} ${mode === "signup" ? "bg-ink text-cream" : "text-ink-soft"}`}
        >
          Criar conta
        </button>
      </div>

      <label className="flex flex-col gap-2">
        <span className="font-semibold">E-mail</span>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-semibold">Senha</span>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "Mínimo de 6 caracteres" : ""}
            className={`${inputClass} w-full pr-24`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 min-w-12 px-4 text-sm font-semibold text-ink-soft"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </label>

      {error && (
        <p className="rounded-2xl bg-feed/60 px-4 py-3 text-sm" role="alert">
          {error}
          {detail && <span className="mt-1 block text-xs break-words text-ink-soft">Detalhe: {detail}</span>}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="min-h-14 rounded-3xl bg-ink text-lg font-bold text-cream shadow-sm transition active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? "Aguarde…" : mode === "signin" ? "Entrar" : "Criar conta"}
      </button>
    </form>
  );
}
