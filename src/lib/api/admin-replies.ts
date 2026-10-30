import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { isAdmin } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { supabase, user, admin } = await isAdmin();
  if (!user) return NextResponse.json({ error: "يلزم تسجيل الدخول." }, { status: 401 });
  if (!admin) return NextResponse.json({ error: "غير مصرح." }, { status: 403 });
  try {
    const body = await request.json(); const submissionId = String(body.submissionId || ""); const message = String(body.message || "").trim(); const key = String(body.idempotencyKey || "");
    if (!/^[0-9a-f-]{36}$/i.test(submissionId) || message.length < 1 || message.length > 5000 || !/^[a-zA-Z0-9-]{12,80}$/.test(key)) return NextResponse.json({ error: "تحقق من نص الرد." }, { status: 400 });
    const { data: prior } = await supabase.from("replies").select("id").eq("admin_id", user.id).eq("idempotency_key", key).maybeSingle();
    let replyId = prior?.id;
    if (!replyId) {
      const { data, error } = await supabase.from("replies").insert({ submission_id: submissionId, admin_id: user.id, message, idempotency_key: key }).select("id").single();
      if (error) throw error; replyId = data.id;
    }
    await supabase.from("submissions").update({ status: "replied", updated_at: new Date().toISOString() }).eq("id", submissionId);
    const { data: notification } = await supabase.from("email_notifications").select("status").eq("reply_id", replyId).maybeSingle();
    if (notification?.status !== "sent" && process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
      const { data: submission } = await supabase.from("submissions").select("user_id").eq("id", submissionId).single();
      const { data: profile } = submission ? await supabase.from("profiles").select("email").eq("id", submission.user_id).single() : { data: null };
      const recipient = profile?.email;
      if (recipient) {
        await supabase.from("email_notifications").upsert({ reply_id: replyId, status: "pending", updated_at: new Date().toISOString() }, { onConflict: "reply_id" });
        try {
          const { data, error } = await new Resend(process.env.RESEND_API_KEY).emails.send({ from: process.env.RESEND_FROM_EMAIL, to: recipient, subject: "وصلك رد جديد من فريق زراعتي", html: `<div dir="rtl" style="font-family:Arial,sans-serif"><h2>رد جديد على حالة نباتك</h2><p>سجّل الدخول إلى حسابك في زراعتي AI لمشاهدة الرد.</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin}/account">فتح حسابي</a></p></div>` }, { idempotencyKey: replyId });
          if (error) throw error;
          await supabase.from("email_notifications").update({ status: "sent", resend_id: data?.id || null, last_error: null, updated_at: new Date().toISOString() }).eq("reply_id", replyId);
        } catch (err) { await supabase.from("email_notifications").update({ status: "failed", last_error: err instanceof Error ? err.message.slice(0, 500) : "send failed", updated_at: new Date().toISOString() }).eq("reply_id", replyId); }
      }
    }
    return NextResponse.json({ ok: true, replyId });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر حفظ الرد." }, { status: 500 }); }
}
