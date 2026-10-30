"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export default function RealtimeRefresh({ tables }: { tables: string[] }) {
  const router = useRouter();
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();
    const channel = supabase.channel(`changes-${Math.random().toString(36).slice(2)}`);
    tables.forEach(table => channel.on("postgres_changes", { event: "*", schema: "public", table }, () => router.refresh()));
    channel.subscribe(); return () => { void supabase.removeChannel(channel); };
  }, [router, tables.join(",")]);
  return null;
}
