import Header from "@/components/Header";
import { HomeSections, SubscribeButton } from "@/components/HomeSections";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Leaf, Sparkles } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  let stats = { users: null as number | null, subscribers: null as number | null, images: null as number | null };
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.rpc("public_stats");
      if (data) stats = { users: Number(data.users), subscribers: Number(data.subscribers), images: Number(data.images) };
    } catch {}
  }
  return <main>
    <div className="relative min-h-[690px] overflow-hidden bg-[#f2f6ed] md:min-h-[740px]">
      <div className="absolute inset-0 bg-cover bg-center md:inset-y-0 md:left-0 md:right-[43%]" style={{backgroundImage:"linear-gradient(90deg,#122c1a1a,#122c1a44),url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1500&q=90)"}}/>
      <div className="absolute inset-0 bg-gradient-to-l from-[#f2f6ed] via-[#f2f6edf2] to-[#f2f6ed99] md:via-[#f2f6edeb]"/>
      <Header/>
      <div className="container relative flex min-h-[690px] items-center pt-20 md:min-h-[740px]"><div className="max-w-[650px] py-16 fade-up">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#dce8d5] bg-white/80 px-4 py-2 text-sm font-bold text-[#236b43]"><Sparkles size={16}/> الزراعة الذكية تبدأ بخطوة</div>
        <h1 className="text-[42px] font-black leading-[1.24] tracking-[-.055em] sm:text-6xl">اكتشف صحة نباتك<br/>بـ <span className="text-[#236b43]">ذكاء أقرب للأرض</span></h1>
        <p className="mt-6 max-w-[540px] text-base leading-8 text-[#58685e] sm:text-lg">ارفع صورة نباتك، تابع حالته، وتواصل مع فريق زراعتي. نعمل على تسخير الذكاء الاصطناعي لمساعدة المزارعين على اكتشاف مشكلات النباتات مبكرًا.</p>
        <div className="mt-8 flex flex-wrap items-center gap-3"><SubscribeButton/><Link href="#how" className="btn btn-outline">اكتشف المشروع <ArrowLeft size={17}/></Link></div>
        <div className="mt-10 flex items-center gap-3 text-sm text-[#63736a]"><span className="flex -space-x-2 space-x-reverse"><span className="grid size-9 place-items-center rounded-full border-2 border-[#f2f6ed] bg-[#d2e6c6]"><Leaf size={16} className="text-[#236b43]"/></span><span className="grid size-9 place-items-center rounded-full border-2 border-[#f2f6ed] bg-[#e8e0bd]">🌱</span><span className="grid size-9 place-items-center rounded-full border-2 border-[#f2f6ed] bg-[#d9e8df]"><Sparkles size={15} className="text-[#236b43]"/></span></span><span>معًا نحو زراعة أكثر استدامة</span></div>
      </div></div>
      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-xs font-semibold text-[#728077] md:block">اكتشف المزيد ↓</div>
    </div>
    <HomeSections stats={stats}/>
    <footer className="border-t border-[#e9eee8] py-7"><div className="container flex flex-col items-center justify-between gap-4 text-sm text-[#718078] sm:flex-row"><span>© {new Date().getFullYear()} زراعتي AI — نزرع مستقبلًا أذكى.</span><div className="flex gap-5"><Link href="/login">حسابي</Link><Link href="/privacy">الخصوصية</Link></div></div></footer>
  </main>;
}
