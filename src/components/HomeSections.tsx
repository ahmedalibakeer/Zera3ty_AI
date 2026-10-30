"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpLeft, Camera, Check, CircleHelp, CloudUpload, FileImage, Leaf, LoaderCircle, Mail, MapPin, ScanSearch, ShieldCheck, Sprout, Users, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const steps = [
  { n: "01", icon: Camera, title: "صوّر النبات", text: "التقط صورة واضحة للورقة أو الجزء المصاب في إضاءة جيدة." },
  { n: "02", icon: CloudUpload, title: "ارفع الصورة", text: "أرسل الصورة مع وصف بسيط للأعراض التي لاحظتها." },
  { n: "03", icon: ScanSearch, title: "نراجع الحالة", text: "يبدأ فريقنا بمراجعة الحالة، والتحليل الذكي قادم قريبًا." },
  { n: "04", icon: Check, title: "تابع الإرشادات", text: "استقبل الرد والتوصيات وتابع حالة طلبك من حسابك." },
];
const features = [
  { icon: ScanSearch, title: "اكتشاف مبكر", text: "نطوّر أدوات ذكية تساعد على ملاحظة مؤشرات أمراض النبات مبكرًا." },
  { icon: Leaf, title: "متابعة الحالة", text: "احتفظ بصور نباتاتك وراجع تاريخ كل حالة في مكان واحد." },
  { icon: FileImage, title: "رفع آمن للصور", text: "صورك خاصة، ولا يطّلع عليها إلا فريق المراجعة المخوّل." },
  { icon: Users, title: "تواصل مع الخبراء", text: "أرسل سؤالك وتابع رد فريق زراعتي مباشرة من حسابك." },
];

export function SubscribeButton() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function subscribe() {
    setBusy(true); setMessage("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login?next=%2Fsubscribe"; return; }
      const { error } = await supabase.from("subscriptions").upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });
      if (error) throw error;
      window.location.href = "/coming-soon";
    } catch (error) { setMessage(error instanceof Error ? error.message : "تعذر إتمام الاشتراك. حاول مرة أخرى."); }
    finally { setBusy(false); }
  }
  return <div><button onClick={subscribe} disabled={busy} className="btn btn-primary">{busy ? <LoaderCircle className="animate-spin" size={18}/> : null}{busy ? "جارٍ الاشتراك" : "اشترك الآن"}<ArrowLeft size={17}/></button>{message && <p className="mt-2 text-sm text-red-600">{message}</p>}</div>;
}

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  function chooseFile(selected?: File) {
    setMessage("");
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) { setMessage("الصيغ المدعومة JPG وPNG وWEBP فقط."); return; }
    if (selected.size > 5 * 1024 * 1024) { setMessage("حجم الصورة يجب ألا يتجاوز 5 ميجابايت."); return; }
    setFile(selected); setPreview(URL.createObjectURL(selected));
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMessage("");
    if (!file) { setMessage("اختر صورة للنبات أولًا."); return; }
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login?next=%2Faccount"; return; }
      const form = new FormData(); form.append("image", file); form.append("description", description);
      const response = await fetch("/api/submissions", { method: "POST", body: form });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "تعذر رفع الصورة.");
      window.location.href = "/account?uploaded=1";
    } catch (error) { setMessage(error instanceof Error ? error.message : "تعذر رفع الصورة. حاول مرة أخرى."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="card p-5 sm:p-7 space-y-5">
    <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d7e5d8] bg-[#f8faf6] p-5 text-center hover:border-[#76a682]">
      {preview ? <img src={preview} alt="معاينة صورة النبات" className="max-h-52 rounded-xl object-contain"/> : <><span className="mb-3 grid size-14 place-items-center rounded-2xl bg-[#e8f2e9] text-[#236b43]"><CloudUpload/></span><b>اسحب الصورة هنا أو اضغط للاختيار</b><small className="mt-2 text-[#758278]">JPG, PNG, WEBP · حتى 5MB</small></>}
      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => chooseFile(e.target.files?.[0])}/>
    </label>
    <div><label className="label">وصف المشكلة <span className="font-normal text-[#8b968d]">(اختياري)</span></label><textarea className="input min-h-28 resize-y" maxLength={1200} value={description} onChange={e => setDescription(e.target.value)} placeholder="متى بدأت الأعراض؟ وما الذي لاحظته على النبات؟"/></div>
    {message && <p role="alert" className="text-sm text-red-600">{message}</p>}
    <button className="btn btn-primary w-full" disabled={busy}>{busy ? <LoaderCircle className="animate-spin" size={18}/> : <CloudUpload size={18}/>} {busy ? "جارٍ الإرسال..." : "إرسال الصورة"}</button>
    <p className="flex items-center justify-center gap-1.5 text-xs text-[#728078]"><ShieldCheck size={14}/> صورك محفوظة بشكل خاص ولا تظهر للعامة.</p>
  </form>;
}

export function ContactForm() {
  const [state, setState] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setState("");
    const form = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), message: form.get("message"), website: form.get("website") }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      e.currentTarget.reset(); setState("وصلتنا رسالتك، شكرًا لتواصلك!");
    } catch (error) { setState(error instanceof Error ? error.message : "تعذر إرسال الرسالة."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="card p-6 sm:p-8 space-y-4">
    <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
    <div><label className="label">الاسم</label><input required name="name" maxLength={120} className="input" placeholder="اسمك"/></div>
    <div><label className="label">البريد الإلكتروني</label><input required type="email" name="email" maxLength={320} className="input" placeholder="name@example.com"/></div>
    <div><label className="label">رسالتك</label><textarea required name="message" maxLength={3000} className="input min-h-28" placeholder="كيف يمكننا مساعدتك؟"/></div>
    <button disabled={busy} className="btn btn-primary w-full">{busy ? "جارٍ الإرسال..." : "إرسال الرسالة"}<ArrowUpLeft size={18}/></button>
    {state && <p aria-live="polite" className="text-sm text-[#236b43]">{state}</p>}
  </form>;
}

export function HomeSections({ stats }: { stats: { users: number | null; subscribers: number | null; images: number | null } }) {
  const count = (v: number | null) => v === null ? "—" : v.toLocaleString("ar-EG");
  return <>
    <section id="about" className="section"><div className="container grid items-center gap-12 md:grid-cols-2">
      <div><span className="eyebrow"><Sprout size={17}/> من الفكرة إلى محصول أفضل</span><h2 className="section-title">نزرع المعرفة،<br/><span className="text-[#236b43]">لنحمي كل نبتة.</span></h2><p className="section-copy">زراعتي AI مشروع مصري يجمع بين الذكاء الاصطناعي والخبرة الزراعية، ليمنح كل مزارع طريقة أسهل لفهم ما يحدث لنباتاته واتخاذ الخطوة المناسبة.</p><a href="#how" className="mt-7 inline-flex items-center gap-2 font-bold text-[#236b43]">اكتشف كيف نعمل <ArrowLeft size={18}/></a></div>
      <div className="relative min-h-[390px] overflow-hidden rounded-[30px] bg-cover bg-center" style={{backgroundImage:"linear-gradient(0deg,#143c26a6,transparent 55%),url(https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1000&q=85)"}}><div className="absolute bottom-6 right-6 left-6 rounded-2xl bg-white/95 p-5 backdrop-blur"><p className="text-sm text-[#718076]">رؤيتنا</p><p className="mt-1 text-xl font-bold">تقنية أقرب إلى أرضك وأكثر فائدة لحصادك.</p></div></div>
    </div></section>
    <section id="how" className="section bg-[#f7f8f2]"><div className="container"><div className="mx-auto mb-12 max-w-2xl text-center"><span className="eyebrow">خطوات بسيطة</span><h2 className="section-title">من صورة صغيرة إلى <span className="text-[#236b43]">رؤية أوضح</span></h2><p className="section-copy mx-auto">ابدأ بإرسال حالة نباتك، وفريقنا يتابعها معك خطوة بخطوة.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map(s=><article key={s.n} className="card p-6"><div className="mb-7 flex items-center justify-between"><span className="grid size-12 place-items-center rounded-2xl bg-[#edf4e9] text-[#236b43]"><s.icon size={22}/></span><span className="text-sm font-bold text-[#a6b0a7]">{s.n}</span></div><h3 className="mb-2 text-lg font-bold">{s.title}</h3><p className="text-sm leading-7 text-[#6d7b72]">{s.text}</p></article>)}</div></div></section>
    <section id="features" className="section"><div className="container grid gap-10 md:grid-cols-[.8fr_1.2fr]"><div><span className="eyebrow">مصممة لاحتياجك</span><h2 className="section-title">كل ما تحتاجه<br/>لرعاية <span className="text-[#236b43]">أفضل</span></h2><p className="section-copy">نبدأ بخدمة مراجعة الحالات والتواصل مع فريقنا، ونبني الأساس لتحليل ذكي يرافق نمو نباتاتك.</p></div><div className="grid gap-4 sm:grid-cols-2">{features.map(f=><article key={f.title} className="rounded-2xl border border-[#e9eee8] p-5"><span className="mb-4 grid size-11 place-items-center rounded-xl bg-[#edf4e9] text-[#236b43]"><f.icon size={21}/></span><h3 className="font-bold">{f.title}</h3><p className="mt-2 text-sm leading-7 text-[#6d7b72]">{f.text}</p></article>)}</div></div></section>
    <section className="bg-[#194f32] py-16 text-white"><div className="container"><div className="mb-9 text-center"><span className="text-sm font-bold text-[#cbe47b]">زراعتي بالأرقام</span><h2 className="mt-2 text-3xl font-extrabold">مجتمع ينمو كل يوم</h2></div><div className="grid grid-cols-3 gap-4 text-center">{[[count(stats.users),"مستخدم مسجل"],[count(stats.subscribers),"مشترك مهتم"],[count(stats.images),"صورة مستلمة"]].map(([n,l])=><div key={l}><strong className="text-3xl sm:text-4xl">{n}</strong><p className="mt-2 text-sm text-white/70">{l}</p></div>)}</div><p className="mt-5 text-center text-xs text-white/50">تُعرض الأعداد من قاعدة البيانات عند إعداد اتصال Supabase.</p></div></section>
    <section id="upload" className="section bg-[#f7f8f2]"><div className="container grid items-center gap-12 md:grid-cols-2"><div><span className="eyebrow"><Leaf size={17}/> خلّينا نساعدك</span><h2 className="section-title">ماذا يحدث<br/>لنباتك؟</h2><p className="section-copy">أرسل صورة واضحة ووصفًا لما تلاحظه. يمكنك إنشاء حساب لمتابعة الحالة والردود من مكان واحد.</p><div className="mt-6 flex gap-3 text-sm text-[#6d7b72]"><ShieldCheck className="shrink-0 text-[#236b43]" size={19}/> لن تُنشر صورك، ويطّلع عليها فريق المراجعة فقط.</div></div><UploadForm/></div></section>
    <section id="contact" className="section"><div className="container grid gap-12 md:grid-cols-2"><div><span className="eyebrow">نحن هنا لأجلك</span><h2 className="section-title">خلّينا <span className="text-[#236b43]">نتواصل</span></h2><p className="section-copy">لديك سؤال أو فكرة تعاون؟ اكتب لنا وسنعود إليك في أقرب وقت.</p><div className="mt-8 space-y-5"><p className="flex items-center gap-3 text-[#53645a]"><Mail className="text-[#236b43]" size={19}/> hello@zera3ty.ai</p><p className="flex items-center gap-3 text-[#53645a]"><MapPin className="text-[#236b43]" size={19}/> مصر</p></div><div className="mt-8 flex gap-2 text-xs text-[#77847b]"><CircleHelp size={16}/> لا تشارك كلمات المرور أو بيانات حساسة في الرسائل.</div></div><ContactForm/></div></section>
  </>;
}
