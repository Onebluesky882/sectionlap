"use client";

import Link from "next/link";

export default function HomepagePreload() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">SectionLap</h1>
        <p className="text-lg text-gray-500 max-w-md">
          จองคอร์สและพื้นที่ออกกำลังกายได้ง่ายๆ
        </p>
      </section>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/booking"
          className="rounded-full bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          จองเลย
        </Link>
        <Link
          href="#"
          className="rounded-full border border-gray-300 px-8 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          ดูข้อมูลเพิ่มเติม
        </Link>
      </div>
    </main>
  );
}
