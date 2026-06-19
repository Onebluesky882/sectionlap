import type { Metadata } from "next";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SectionLap Admin",
  description: "ระบบจัดการ SectionLap",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="antialiased bg-white text-[#1A2332]">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
