"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function StatusSelect({ id, value }: { id: string; value: string }) {
  const [status,setStatus]=useState(value); const [error,setError]=useState("");
  async function change(next:string){setError("");const {error}=await createClient().from("submissions").update({status:next,updated_at:new Date().toISOString()}).eq("id",id);if(error)setError("تعذر تحديث الحالة");else setStatus(next);}
  return <div><select aria-label="حالة الطلب" className="input !w-auto !py-2 text-sm" value={status} onChange={e=>change(e.target.value)}><option value="new">جديد</option><option value="reviewing">قيد المراجعة</option><option value="replied">تم الرد</option></select>{error&&<p className="text-xs text-red-600">{error}</p>}</div>;
}
