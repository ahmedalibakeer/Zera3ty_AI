"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LoaderCircle } from "lucide-react";

export default function AuthForm({ mode }: { mode: "login" | "signup" | "forgot" }) {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [success, setSuccess] = useState(false);
  const router = useRouter(); const params = useSearchParams();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMessage(""); setSuccess(false);
    const form = new FormData(e.currentTarget); const email = String(form.get("email")); const password = String(form.get("password") || "");
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: String(form.get("full_name")) }, emailRedirectTo: `${location.origin}/auth/callback?next=/account` } });
        if (error) throw error;
        setMessage("تحقق من بريدك الإلكتروني لتأكيد الحساب ثم سجّل الدخول."); setSuccess(true);
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error;
        const next = params.get("next"); router.push(next?.startsWith("/") && !next.startsWith("//") ? next : "/account"); router.refresh();
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth/callback?next=/reset-password` });
        if (error) throw error; setMessage("إذا كان البريد مسجلًا، ستصلك رسالة لإعادة تعيين كلمة المرور."); setSuccess(true);
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "حدث خطأ. حاول مرة أخرى."); }
    finally { setBusy(false); }
  }
  const title = mode === "signup" ? "أنشئ حسابك" : mode === "forgot" ? "استعادة كلمة المرور" : "أهلًا بعودتك";
  return <form onSubmit={submit} className="space-y-5">
    <div><label className="label">البريد الإلكتروني</label><input className="input" type="email" name="email" required autoComplete="email" placeholder="name@example.com"/></div>
    {mode === "signup" && <div><label className="label">الاسم الكامل</label><input className="input" name="full_name" required minLength={2} maxLength={100} autoComplete="name" placeholder="اكتب اسمك"/></div>}
    {mode !== "forgot" && <div><label className="label">كلمة المرور</label><input className="input" type="password" name="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="8 أحرف على الأقل"/></div>}
    {mode === "login" && <div className="-mt-2 text-left"><Link href="/forgot-password" className="text-sm font-semibold text-[#236b43]">نسيت كلمة المرور؟</Link></div>}
    <button className="btn btn-primary w-full" disabled={busy}>{busy && <LoaderCircle size={18} className="animate-spin"/>}{busy ? "لحظة واحدة..." : title}</button>
    {message && <p role="status" className={`rounded-xl p-3 text-sm ${success ? "bg-[#edf5e9] text-[#236b43]" : "bg-red-50 text-red-700"}`}>{message}</p>}
    <p className="text-center text-sm text-[#6d7b72]">{mode === "signup" ? <>لديك حساب؟ <Link className="font-bold text-[#236b43]" href="/login">سجّل الدخول</Link></> : mode === "login" ? <>مستخدم جديد؟ <Link className="font-bold text-[#236b43]" href="/signup">أنشئ حسابًا</Link></> : <Link className="font-bold text-[#236b43]" href="/login">العودة لتسجيل الدخول</Link>}</p>
  </form>;
}
