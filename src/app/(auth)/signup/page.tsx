import AuthForm from "@/components/AuthForm";
import { Suspense } from "react";
export default function SignupPage() { return <><h1 className="text-3xl font-extrabold">ابدأ رحلتك الخضراء</h1><p className="mb-8 mt-2 text-sm leading-7 text-[#6d7b72]">أنشئ حسابًا للدخول مباشرة ومتابعة صور نباتاتك والردود.</p><Suspense fallback={<div className="h-72"/>}><AuthForm mode="signup"/></Suspense></>; }
