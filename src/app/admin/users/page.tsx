import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import AdminNav from "@/components/AdminNav";
import { Search,Image,CheckCircle2 } from "lucide-react";
export const dynamic="force-dynamic";
export default async function UsersPage({searchParams}:{searchParams:Promise<{q?:string}>}) {
  const {supabase,user,admin}=await isAdmin(); if(!user)redirect("/login?next=%2Fadmin%2Fusers");if(!admin)redirect("/account");
  const {q=""}=await searchParams; let query=supabase.from("profiles").select("id,full_name,email,created_at,subscriptions(id)").order("created_at",{ascending:false}).limit(100);
  if(q.trim()) query=query.or(`full_name.ilike.%${q.replace(/[(),]/g,"")}%,email.ilike.%${q.replace(/[(),]/g,"")}%`);
  const {data:users}=await query;
  return <main className="min-h-screen bg-[#f7f8f2]"><AdminNav/><div className="container py-9"><p className="text-sm font-bold text-[#236b43]">الإدارة</p><h1 className="mb-6 mt-1 text-3xl font-black">المستخدمون</h1><form className="card mb-5 flex gap-2 p-3"><input className="input !border-0" name="q" defaultValue={q} placeholder="ابحث بالاسم أو البريد الإلكتروني"/><button className="btn btn-primary !min-h-11"><Search size={17}/> بحث</button></form><section className="card overflow-x-auto"><table className="w-full min-w-[700px] text-right text-sm"><thead className="bg-[#fafbf8] text-[#79867d]"><tr><th className="p-4">الاسم</th><th className="p-4">البريد</th><th className="p-4">تاريخ التسجيل</th><th className="p-4">الاشتراك</th><th className="p-4">الصور</th></tr></thead><tbody>{(users||[]).map(u=><tr key={u.id} className="border-t border-[#edf0eb]"><td className="p-4 font-bold">{u.full_name||"—"}</td><td className="p-4">{u.email}</td><td className="p-4 text-[#758279]">{formatDate(u.created_at)}</td><td className="p-4">{u.subscriptions?.length?<span className="flex items-center gap-1 text-[#236b43]"><CheckCircle2 size={15}/> مشترك</span>:<span className="text-[#89958b]">غير مشترك</span>}</td><td className="p-4"><Link href={`/admin/images?user=${u.id}`} className="inline-flex items-center gap-1 font-bold text-[#236b43]"><Image size={15}/> عرض الصور</Link></td></tr>)}</tbody></table>{!users?.length&&<p className="p-10 text-center text-[#79867d]">لا يوجد مستخدمون مطابقون.</p>}</section></div></main>;
}
