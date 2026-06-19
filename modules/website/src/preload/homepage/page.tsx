"use client";

import Link from "next/link";

const TICKER = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Statistics",
  "Python", "JavaScript", "TypeScript", "Go", "Rust", "Java", "C++", "Swift", "Kotlin",
  "React", "Next.js", "Node.js", "DevOps", "Docker", "SQL", "Machine Learning",
  "UI/UX Design", "Figma", "Data Science", "Cloud Computing", "Cybersecurity",
  "English", "History", "Economics", "Philosophy", "Literature",
  "Calculus", "Linear Algebra", "Algorithms", "System Design",
];

const STEPS = [
  { n: "01", title: "Find a Section", body: "Browse classes by category, teacher, or skill level. Every section is a focused, single-topic live class." },
  { n: "02", title: "Book a Slot", body: "Pick your preferred time from the teacher's available slots and reserve your seat instantly." },
  { n: "03", title: "Join Live", body: "Enter the video room the moment class starts. Ask questions. Get answers in real time." },
];

const AI_FEATURES = [
  { role: "Teacher", color: "text-[#4D8078] bg-[#EAF4F2]", title: "AI Curriculum Designer", body: "Type a single topic. The system breaks it into a full lesson tree — sections, sub-sections, and learning objectives — ready to approve.", phase: "Phase B" },
  { role: "Teacher", color: "text-[#4D8078] bg-[#EAF4F2]", title: "AI Teaching Script", body: "Generate a structured teaching script: intro → concept → example → summary. Export to PDF before you go live.", phase: "Phase A" },
  { role: "Teacher", color: "text-[#4D8078] bg-[#EAF4F2]", title: "AI Quiz Generator", body: "Hit Generate mid-class and get 3–5 questions built from what you just taught. Students answer live, you see results instantly.", phase: "Phase C" },
  { role: "Student", color: "text-[#4A7294] bg-[#EBF2F7]", title: "Private AI Tutor", body: "A personal AI that knows your enrolled sections and your question history. Answers with the Socratic method — guides, doesn't just tell.", phase: "Phase B" },
  { role: "Student", color: "text-[#4A7294] bg-[#EBF2F7]", title: "AI Expand Example", body: "Highlight any concept from the lesson. The AI generates 2–3 additional examples calibrated to your level.", phase: "Phase B" },
  { role: "Student", color: "text-[#4A7294] bg-[#EBF2F7]", title: "AI Question Merge", body: "When 20 students ask similar things, the AI clusters them into one clear question — with a count — and queues it for the teacher.", phase: "Phase C" },
];

export default function HomepagePreload() {
  return (
    <main className="bg-white overflow-hidden">

      {/* ─────────────────── HERO ─────────────────── */}
      <section className="relative max-w-5xl mx-auto px-4 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 items-center">

        {/* Decorative large BG text */}
        <span className="absolute right-0 top-10 text-[160px] font-black text-[#F7FAFA] select-none leading-none pointer-events-none hidden lg:block">
          LAP
        </span>

        {/* Left copy */}
        <div className="relative space-y-7 z-10">
          <div className="inline-flex items-center gap-2 border border-[#DDE8E6] rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-[#6AA098] animate-pulse" />
            <span className="text-xs font-semibold text-[#64748B] tracking-widest uppercase">Live Class Platform</span>
          </div>

          <h1 className="text-5xl sm:text-[64px] font-bold text-[#1A2332] leading-[1.05] tracking-tight">
            The classroom<br />
            <span className="text-[#6AA098]">has no walls.</span>
          </h1>

          <p className="text-[#64748B] text-lg leading-relaxed max-w-sm">
            Pick a section from an expert teacher, pay once,
            and walk into a live video class — no schedule, no commute.
          </p>

          <div className="flex items-center gap-4 pt-1">
            <Link href="/sections" className="rounded-full bg-[#6AA098] text-white px-7 py-3 text-sm font-semibold hover:bg-[#4D8078] transition-colors">
              Browse Classes
            </Link>
            <Link href="/login" className="text-sm font-semibold text-[#6C93B2] underline underline-offset-4 decoration-[#6C93B2]/30 hover:decoration-[#6C93B2] transition-all">
              Sign up free →
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8 pt-2 border-t border-[#DDE8E6]">
            {[
              { n: "1 : 1", sub: "teacher to class" },
              { n: "Live", sub: "real-time video" },
              { n: "Book instantly", sub: "pick your slot" },
            ].map(({ n, sub }) => (
              <div key={sub}>
                <p className="text-base font-bold text-[#1A2332]">{n}</p>
                <p className="text-[10px] text-[#64748B] mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — live class mockup card */}
        <div className="hidden lg:block relative z-10">
          <div className="rounded-2xl border border-[#DDE8E6] overflow-hidden shadow-xl shadow-[#DDE8E6]/60">
            <div className="px-4 py-3 border-b border-[#DDE8E6] flex items-center justify-between bg-white">
              <span className="text-[10px] font-bold text-[#1A2332] uppercase tracking-widest">Now Live</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#6AA098]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6AA098] animate-pulse" /> LIVE
              </span>
            </div>

            <div className="aspect-video bg-[#1A2332] relative flex items-end p-4">
              {/* Fake grid overlay */}
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(#6AA098 1px, transparent 1px), linear-gradient(90deg, #6AA098 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-[#6AA098]/20 border border-[#6AA098]/40 flex items-center justify-center mx-auto">
                    <span className="text-3xl">👩‍🏫</span>
                  </div>
                  <p className="text-white/50 text-[11px] font-medium tracking-wide">INSTRUCTOR</p>
                </div>
              </div>
              <div className="relative flex items-center justify-between w-full">
                <span className="bg-black/50 backdrop-blur text-white/70 text-[9px] px-2 py-0.5 rounded font-mono">HD · 30fps</span>
                <span className="bg-black/50 backdrop-blur text-white/70 text-[9px] px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> REC
                </span>
              </div>
            </div>

            <div className="px-4 py-4 bg-white space-y-3">
              <div>
                <p className="font-semibold text-[#1A2332] text-sm">Introduction to Python</p>
                <p className="text-xs text-[#64748B] mt-0.5">Mr. Somchai · 45 min remaining</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-5 h-5 rounded-full border-2 border-white ring-1 ring-[#DDE8E6] ${i < 3 ? "bg-[#6AA098]" : "bg-[#F7FAFA]"} text-[8px] flex items-center justify-center text-white font-bold`}>
                      {i < 3 ? "S" : ""}
                    </div>
                  ))}
                  <span className="text-[10px] text-[#64748B] ml-1">3 / 20 seats</span>
                </div>
                <button className="rounded-full bg-[#6AA098] text-white text-[10px] px-3 py-1.5 font-semibold">
                  Join · ฿350
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── TICKER STRIP ─────────────────── */}
      <div className="border-y border-[#DDE8E6] bg-[#F7FAFA] py-3 overflow-hidden">
        <div className="flex gap-8 animate-none whitespace-nowrap">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="text-xs font-semibold text-[#64748B] uppercase tracking-widest shrink-0">
              {t} <span className="text-[#DDE8E6] mx-3">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─────────────────── HOW IT WORKS ─────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end justify-between mb-14">
            <h2 className="text-3xl font-bold text-[#1A2332]">How it works</h2>
            <p className="text-xs text-[#64748B] uppercase tracking-widest hidden sm:block">Three steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#DDE8E6]">
            {STEPS.map(({ n, title, body }) => (
              <div key={n} className="px-0 sm:px-8 py-8 sm:py-0 space-y-4 first:pl-0 last:pr-0">
                <p className="text-6xl font-black text-[#DDE8E6] leading-none">{n}</p>
                <p className="font-bold text-[#1A2332]">{title}</p>
                <p className="text-sm text-[#64748B] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── BUILT FOR ─────────────────── */}
      <section className="bg-[#1A2332] py-20 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/10 rounded-2xl overflow-hidden">
          {[
            { icon: "🎓", who: "Students", body: "Learn exactly what you need. No filler content, no wasted hours. One section, one skill." },
            { icon: "👩‍🏫", who: "Teachers", body: "Set your own price and schedule. The platform handles booking, payments, and the live room." },
            { icon: "⚡", who: "Live-first", body: "Every section is a real-time class. Not recorded video. Not async. You get the teacher's full attention." },
            { icon: "🔒", who: "Pay-per-session", body: "Students commit per section. Teachers get paid per class. No free-tier abuse, no subscription churn." },
          ].map(({ icon, who, body }) => (
            <div key={who} className="bg-[#1A2332] px-8 py-8 space-y-3">
              <span className="text-2xl">{icon}</span>
              <p className="font-bold text-white">{who}</p>
              <p className="text-sm text-white/40 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────── AI FEATURES ─────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto space-y-14">

          <div className="space-y-3">
            <p className="text-xs font-bold text-[#6C93B2] uppercase tracking-widest">Coming Soon</p>
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-3xl font-bold text-[#1A2332]">AI inside the classroom</h2>
              <Link href="/roadmap" className="text-xs font-semibold text-[#6AA098] hover:underline underline-offset-2 shrink-0">
                Full roadmap →
              </Link>
            </div>
            <p className="text-[#64748B] text-sm max-w-xl">
              A layer of AI built for how classes actually run — not a chatbot bolted on top.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_FEATURES.map(({ role, color, title, body, phase }) => (
              <div key={title} className="rounded-2xl border border-[#DDE8E6] p-5 space-y-3 hover:border-[#6AA098]/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${color}`}>{role}</span>
                  <span className="text-[10px] text-[#64748B]">{phase}</span>
                </div>
                <p className="font-semibold text-[#1A2332] text-sm leading-snug">{title}</p>
                <p className="text-xs text-[#64748B] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────── QUOTE ─────────────────── */}
      <section className="bg-[#F7FAFA] border-y border-[#DDE8E6] py-20 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <span className="text-6xl font-black text-[#DDE8E6] leading-none block">"</span>
          <p className="text-xl font-semibold text-[#1A2332] leading-relaxed -mt-4">
            The best learning happens when a student can interrupt
            and the teacher can adjust — in real time.
          </p>
          <p className="text-xs text-[#64748B] uppercase tracking-widest">SectionLap · Live-first learning</p>
        </div>
      </section>

      {/* ─────────────────── TEACHER CTA ─────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-[#DDE8E6] px-8 py-10 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-8 items-center">
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#6AA098] uppercase tracking-widest">For Teachers</p>
              <h2 className="text-2xl font-bold text-[#1A2332]">Open your first Section today.</h2>
              <p className="text-sm text-[#64748B]">Set a topic, set a price, set a time. Your students join live.</p>
            </div>
            <Link href="/login" className="shrink-0 rounded-full bg-[#1A2332] text-white px-7 py-3 text-sm font-semibold hover:bg-[#6AA098] transition-colors whitespace-nowrap">
              Start teaching →
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────── FOOTER ─────────────────── */}
      <footer className="border-t border-[#DDE8E6] px-4 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold text-[#1A2332]">SectionLap</span>
          <div className="flex gap-6">
            {[
              { href: "/sections", label: "Classes" },
              { href: "/download", label: "Download" },
              { href: "/roadmap", label: "Roadmap" },
              { href: "/feedback", label: "Feedback" },
              { href: "/login", label: "Sign in" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="text-xs text-[#64748B] hover:text-[#6AA098] transition-colors">
                {label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-[#64748B]">© 2026 SectionLap</p>
        </div>
      </footer>

    </main>
  );
}
