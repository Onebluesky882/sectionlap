"use client";

import Link from "next/link";

export default function HomepagePreload() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative max-w-5xl mx-auto px-4 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16 items-center">

        {/* Left */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 border border-[#DDE8E6] rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-[#6AA098] animate-pulse" />
            <span className="text-xs font-medium text-[#64748B] tracking-wide">LIVE CLASS PLATFORM</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold text-[#1A2332] leading-[1.1] tracking-tight">
              ห้องเรียน<br />
              <span className="text-[#6AA098]">ที่ไม่มีกำแพง</span>
            </h1>
            <p className="text-[#64748B] text-lg leading-relaxed max-w-md">
              เลือก Section จากครูที่ใช่ จ่ายครั้งเดียว
              เข้าเรียนสดผ่าน video call ได้ทุกที่ทุกเวลา
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/sections"
              className="rounded-full bg-[#6AA098] text-white px-7 py-3 text-sm font-semibold hover:bg-[#4D8078] transition-colors"
            >
              ดูคลาสเรียน
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold text-[#6C93B2] underline underline-offset-4 decoration-[#6C93B2]/40 hover:decoration-[#6C93B2] transition-all"
            >
              สมัครฟรี →
            </Link>
          </div>

          {/* Micro stats */}
          <div className="flex items-center gap-6 pt-2">
            {[
              { n: "1:1", label: "ครูต่อนักเรียน" },
              { n: "Live", label: "real-time" },
              { n: "฿", label: "จ่ายเฉพาะที่เลือก" },
            ].map(({ n, label }) => (
              <div key={label}>
                <p className="text-xl font-bold text-[#1A2332]">{n}</p>
                <p className="text-xs text-[#64748B]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — mock "live class card" */}
        <div className="hidden lg:block">
          <div className="rounded-2xl border border-[#DDE8E6] bg-[#F7FAFA] overflow-hidden">
            {/* Header bar */}
            <div className="px-5 py-4 border-b border-[#DDE8E6] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1A2332] uppercase tracking-wider">กำลังสอนสด</span>
              <span className="flex items-center gap-1.5 text-xs text-[#6AA098] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6AA098] animate-pulse" />
                LIVE
              </span>
            </div>
            {/* Mock video */}
            <div className="aspect-video bg-[#1A2332] relative flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#6AA098]/30 flex items-center justify-center mx-auto">
                  <span className="text-2xl">👩‍🏫</span>
                </div>
                <p className="text-white/60 text-xs">ครูกำลังสอนอยู่</p>
              </div>
              {/* Corner badges */}
              <div className="absolute top-3 left-3 bg-black/50 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded">
                HD · 30fps
              </div>
              <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-400" /> REC
              </div>
            </div>
            {/* Info */}
            <div className="px-5 py-4 space-y-3">
              <div>
                <p className="font-semibold text-[#1A2332] text-sm">Python สำหรับผู้เริ่มต้น</p>
                <p className="text-xs text-[#64748B] mt-0.5">อ. สมชาย · 45 นาทีที่เหลือ</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#64748B]">ที่นั่ง 3/20</span>
                <button className="rounded-full bg-[#6AA098] text-white text-xs px-4 py-1.5 font-semibold">
                  เข้าร่วม ฿350
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-[#F7FAFA] border-y border-[#DDE8E6] py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-[#6AA098] uppercase tracking-widest mb-10 text-center">
            วิธีการทำงาน
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 sm:divide-x divide-[#DDE8E6]">
            {[
              { step: "01", title: "เลือก Section", body: "เลือกคลาสที่ตรงกับทักษะที่ต้องการ กรองด้วยหมวดหมู่และราคา" },
              { step: "02", title: "จ่ายครั้งเดียว", body: "ไม่มีค่าสมาชิกรายเดือน จ่ายเฉพาะ section ที่เลือก" },
              { step: "03", title: "เรียนสดเลย", body: "เข้าห้อง video call ได้ทันที พูดคุยกับครูได้แบบ real-time" },
            ].map(({ step, title, body }) => (
              <div key={step} className="px-8 py-6 space-y-3">
                <p className="text-3xl font-bold text-[#DDE8E6]">{step}</p>
                <p className="font-semibold text-[#1A2332]">{title}</p>
                <p className="text-sm text-[#64748B] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Features Roadmap ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-12">

          <div className="text-center space-y-2">
            <p className="text-xs font-bold text-[#6C93B2] uppercase tracking-widest">COMING SOON</p>
            <h2 className="text-2xl font-bold text-[#1A2332]">AI ที่กำลังจะมาใน SectionLap</h2>
            <p className="text-sm text-[#64748B]">ระบบ AI ที่ช่วยทั้งครูและนักเรียน ตั้งแต่วางแผนบทเรียนจนถึงระหว่างสอนสด</p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                tag: "ครู",
                tagColor: "bg-[#EAF4F2] text-[#4D8078]",
                title: "AI Curriculum Designer",
                desc: "กรอก Topic เดียว — Claude แตก Lesson Tree ให้อัตโนมัติ แล้ว approve ก่อน save",
                phase: "Phase B",
              },
              {
                tag: "ครู",
                tagColor: "bg-[#EAF4F2] text-[#4D8078]",
                title: "AI Teaching Script",
                desc: "สร้าง script การสอน intro → concept → example → summary พร้อม export PDF",
                phase: "Phase A",
              },
              {
                tag: "ครู",
                tagColor: "bg-[#EAF4F2] text-[#4D8078]",
                title: "AI Quiz Generator",
                desc: "กด Generate ระหว่าง live class — Claude สร้าง 3–5 คำถามจาก content ที่สอนไปแล้ว",
                phase: "Phase C",
              },
              {
                tag: "นักเรียน",
                tagColor: "bg-[#EBF2F7] text-[#4A7294]",
                title: "Private AI Tutor",
                desc: "AI tutor ส่วนตัวที่รู้ context section ของคุณ ตอบแบบ Socratic method",
                phase: "Phase B",
              },
              {
                tag: "นักเรียน",
                tagColor: "bg-[#EBF2F7] text-[#4A7294]",
                title: "AI Expand Example",
                desc: "Highlight ส่วนใดก็ได้ → AI สร้างตัวอย่างเพิ่มเติมปรับตาม level ของคุณ",
                phase: "Phase B",
              },
              {
                tag: "นักเรียน",
                tagColor: "bg-[#EBF2F7] text-[#4A7294]",
                title: "AI Question Merge",
                desc: "20 คนถามคล้ายกัน — AI รวมเป็น 1 คำถามตัวแทน แล้วส่งเข้า Q&A queue",
                phase: "Phase C",
              },
            ].map(({ tag, tagColor, title, desc, phase }) => (
              <div key={title} className="rounded-2xl border border-[#DDE8E6] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${tagColor}`}>{tag}</span>
                  <span className="text-[10px] text-[#64748B] font-medium">{phase}</span>
                </div>
                <p className="font-semibold text-[#1A2332] text-sm">{title}</p>
                <p className="text-xs text-[#64748B] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Roadmap phases */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest">Roadmap</p>
            <div className="overflow-x-auto">
              <div className="flex gap-3 min-w-max pb-1">
                {[
                  { phase: "Phase A", label: "Foundation AI", items: "Calendar · Script · Assistant", done: false },
                  { phase: "Phase B", label: "AI Core",       items: "Curriculum · Tutor · Expand", done: false },
                  { phase: "Phase C", label: "Live Class AI", items: "Quiz · Q&A · Chat AI",         done: false },
                  { phase: "Phase D", label: "Advanced",      items: "Notes · Roadmap · Reports",    done: false },
                ].map(({ phase, label, items }, i) => (
                  <div key={phase} className="flex items-center gap-3">
                    <div className="rounded-xl border border-[#DDE8E6] bg-[#F7FAFA] px-4 py-3 space-y-0.5 min-w-[160px]">
                      <p className="text-[10px] font-bold text-[#6AA098] uppercase tracking-wider">{phase}</p>
                      <p className="text-sm font-semibold text-[#1A2332]">{label}</p>
                      <p className="text-[10px] text-[#64748B]">{items}</p>
                    </div>
                    {i < 3 && <span className="text-[#DDE8E6] text-lg shrink-0">→</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Teacher CTA ── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto rounded-2xl bg-[#1A2332] px-10 py-12 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-8 items-center">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#6AA098] uppercase tracking-widest">สำหรับครูและผู้สอน</p>
            <h2 className="text-2xl font-bold text-white leading-snug">
              เปิด Section ของคุณ<br />สร้างรายได้ได้เลย
            </h2>
            <p className="text-sm text-white/50 leading-relaxed">
              ตั้งราคา กำหนดเวลา รับนักเรียน<br />ระบบจัดการทุกอย่างให้
            </p>
          </div>
          <Link
            href="/login"
            className="shrink-0 rounded-full bg-[#6AA098] text-white px-7 py-3 text-sm font-semibold hover:bg-[#4D8078] transition-colors whitespace-nowrap"
          >
            เริ่มสอนเลย →
          </Link>
        </div>
      </section>

    </main>
  );
}
