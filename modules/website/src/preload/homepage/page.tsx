"use client";

import Link from "next/link";

const FEATURES = [
  { icon: "🎓", title: "ครูผู้เชี่ยวชาญ", desc: "เรียนกับครูที่คัดสรรมาแล้ว ทุกสาขาวิชา" },
  { icon: "📡", title: "เรียนสด Real-time", desc: "เข้าห้องเรียน video call ได้ทันทีหลังจ่ายเงิน" },
  { icon: "🗓️", title: "เลือกเวลาได้", desc: "มีหลาย section ให้เลือกตามเวลาที่สะดวก" },
];

export default function HomepagePreload() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white pt-20 pb-24 px-4">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#fce4ec] blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full bg-[#fce4ec] blur-2xl opacity-40 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <span className="inline-block bg-[#fce4ec] text-[#e8275e] text-xs font-semibold px-3 py-1 rounded-full tracking-wide uppercase">
            Live Class Platform
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-[#1a1a2e] leading-tight">
            เรียนสด<br />
            <span className="text-[#e8275e]">ทุกที่ ทุกเวลา</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            เลือก Section จากครูผู้เชี่ยวชาญ จ่ายเงิน แล้วเข้าห้องเรียน video call ได้ทันที
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/sections"
              className="rounded-full bg-[#e8275e] text-white px-8 py-3.5 text-sm font-semibold hover:bg-[#c01f4e] transition-colors shadow-lg shadow-pink-200"
            >
              ดูคลาสทั้งหมด →
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-[#ede8ed] px-8 py-3.5 text-sm font-semibold text-gray-600 hover:border-[#e8275e] hover:text-[#e8275e] transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#f5f5f7] py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-[#1a1a2e] mb-12">
            ทำไมต้อง SectionLap?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-[#ede8ed] space-y-3">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="font-semibold text-[#1a1a2e]">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto space-y-5">
          <h2 className="text-3xl font-bold text-[#1a1a2e]">พร้อมเริ่มเรียนแล้วหรือยัง?</h2>
          <p className="text-gray-500">สมัครฟรี ไม่มีค่าธรรมเนียมรายเดือน จ่ายเฉพาะ section ที่เลือก</p>
          <Link
            href="/login"
            className="inline-block rounded-full bg-[#e8275e] text-white px-10 py-3.5 text-sm font-semibold hover:bg-[#c01f4e] transition-colors shadow-lg shadow-pink-200"
          >
            สมัครสมาชิกฟรี
          </Link>
        </div>
      </section>
    </main>
  );
}
