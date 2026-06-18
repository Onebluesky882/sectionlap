"use client";

import Link from "next/link";

const PHASES = [
  {
    phase: "Phase A", label: "Foundation AI", status: "planned",
    features: [
      { id: "SYS1", title: "Calendar Booking",    role: "System",  body: "Real time-slot booking with double-booking prevention and reminders." },
      { id: "T3",   title: "AI Teaching Script",  role: "Teacher", body: "Generate a full lesson script: intro → concept → example → summary." },
      { id: "S7",   title: "AI Assistant",         role: "Student", body: "Ask anything about your enrolled section. No memory across sessions." },
    ],
  },
  {
    phase: "Phase B", label: "AI Core", status: "planned",
    features: [
      { id: "T1", title: "AI Curriculum Designer", role: "Teacher", body: "One topic in → full lesson tree out. Teacher approves before saving." },
      { id: "S4", title: "AI Expand Example",      role: "Student", body: "Highlight a concept, get 2–3 additional examples tuned to your level." },
      { id: "S1", title: "Remark + Private Chat",  role: "Student", body: "Bookmark timestamps mid-class and ask a private AI to expand on them." },
      { id: "S3", title: "Private AI Tutor",       role: "Student", body: "Persistent tutor that knows your section history. Socratic method." },
    ],
  },
  {
    phase: "Phase C", label: "Live Class AI", status: "planned",
    features: [
      { id: "T5",   title: "AI Quiz Generator",   role: "Teacher", body: "Mid-class quiz from content taught so far. Live answer results." },
      { id: "S8",   title: "AI Question Merge",   role: "Student", body: "Cluster similar questions into one with a count — queued for Q&A." },
      { id: "SYS4", title: "Public Q&A Queue",    role: "System",  body: "Surfaces merged questions in priority order for end-of-class Q&A." },
      { id: "S2",   title: "Public Chat + Auto Q", role: "Student", body: "Real-time class chat. AI auto-generates questions from the chat stream." },
    ],
  },
  {
    phase: "Phase D", label: "Advanced", status: "future",
    features: [
      { id: "T2",   title: "AI Scope Checker",        role: "Teacher", body: "Monitors what the teacher says and flags when content drifts off-scope." },
      { id: "S5",   title: "AI Personalized Roadmap", role: "Student", body: "Analyses quiz + attendance → recommends which sections to take next." },
      { id: "S6",   title: "AI Auto Notes",            role: "Student", body: "Structured bullet-point notes from the lesson. Editable, exportable." },
      { id: "SYS2", title: "AI Reports & Insights",   role: "System",  body: "Natural language analytics. Ask 'Which student attended least?'" },
    ],
  },
  {
    phase: "Phase E", label: "Infra Heavy", status: "future",
    features: [
      { id: "T4",   title: "AI Demo Project Builder", role: "Teacher", body: "Generate a starter project from the lesson scope for students." },
      { id: "SYS6", title: "Auto Portfolio / Sandbox", role: "System", body: "Sends starter project to enrolled students automatically after class." },
      { id: "SYS3", title: "Invite by Email",          role: "System", body: "Private room links with expiring tokens for 1-on-1 and oral exams." },
    ],
  },
];

const ROLE_STYLE: Record<string, string> = {
  Teacher: "bg-[#EAF4F2] text-[#4D8078]",
  Student: "bg-[#EBF2F7] text-[#4A7294]",
  System:  "bg-[#F7FAFA] text-[#64748B]",
};

export default function RoadmapPreload() {
  return (
    <main className="min-h-[calc(100vh-56px)] max-w-4xl mx-auto px-4 py-14 space-y-16">

      {/* Header */}
      <div className="space-y-4">
        <p className="text-xs font-bold text-[#6AA098] uppercase tracking-widest">AI Roadmap</p>
        <h1 className="text-4xl font-bold text-[#1A2332] leading-tight">
          What we&apos;re building<br />inside the classroom.
        </h1>
        <p className="text-[#64748B] text-sm max-w-lg leading-relaxed">
          19 AI features across 5 phases — for teachers, students, and the live class itself.
          Each phase builds on the previous one.
        </p>
        <div className="flex items-center gap-3 pt-1 text-xs text-[#64748B]">
          <span className="font-semibold">19 features total</span>
          <span className="text-[#DDE8E6]">·</span>
          <span className="font-semibold">Phase A–C = MVP AI (11 features)</span>
        </div>
      </div>

      {/* Phases */}
      {PHASES.map(({ phase, label, status, features }) => (
        <div key={phase} className="space-y-5">
          <div className="flex items-center gap-4">
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${status === "planned" ? "bg-[#6AA098] text-white" : "border border-[#DDE8E6] text-[#64748B]"}`}>
              {phase}
            </span>
            <h2 className="text-lg font-bold text-[#1A2332]">{label}</h2>
            <div className="flex-1 h-px bg-[#DDE8E6]" />
            <span className="text-[10px] text-[#64748B] uppercase tracking-wider">{features.length} features</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4 border-l-2 border-[#DDE8E6]">
            {features.map(({ id, title, role, body }) => (
              <div key={id} className="rounded-xl border border-[#DDE8E6] p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-[#64748B]">{id}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROLE_STYLE[role]}`}>{role}</span>
                </div>
                <p className="font-semibold text-[#1A2332] text-sm">{title}</p>
                <p className="text-xs text-[#64748B] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Footer note */}
      <div className="rounded-2xl border border-dashed border-[#DDE8E6] px-6 py-5 flex items-start gap-4">
        <span className="text-lg mt-0.5 shrink-0">📌</span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#1A2332]">All AI features share one gateway</p>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Every AI feature routes through a single Backend AI Gateway. The frontend never calls the model directly — context injection, streaming, and access control are all handled server-side.
          </p>
        </div>
      </div>

      <div className="text-center pb-4">
        <Link href="/" className="text-sm font-semibold text-[#6AA098] underline underline-offset-2">
          ← Back to home
        </Link>
      </div>

    </main>
  );
}
