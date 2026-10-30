"use client";
import {useEffect} from "react";
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){useEffect(()=>{},[]);return <main className="grid min-h-screen place-items-center bg-[#f7f8f2] p-6 text-center"><div><h1 className="text-3xl font-black">حدث خطأ غير متوقع</h1><p className="mt-3 text-[#6d7b72]">حاول إعادة تحميل الصفحة. إذا استمر الخطأ، تواصل معنا.</p><button onClick={reset} className="btn btn-primary mt-6">إعادة المحاولة</button></div></main>}
