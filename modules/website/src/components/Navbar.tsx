"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const navLink = (href: string, label: string) => {
    const active = pathname === href || (pathname?.startsWith(href + "/") ?? false);
    return (
      <Link
        href={href}
        className={`text-sm font-medium transition-colors px-1 pb-0.5 ${
          active
            ? "text-[#e8275e] border-b-2 border-[#e8275e]"
            : "text-gray-600 hover:text-[#e8275e]"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[#ede8ed]">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-lg font-bold tracking-tight text-[#e8275e]">Section</span>
          <span className="text-lg font-bold tracking-tight text-[#1a1a2e]">Lap</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          {navLink("/sections", "คลาสเรียน")}
          {user?.role === "teacher" && navLink("/dashboard", "Dashboard")}
          {user && navLink("/profile", "โปรไฟล์")}
          {navLink("/feedback", "Feedback")}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <>
              <span className="hidden sm:block text-xs text-gray-500 max-w-[120px] truncate">
                {user.name}
              </span>
              <button
                onClick={signOut}
                className="text-xs font-medium text-gray-500 hover:text-[#e8275e] transition-colors"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#e8275e] text-white px-4 py-1.5 text-sm font-medium hover:bg-[#c01f4e] transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
