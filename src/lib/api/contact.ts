import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const attempts = new Map<string, number[]>();
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body.website === "string" && body.website) return NextResponse.json({ ok: true });
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now(); const recent = (attempts.get(ip) || []).filter(t => now - t < 60_000);
    if (recent.length >= 4) return NextResponse.json({ error: "تم إرسال رسائل كثيرة. حاول بعد قليل." }, { status: 429 });
    recent.push(now); attempts.set(ip, recent);
    const name = String(body.name || "").trim(); const email = String(body.email || "").trim(); const message = String(body.message || "").trim();
    if (name.length < 1 || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320 || message.length < 1 || message.length > 3000) return NextResponse.json({ error: "راجع البيانات المدخلة." }, { status: 400 });
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return NextResponse.json({ error: "خدمة الرسائل غير مهيأة بعد." }, { status: 503 });
    const supabase = await createClient(); const { error } = await supabase.from("contact_messages").insert({ name, email, message });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "تعذر إرسال الرسالة. حاول مرة أخرى." }, { status: 500 }); }
}
