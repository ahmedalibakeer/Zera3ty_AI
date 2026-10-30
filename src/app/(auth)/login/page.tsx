import AuthForm from "@/components/AuthForm";
import {Suspense} from "react";
export default function LoginPage() { return <><h1 className="text-3xl font-extrabold">أهلًا بعودتك</h1><p className="mb-8 mt-2 text-sm leading-7 text-[#6d7b72]">سجّل الدخول لمتابعة اشتراكك وحالات نباتاتك.</p><Suspense fallback={<div className="h-72"/>}><AuthForm mode="login"/></Suspense></>; }
