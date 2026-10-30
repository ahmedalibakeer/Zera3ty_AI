import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@/lib/supabase/server";

function detectImage(bytes: Uint8Array) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return "image/png";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await currentUser();
  if (!user) return NextResponse.json({ error: "سجّل الدخول قبل رفع الصورة." }, { status: 401 });
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 5_500_000) return NextResponse.json({ error: "حجم الطلب يتجاوز الحد المسموح." }, { status: 413 });
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase.from("submissions").select("id", { count: "exact", head: true }).gte("created_at", since);
    if (countError) throw countError;
    if ((count || 0) >= 10) return NextResponse.json({ error: "وصلت للحد المؤقت لرفع الصور. حاول بعد ساعة." }, { status: 429 });
    const form = await request.formData(); const file = form.get("image"); const description = String(form.get("description") || "").trim();
    if (!(file instanceof File) || file.size < 1 || file.size > 5 * 1024 * 1024 || description.length > 1200) return NextResponse.json({ error: "الصورة مطلوبة، وحجمها حتى 5 ميجابايت." }, { status: 400 });
    const bytes = new Uint8Array(await file.arrayBuffer()); const contentType = detectImage(bytes);
    if (!contentType || contentType !== file.type) return NextResponse.json({ error: "محتوى الصورة لا يطابق صيغة JPG أو PNG أو WEBP المدعومة." }, { status: 400 });
    const ext = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1]; const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const storage = supabase.storage.from("plant-submissions");
    const { error: uploadError } = await storage.upload(path, bytes, { contentType, upsert: false });
    if (uploadError) throw uploadError;
    const safeName = file.name.replace(/[\x00-\x1f\\/]/g, "_").slice(0, 255) || `plant.${ext}`;
    const { data, error } = await supabase.from("submissions").insert({ user_id: user.id, storage_path: path, original_name: safeName, content_type: contentType, size_bytes: file.size, description }).select("id").single();
    if (error) { await storage.remove([path]); throw error; }
    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "تعذر رفع الصورة." }, { status: 500 }); }
}
