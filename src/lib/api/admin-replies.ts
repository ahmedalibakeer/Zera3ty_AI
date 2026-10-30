import { NextResponse, type NextRequest } from "next/server";
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
    return NextResponse.json({ ok: true, replyId });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر حفظ الرد." }, { status: 500 }); }
}
