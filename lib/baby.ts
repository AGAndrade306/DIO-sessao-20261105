import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Baby } from "@/lib/types";

/** Usuário logado + bebê (ou null). Redireciona para /login se não houver sessão. */
export async function getUserAndBaby(): Promise<{ baby: Baby | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: baby } = await supabase.from("babies").select("*").eq("owner_id", user.id).maybeSingle<Baby>();
  return { baby };
}
