import Link from "next/link";
import { Brand } from "@/components/Header";
import SignOutButton from "@/components/SignOutButton";
import { LayoutDashboard, Users, Image, MessageSquare } from "lucide-react";
export default function AdminNav() { return <header className="border-b border-[#e7ece5] bg-white"><div className="container flex min-h-[76px] flex-wrap items-center justify-between gap-3 py-3"><Brand/><nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[#596a60]"><Link href="/admin" className="flex items-center gap-1.5"><LayoutDashboard size={16}/> الرئيسية</Link><Link href="/admin/users" className="flex items-center gap-1.5"><Users size={16}/> المستخدمون</Link><Link href="/admin/images" className="flex items-center gap-1.5"><Image size={16}/> الصور والطلبات</Link><Link href="/admin/messages" className="flex items-center gap-1.5"><MessageSquare size={16}/> الرسائل</Link></nav><SignOutButton/></div></header>; }
