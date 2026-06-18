"use client";

const TEACHER_FEATURES = [
  {
    title: "AI Curriculum Designer",
    desc: "Enter a single topic — agent automatically expands it into a lesson tree. Teacher reviews and approves before saving as a section list.",
  },
  {
    title: "AI Teaching Script Generator",
    desc: "Generate a structured teaching script: intro → concept → example → summary. Export as PDF to use before your live class.",
  },
  {
    title: "AI Lesson Scope Checker",
    desc: "Monitors what the teacher types or says in real-time and sends a non-intrusive alert when content starts to drift off-scope.",
  },
  {
    title: "AI Quiz Generator",
    desc: "Hit Generate during a live class — agent creates 3–5 questions based on content already covered. Results appear in real-time.",
  },
  {
    title: "AI Demo Project Builder",
    desc: "Specify a topic and tech stack — agent generates a starter project with code, ready to hand to students as a sandbox.",
  },
];

const STUDENT_FEATURES = [
  {
    title: "Private AI Tutor",
    desc: "A personal AI tutor that knows the context of the section you're studying and your question history. Responds using the Socratic method.",
  },
  {
    title: "AI Expand Example",
    desc: "Highlight any part of the content and tap Expand — the AI generates 2–3 additional examples tailored to your level.",
  },
  {
    title: "Remark + Private Chat with AI",
    desc: "Bookmark timestamps during a live class, then open a private AI chat to ask questions quietly without the teacher seeing.",
  },
  {
    title: "AI Auto Notes",
    desc: "AI automatically summarizes key points from the class into structured bullets. Students can edit and export as PDF or Markdown.",
  },
  {
    title: "AI Personalized Learning Roadmap",
    desc: "Analyzes quiz scores, attendance, and remark history to build a personalized roadmap recommending which sections to continue or review.",
  },
  {
    title: "AI Question Merge",
    desc: "When multiple students ask the same thing, the AI consolidates them into one representative question with a count, then adds it to the Q&A queue.",
  },
  {
    title: "AI Assistant (General)",
    desc: "A chat interface where you can ask anything about the current section. Context-aware and ready to use instantly — no history required.",
  },
  {
    title: "Public Class Chat + Auto Questions",
    desc: "A public chat room during live class. The AI analyzes messages and automatically generates interesting questions to add to the queue.",
  },
];

const SYSTEM_FEATURES = [
  {
    title: "Calendar Booking",
    desc: "Teachers create time slots — students book instantly. The system prevents double-booking and sends reminders before class.",
  },
  {
    title: "Public Q&A Remark List",
    desc: "Collects questions from chat for the teacher to address at the end of class. Q&A Mode displays questions one at a time, sorted by priority.",
  },
  {
    title: "Invite by Email (Private Room)",
    desc: "Teachers send expirable invite links via email to open a private room — ideal for oral exams or 1-on-1 sessions.",
  },
  {
    title: "Class Participant Email Notification",
    desc: "After class ends, the system emails a summary of attendance, quiz results, and key points along with a replay link.",
  },
  {
    title: "AI Reports & Insights",
    desc: "Analytics dashboard where teachers can ask questions in plain language — e.g. 'Who has the lowest attendance?' — and agent queries the database.",
  },
  {
    title: "Portfolio / Sandbox to Student",
    desc: "After a section ends, a starter project is automatically sent to students. They can open a sandbox in the browser with zero setup.",
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
          <span className="text-[#6AA098]">that helps you learn better</span>
        </h1>
        <p className="text-[#64748B] text-base leading-relaxed max-w-lg">
          An AI assistant that understands your learning context — helping teachers prepare lessons
          and students deepen their understanding. Every feature is designed to make learning more effective.
        </p>
      </section>

      {/* Feature lists */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-14 gap-y-14">

          {/* Teachers */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EAF4F2] text-[#4D8078]">
                For Teachers
              </span>
              <span className="text-xs text-[#94A3B8]">{TEACHER_FEATURES.length} features</span>
            </div>
            <ul>
              {TEACHER_FEATURES.map((f, i) => (
                <FeatureRow key={f.title} index={i} title={f.title} desc={f.desc} />
              ))}
            </ul>
          </div>

          {/* Students */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EBF2F7] text-[#4A7294]">
                For Students
              </span>
              <span className="text-xs text-[#94A3B8]">{STUDENT_FEATURES.length} features</span>
            </div>
            <ul>
              {STUDENT_FEATURES.map((f, i) => (
                <FeatureRow key={f.title} index={i} title={f.title} desc={f.desc} />
              ))}
            </ul>
          </div>

          {/* Shared System — full width */}
          <div className="lg:col-span-2 pt-6 border-t border-[#DDE8E6]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F3F4F6] text-[#374151]">
                Shared System
              </span>
              <span className="text-xs text-[#94A3B8]">{SYSTEM_FEATURES.length} features · shared by teachers and students</span>
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
