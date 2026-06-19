"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (pathname?.startsWith(href + "/") ?? false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#DDE8E6]">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-8">

        <Link href="/" className="shrink-0">
          <Image
            src="/logo.svg"
            alt="SectionLap"
            width={140}
            height={35}
            priority
          />
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {[
            { href: "/sections", label: "Classes" },
            ...(user?.role === "teacher" ? [{ href: "/dashboard", label: "Dashboard" }] : []),
            ...(user ? [{ href: "/profile", label: "Profile" }] : []),
            { href: "/download", label: "Download" },
            { href: "/roadmap", label: "Roadmap" },
            { href: "/feedback", label: "Feedback" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive(href)
                  ? "bg-[#EAF4F2] text-[#4D8078]"
                  : "text-[#64748B] hover:text-[#1A2332] hover:bg-[#F7FAFA]"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <>
              <span className="hidden sm:block text-xs text-[#64748B] max-w-[110px] truncate">
                {user.name}
              </span>
              <button
                onClick={signOut}
                className="text-xs font-medium text-[#64748B] hover:text-[#6AA098] transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#6AA098] text-white px-4 py-1.5 text-sm font-semibold hover:bg-[#4D8078] transition-colors"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
