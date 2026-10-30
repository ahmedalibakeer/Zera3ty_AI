"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function ProfileEditor({ id, initialName }: { id:string; initialName:string }) {
  const [name,setName]=useState(initialName);const [status,setStatus]=useState("");const [busy,setBusy]=useState(false);
  async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setStatus("");const {error}=await createClient().from("profiles").update({full_name:name.trim()}).eq("id",id);setBusy(false);setStatus(error?"تعذر حفظ الاسم.":"تم حفظ الاسم.");}
  return <form onSubmit={save} className="mt-4 space-y-2"><label className="text-xs text-[#819087]">الاسم</label><div className="flex gap-2"><input className="input !py-2" value={name} onChange={e=>setName(e.target.value)} maxLength={100} minLength={2} required/><button disabled={busy||name.trim()===initialName} className="btn btn-outline !min-h-10 !px-3 !text-sm">{busy?"...":"حفظ"}</button></div>{status&&<p aria-live="polite" className="text-xs text-[#236b43]">{status}</p>}</form>;
}
