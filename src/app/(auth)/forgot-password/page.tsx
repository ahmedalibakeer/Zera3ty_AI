import AuthForm from "@/components/AuthForm";
import {Suspense} from "react";
export default function ForgotPage() { return <><h1 className="text-3xl font-extrabold">نسيت كلمة المرور؟</h1><p className="mb-8 mt-2 text-sm leading-7 text-[#6d7b72]">سنرسل رابط استعادة إلى بريدك الإلكتروني.</p><Suspense fallback={<div className="h-64"/>}><AuthForm mode="forgot"/></Suspense></>; }
