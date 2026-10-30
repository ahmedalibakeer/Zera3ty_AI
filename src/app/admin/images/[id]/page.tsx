import Link from "next/link";
import { notFound,redirect } from "next/navigation";
import { isAdmin } from "@/lib/supabase/server";
import { formatDate,statusText } from "@/lib/utils";
import AdminNav from "@/components/AdminNav";
import ReplyForm from "@/components/ReplyForm";
import StatusSelect from "@/components/StatusSelect";
import RealtimeRefresh from "@/components/RealtimeRefresh";
export const dynamic="force-dynamic";
export default async function ImageDetail({params}:{params:Promise<{id:string}>}) {
  const {supabase,user,admin}=await isAdmin();if(!user)redirect("/login?next=%2Fadmin");if(!admin)redirect("/account");const {id}=await params;
  const {data:item}=await supabase.from("submissions").select("id,user_id,storage_path,original_name,description,status,created_at,profiles(full_name,email),replies(id,message,created_at,admin_id)").eq("id",id).maybeSingle();if(!item)notFound();
  const {data:image}=await supabase.storage.from("plant-submissions").createSignedUrl(item.storage_path,600);const profile=item.profiles as {full_name?:string,email?:string}|null;
  return <main className="min-h-screen bg-[#f7f8f2]"><RealtimeRefresh tables={["submissions","replies"]}/><AdminNav/><div className="container py-8"><Link href="/admin/images" className="text-sm font-bold text-[#236b43]">← العودة إلى الطلبات</Link><div className="mt-5 grid items-start gap-5 lg:grid-cols-[1.05fr_.95fr]"><section className="card overflow-hidden">{image?.signedUrl&&<a href={image.signedUrl} target="_blank" rel="noreferrer"><img src={image.signedUrl} alt={item.original_name} className="max-h-[560px] w-full bg-[#f1f4ef] object-contain"/></a>}<div className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-xl font-extrabold">{item.original_name}</h1><p className="mt-2 text-sm text-[#6f7d73]">{profile?.full_name||"مستخدم"} · {profile?.email}</p></div><StatusSelect id={item.id} value={item.status}/></div><p className="mt-4 text-sm text-[#7b887e]">تاريخ الرفع: {formatDate(item.created_at)}</p><div className="mt-5 rounded-xl bg-[#f7f8f4] p-4"><p className="mb-2 text-sm font-bold">وصف المستخدم</p><p className="whitespace-pre-wrap text-sm leading-7 text-[#65736a]">{item.description||"لم يضف المستخدم وصفًا."}</p></div></div></section><section className="space-y-5"><div className="card p-6"><h2 className="mb-5 text-lg font-extrabold">سجل الردود</h2>{item.replies?.length?<div className="space-y-3">{item.replies.map((reply:{id:string,message:string,created_at:string})=><div key={reply.id} className="rounded-xl bg-[#f7f8f4] p-4"><p className="whitespace-pre-wrap text-sm leading-7">{reply.message}</p><p className="mt-3 text-xs text-[#819087]">{formatDate(reply.created_at)}</p></div>)}</div>:<p className="text-sm text-[#7b887e]">لم يُرسل رد بعد. أرسل ردًا للمستخدم أدناه.</p>}</div><div className="card p-6"><h2 className="mb-4 text-lg font-extrabold">اكتب ردًا</h2><ReplyForm submissionId={item.id}/></div></section></div></div></main>;
}
