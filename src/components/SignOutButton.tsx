"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
export default function SignOutButton() {
  const router = useRouter();
  return <button className="btn btn-outline !min-h-10 !px-4 !text-sm" onClick={async()=>{await createClient().auth.signOut(); router.push("/"); router.refresh();}}><LogOut size={16}/> تسجيل الخروج</button>;
}
