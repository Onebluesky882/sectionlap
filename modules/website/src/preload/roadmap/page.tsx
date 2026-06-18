"use client";

const TEACHER_FEATURES = [
  {
    title: "AI Curriculum Designer",
    desc: "กรอก Topic เดียว — Claude แตก Lesson Tree ให้อัตโนมัติ teacher approve ก่อน save กลายเป็น section list",
  },
  {
    title: "AI Teaching Script Generator",
    desc: "สร้าง script การสอนแบบ intro → concept → example → summary พร้อม export PDF ใช้ก่อน live class ได้เลย",
  },
  {
    title: "AI Lesson Scope Checker",
    desc: "Monitor real-time สิ่งที่ teacher พิมพ์หรือพูด แจ้งเตือนแบบ non-intrusive เมื่อ content เริ่มออกนอก scope",
  },
  {
    title: "AI Quiz Generator",
    desc: "กด Generate ระหว่าง live class — Claude สร้าง 3–5 คำถามจาก content ที่สอนไปแล้ว teacher เห็นผล real-time",
  },
  {
    title: "AI Demo Project Builder",
    desc: "ระบุ topic + tech stack — Claude สร้าง starter project พร้อม code ส่งให้ student เป็น sandbox ได้เลย",
  },
];

const STUDENT_FEATURES = [
  {
    title: "Private AI Tutor",
    desc: "AI tutor ส่วนตัวที่รู้ context ของ section ที่เรียนอยู่ และประวัติคำถามของคุณ ตอบแบบ Socratic method",
  },
  {
    title: "AI Expand Example",
    desc: "Highlight ส่วนใดก็ได้ในเนื้อหา กด Expand — AI สร้างตัวอย่างเพิ่มอีก 2–3 ข้อ ปรับตาม level ของคุณ",
  },
  {
    title: "Remark + Private Chat with AI",
    desc: "Bookmark timestamp ระหว่าง live class ได้ และเปิด private chat กับ AI เพื่อถามเงียบ ๆ โดยที่ teacher ไม่เห็น",
  },
  {
    title: "AI Auto Notes",
    desc: "AI สรุป key points จาก class เป็น bullet structured อัตโนมัติ student แก้ไขเพิ่มเติมได้ export เป็น PDF/Markdown",
  },
  {
    title: "AI Personalized Learning Roadmap",
    desc: "วิเคราะห์ quiz scores + attendance + remark history แล้วสร้าง roadmap แนะนำว่า section ไหนควรเรียนต่อหรือ review",
  },
  {
    title: "AI Question Merge",
    desc: "เมื่อหลายคนถามเรื่องเดียวกัน AI รวมเป็น 1 คำถามตัวแทนพร้อม count แล้วส่งเข้า Q&A queue ให้ teacher ตอบ",
  },
  {
    title: "AI Assistant (General)",
    desc: "Chat interface ถามอะไรก็ได้เกี่ยวกับ section ที่เรียนอยู่ รู้ context ปัจจุบัน ใช้ได้ทันทีโดยไม่ต้องมี history",
  },
  {
    title: "Public Class Chat + Auto Questions",
    desc: "Chat room สาธารณะระหว่าง live class AI วิเคราะห์ chat แล้ว generate คำถามที่น่าสนใจเข้า queue อัตโนมัติ",
  },
];

const SYSTEM_FEATURES = [
  {
    title: "Calendar Booking",
    desc: "Teacher สร้าง time slot — Student จองได้ทันที ระบบป้องกัน double booking และส่ง reminder ก่อนเรียน",
  },
  {
    title: "Public Q&A Remark List",
    desc: "รวบรวมคำถามจาก chat ให้ teacher ตอบช่วงท้าย class เปิด Q&A Mode แสดงทีละข้อ sort by priority",
  },
  {
    title: "Invite by Email (Private Room)",
    desc: "Teacher ส่ง invite link ที่ expire ได้ไปยัง email ผู้รับ เปิด private room เฉพาะสำหรับ oral exam หรือ 1-on-1",
  },
  {
    title: "Class Participant Email Notification",
    desc: "หลัง class จบ ระบบส่ง email สรุป attendance + quiz result + key points พร้อม link กลับมา replay",
  },
  {
    title: "AI Reports & Insights",
    desc: "Dashboard analytics ให้ teacher พิมพ์ถามได้เป็นภาษาธรรมดา เช่น 'นักเรียนคนไหนมาน้อยที่สุด?' Claude ตอบจาก DB",
  },
  {
    title: "Portfolio / Sandbox to Student",
    desc: "หลัง section จบ ส่ง starter project ให้ student อัตโนมัติ เปิด sandbox ได้ใน browser โดยไม่ต้อง setup เอง",
  },
];

function FeatureRow({ index, title, desc }: { index: number; title: string; desc: string }) {
  return (
    <li className="flex gap-4 py-5 border-b border-[#F1F5F9] last:border-0">
      <span className="shrink-0 w-6 text-xs font-mono text-[#C4D4D2] mt-0.5 select-none">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="space-y-1 min-w-0">
        <p className="text-sm font-semibold text-[#1A2332]">{title}</p>
        <p className="text-xs text-[#64748B] leading-relaxed">{desc}</p>
      </div>
    </li>
  );
}

export default function RoadmapPreload() {
  return (
    <main className="min-h-screen bg-white">

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-14 space-y-4">
        <div className="inline-flex items-center gap-2 border border-[#DDE8E6] rounded-full px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-[#6C93B2] animate-pulse" />
          <span className="text-xs font-medium text-[#64748B] tracking-wide">AI ROADMAP</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1A2332] leading-[1.1] tracking-tight">
          AI Assistant<br />
          <span className="text-[#6AA098]">ช่วยให้เรียนได้ดีขึ้น</span>
        </h1>
        <p className="text-[#64748B] text-base leading-relaxed max-w-lg">
          AI assistant ที่เข้าใจ context การเรียนของคุณ ช่วยทั้งครูเตรียมบทเรียน
          และนักเรียนทำความเข้าใจเนื้อหาได้ลึกขึ้น ทุก feature ออกแบบมาเพื่อให้การเรียนมีประสิทธิภาพมากขึ้น
        </p>
      </section>

      {/* Feature lists */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-14 gap-y-14">

          {/* ครู */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EAF4F2] text-[#4D8078]">
                สำหรับครู
              </span>
              <span className="text-xs text-[#94A3B8]">{TEACHER_FEATURES.length} features</span>
            </div>
            <ul>
              {TEACHER_FEATURES.map((f, i) => (
                <FeatureRow key={f.title} index={i} title={f.title} desc={f.desc} />
              ))}
            </ul>
          </div>

          {/* นักเรียน */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EBF2F7] text-[#4A7294]">
                สำหรับนักเรียน
              </span>
              <span className="text-xs text-[#94A3B8]">{STUDENT_FEATURES.length} features</span>
            </div>
            <ul>
              {STUDENT_FEATURES.map((f, i) => (
                <FeatureRow key={f.title} index={i} title={f.title} desc={f.desc} />
              ))}
            </ul>
          </div>

          {/* ระบบกลาง — full width */}
          <div className="lg:col-span-2 pt-6 border-t border-[#DDE8E6]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F3F4F6] text-[#374151]">
                ระบบกลาง
              </span>
              <span className="text-xs text-[#94A3B8]">{SYSTEM_FEATURES.length} features · ใช้ร่วมกันทั้งครูและนักเรียน</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-14">
              {SYSTEM_FEATURES.map((f, i) => (
                <FeatureRow key={f.title} index={i} title={f.title} desc={f.desc} />
              ))}
            </ul>
          </div>

        </div>
      </section>

    </main>
  );
}
