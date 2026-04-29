import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import ClickEffect from "@/components/ClickEffect";
import SideNav from "@/components/SideNav";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Đại hội Đại biểu toàn quốc Mặt trận Tổ quốc Việt Nam lần thứ XI",
  description: "Nhiệm kỳ 2026 - 2031",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-be-vietnam)] bg-black text-white">
        <ClickEffect />
        <SideNav />
        {children}
      </body>
    </html>
  );
}
