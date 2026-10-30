import { NextResponse, type NextRequest } from "next/server";
import { POST as contact } from "@/lib/api/contact";
import { POST as submission } from "@/lib/api/submissions";
import { POST as reply } from "@/lib/api/admin-replies";

export async function POST(request: NextRequest) {
  const path = new URL(request.url).pathname;
  if (path === "/api/contact") return contact(request);
  if (path === "/api/submissions") return submission(request);
  if (path === "/api/admin/replies") return reply(request);
  return NextResponse.json({ error: "المسار غير موجود." }, { status: 404 });
}
