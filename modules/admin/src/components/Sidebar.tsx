"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const navLinks = [
  { href: "/", label: "แดชบอร์ด" },
  { href: "/teachers", label: "ครูผู้สอน" },
  { href: "/sections", label: "คลาสเรียน" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAdminAuth();

  return (
    <aside className="w-60 min-h-screen bg-[#1A2332] flex flex-col shrink-0">
      <div className="px-6 py-6 border-b border-white/10">
        <span className="text-white font-bold text-lg tracking-tight">SectionLap Admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[#6AA098]/20 text-[#6AA098]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={signOut}
          className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
