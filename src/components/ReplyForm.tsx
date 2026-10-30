"use client";
import { useState } from "react";
import { LoaderCircle, Send } from "lucide-react";
export default function ReplyForm({ submissionId }: { submissionId: string }) {
  const [message, setMessage] = useState(""); const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false);
  async function send(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setNotice("");
    const key = crypto.randomUUID();
    try {
      const response = await fetch("/api/admin/replies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ submissionId, message, idempotencyKey: key }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setMessage(""); setNotice("تم حفظ الرد وسيظهر للمستخدم داخل حسابه."); window.location.reload();
    } catch (error) { setNotice(error instanceof Error ? error.message : "تعذر حفظ الرد."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={send} className="space-y-3"><textarea required maxLength={5000} value={message} onChange={e=>setMessage(e.target.value)} className="input min-h-32" placeholder="اكتب إرشاداتك للمستخدم..."/><button className="btn btn-primary" disabled={busy}>{busy?<LoaderCircle className="animate-spin" size={17}/>:<Send size={17}/>} إرسال الرد</button>{notice&&<p aria-live="polite" className="text-sm text-[#236b43]">{notice}</p>}</form>;
}
