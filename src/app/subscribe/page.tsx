import { redirect } from "next/navigation";
import { currentUser } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function SubscribePage() {
  const { supabase, user } = await currentUser(); if (!user) redirect("/login?next=%2Fsubscribe");
  const { data: existing, error: lookupError } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError) {
    console.error("Subscription lookup failed", lookupError.code);
    throw new Error("تعذر التحقق من حالة اشتراكك. حاول مرة أخرى.");
  }

  if (existing) redirect("/coming-soon");

  const { error } = await supabase.from("subscriptions").insert({ user_id: user.id });
  // If two requests arrive together, the unique user_id constraint makes the
  // second insert a harmless duplicate; both requests can continue to success.
  if (error && error.code !== "23505") {
    console.error("Subscription insert failed", error.code);
    throw new Error("تعذر تسجيل اشتراكك. حاول مرة أخرى.");
  }

  redirect("/coming-soon");
}
