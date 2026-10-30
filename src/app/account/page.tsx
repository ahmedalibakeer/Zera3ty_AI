import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/supabase/server";
import { formatDate, statusText } from "@/lib/utils";
import { Brand } from "@/components/Header";
import SignOutButton from "@/components/SignOutButton";
import RealtimeRefresh from "@/components/RealtimeRefresh";
import ProfileEditor from "@/components/ProfileEditor";
import { ArrowLeft, CheckCircle2, Clock3, ImagePlus, Leaf, MessageCircle, Sprout } from "lucide-react";

export const dynamic = "force-dynamic";
export default async function AccountPage({ searchParams }: { searchParams: Promise<{ uploaded?: string }> }) {
  const { supabase, user } = await currentUser(); if (!user) redirect("/login?next=%2Faccount");
  const [{ data: profile }, { data: subscription }, { data: submissions }] = await Promise.all([
    supabase.from("profiles").select("full_name,email,role,created_at").eq("id", user.id).maybeSingle(),
    supabase.from("subscriptions").select("id,created_at").eq("user_id", user.id).maybeSingle(),
    supabase.from("submissions").select("id,storage_path,original_name,description,status,created_at,replies(id,message,created_at)").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);
  const items = await Promise.all((submissions || []).map(async item => {
    const { data } = await supabase.storage.from("plant-submissions").createSignedUrl(item.storage_path, 60 * 15);
    return { ...item, imageUrl: data?.signedUrl || "" };
  }));
  const params = await searchParams;
  return <main className="min-h-screen bg-[#f7f8f2]"><RealtimeRefresh tables={["submissions","replies"]}/><header className="border-b border-[#e7ece5] bg-white"><div className="container flex h-[76px] items-center justify-between"><Brand/><div className="flex items-center gap-3"><Link href="/" className="hidden text-sm text-[#627168] sm:block">الرئيسية</Link>{profile?.role === "admin" && <Link href="/admin" className="text-sm font-bold text-[#236b43]">لوحة الإدارة</Link>}<SignOutButton/></div></div></header>
    <div className="container py-10"><div className="mb-8"><p className="text-sm font-semibold text-[#236b43]">مساحة زراعتي</p><h1 className="mt-2 text-3xl font-black">أهلًا {profile?.full_name || user.email?.split("@")[0]}</h1><p className="mt-2 text-[#718078]">تابع اشتراكك وصور نباتاتك والردود من هنا.</p></div>
      {params.uploaded && <div className="mb-6 flex items-center gap-2 rounded-xl bg-[#eaf4e8] p-4 font-semibold text-[#236b43]"><CheckCircle2 size={19}/> استلمنا صورة نباتك، وسنراجعها قريبًا.</div>}
      <div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]"><section className="card h-fit p-6"><div className="mb-5 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-[#edf4e9] text-[#236b43]"><Sprout/></span><div><h2 className="font-bold">ملفي الشخصي</h2><p className="text-sm text-[#76837a]">بيانات حسابك</p></div></div><ProfileEditor id={user.id} initialName={profile?.full_name || ""}/><div className="mt-4 text-sm"><span className="text-[#819087]">البريد الإلكتروني</span><p className="mt-1 font-semibold">{user.email}</p></div><div className="mt-4 text-sm"><span className="text-[#819087]">تاريخ التسجيل</span><p className="mt-1 font-semibold">{profile?.created_at ? formatDate(profile.created_at) : "—"}</p></div><div className="my-6 h-px bg-[#edf0eb]"/><h3 className="font-bold">الاشتراك</h3>{subscription ? <p className="mt-3 flex items-center gap-2 text-sm text-[#236b43]"><CheckCircle2 size={17}/> مشترك منذ {formatDate(subscription.created_at)}</p> : <><p className="mt-2 text-sm leading-7 text-[#77847b]">انضم لقائمة المهتمين واحصل على آخر أخبار الإطلاق.</p><Link href="/subscribe" className="btn btn-primary mt-4 w-full">اشترك الآن <ArrowLeft size={16}/></Link></>}</section>
      <section><div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-extrabold">حالات نباتاتي</h2><p className="mt-1 text-sm text-[#77847b]">الصور والرسائل محفوظة في حسابك فقط.</p></div><Link href="/#upload" className="btn btn-primary !min-h-10 !px-4 !text-sm"><ImagePlus size={17}/> أرسل صورة</Link></div>
        {items.length ? <div className="space-y-4">{items.map(item=><article key={item.id} className="card overflow-hidden"><div className="grid sm:grid-cols-[180px_1fr]">{item.imageUrl ? <img src={item.imageUrl} alt={item.original_name} className="h-48 w-full object-cover sm:h-full"/> : <div className="grid min-h-40 place-items-center bg-[#f2f5ef]"><Leaf className="text-[#9ab69b]"/></div>}<div className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">{item.original_name}</h3><p className="mt-1 text-xs text-[#849087]">{formatDate(item.created_at)}</p></div><span className="rounded-full bg-[#edf4e9] px-3 py-1.5 text-xs font-bold text-[#236b43]">{statusText[item.status] || item.status}</span></div>{item.description&&<p className="mt-4 text-sm leading-7 text-[#65736a]">{item.description}</p>}
          {(item.replies||[]).map(reply=><div key={reply.id} className="mt-4 rounded-xl bg-[#f6f8f3] p-4"><p className="mb-2 flex items-center gap-2 text-sm font-bold text-[#236b43]"><MessageCircle size={16}/> رد فريق زراعتي <span className="font-normal text-[#829087]">· {formatDate(reply.created_at)}</span></p><p className="whitespace-pre-wrap text-sm leading-7">{reply.message}</p></div>)}
          {item.status!=="replied"&&<p className="mt-4 flex items-center gap-2 text-xs text-[#8a958c]"><Clock3 size={15}/> فريقنا يراجع الحالة</p>}</div></div></article>)}</div> : <div className="card flex min-h-64 flex-col items-center justify-center p-8 text-center"><span className="grid size-14 place-items-center rounded-2xl bg-[#edf4e9] text-[#236b43]"><Leaf/></span><h3 className="mt-4 font-bold">لم ترسل أي صور بعد</h3><p className="mt-2 text-sm text-[#77847b]">ابدأ بصورة لنباتك وسنساعدك في متابعة حالته.</p><Link href="/#upload" className="btn btn-outline mt-5">رفع أول صورة <ArrowLeft size={16}/></Link></div>}</section></div>
    </div></main>;
}
