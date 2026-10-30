import Link from "next/link";
import { Leaf } from "lucide-react";

export function Brand() {
  return <Link href="/" className="flex items-center gap-2 font-extrabold text-[19px] tracking-tight"><span className="grid size-10 place-items-center rounded-2xl bg-[#236b43] text-white"><Leaf size={22}/></span><span>Zera3ty <span className="text-[#236b43]">AI</span></span></Link>;
}

export default function Header() {
  return <header className="absolute z-10 top-0 inset-x-0"><div className="container flex h-[82px] items-center justify-between"><Brand/><nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#46574d]"><a href="#about">عن المشروع</a><a href="#how">كيف يعمل</a><a href="#features">المميزات</a><a href="#contact">تواصل معنا</a></nav><div className="flex items-center gap-3"><Link href="/login" className="hidden sm:inline text-sm font-bold">دخول</Link><Link href="/signup" className="btn btn-primary !min-h-10 !px-5 !text-sm">اشترك الآن</Link></div></div></header>;
}
