import { createServerClient } from "@supabase/ssr";
import type { SetAllCookies } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: ((values) => {
      try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
    }) as SetAllCookies } }
  );
}

export async function currentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function isAdmin() {
  const { supabase, user } = await currentUser();
  if (!user) return { supabase, user, admin: false };
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return { supabase, user, admin: data?.role === "admin" };
}
