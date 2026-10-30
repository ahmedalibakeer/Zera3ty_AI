import { redirect } from "next/navigation";
import { currentUser } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function SubscribePage() {
  const { supabase, user } = await currentUser(); if (!user) redirect("/login?next=%2Fsubscribe");
  const { error } = await supabase.from("subscriptions").upsert({ user_id:user.id },{onConflict:"user_id",ignoreDuplicates:true});
  if (error) throw new Error("تعذر تسجيل الاشتراك. حاول مرة أخرى."); redirect("/coming-soon");
}
