import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/supabase/server";
import { Brand } from "@/components/Header";
import { Check, Leaf } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function ComingSoon() {
  const { supabase,user }=await currentUser(); if(!user)redirect("/login?next=%2Fsubscribe");
  const {data}=await supabase.from("subscriptions").select("id").eq("user_id",user.id).maybeSingle(); if(!data)redirect("/subscribe");
  return <main className="grid min-h-screen place-items-center bg-[#f5f8f1] p-5"><section className="card max-w-xl p-8 text-center sm:p-12"><div className="mb-10 text-right"><Brand/></div><span className="mx-auto grid size-16 place-items-center rounded-full bg-[#e5f2dc] text-[#236b43]"><Check size={30}/></span><p className="mt-6 text-sm font-bold text-[#236b43]">تم تسجيل اشتراكك بنجاح</p><h1 className="mt-3 text-4xl font-black">أنت الآن جزء<br/>من <span className="text-[#236b43]">النمو القادم</span></h1><p className="mx-auto mt-5 max-w-sm leading-8 text-[#69776e]">سنخبرك عندما تصبح زراعتي AI جاهزة. وحتى ذلك الوقت، يمكنك إرسال صورة لنباتك ومتابعة حالته مع فريقنا.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link className="btn btn-primary" href="/account">اذهب إلى حسابي <Leaf size={17}/></Link><Link className="btn btn-outline" href="/">العودة للرئيسية</Link></div></section></main>;
}
