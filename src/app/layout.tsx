import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zera3ty AI | زراعتي بالذكاء الاصطناعي",
  description: "نساعدك على اكتشاف مشاكل نباتاتك مبكرًا ومتابعتها مع فريق زراعي متخصص.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
