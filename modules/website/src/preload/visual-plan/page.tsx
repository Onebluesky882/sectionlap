"use client";

import { useState } from "react";
import Link from "next/link";
import { useGenerateVisualPlan, useVisualPlans, useDeleteVisualPlan } from "@/hooks/useVisualPlan";
import type { VisualPlan } from "@/store/useVisualPlanStore";

function PlanCard({ plan, onDelete }: { plan: VisualPlan; onDelete: (id: string) => void }) {
  const [copied, setCopied] = useState(false);

  function copyEmbed() {
    navigator.clipboard.writeText(`<img src="${plan.gifUrl}" alt="${plan.title}" />`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border border-[#DDE8E6] rounded-2xl overflow-hidden bg-white shadow-sm">
      <img src={plan.gifUrl} alt={plan.title} className="w-full h-40 object-cover bg-[#1A2332]" />
      <div className="p-4">
        <p className="font-semibold text-[#1A2332] text-sm mb-3 truncate">{plan.title}</p>
        <div className="flex gap-2 flex-wrap">
          <Link
            href={`/visual-plan/${plan.id}`}
            className="text-xs px-3 py-1.5 border border-[#DDE8E6] rounded-lg text-[#64748B] hover:border-[#6AA098] hover:text-[#6AA098] transition-colors"
          >
            ดูแผน
          </Link>
          <button
            onClick={copyEmbed}
            className="text-xs px-3 py-1.5 bg-[#6AA098] text-white rounded-lg hover:bg-[#5a8f88] transition-colors"
          >
            {copied ? "คัดลอกแล้ว ✓" : "Copy Embed"}
          </button>
          <a
            href={plan.gifUrl}
            download
            className="text-xs px-3 py-1.5 border border-[#DDE8E6] rounded-lg text-[#64748B] hover:border-[#6AA098] hover:text-[#6AA098] transition-colors"
          >
            GIF
          </a>
          <a
            href={plan.mp4Url}
            download
            className="text-xs px-3 py-1.5 border border-[#DDE8E6] rounded-lg text-[#64748B] hover:border-[#6AA098] hover:text-[#6AA098] transition-colors"
          >
            MP4
          </a>
          <button
            onClick={() => onDelete(plan.id)}
            className="text-xs px-3 py-1.5 text-red-400 hover:text-red-600 transition-colors ml-auto"
          >
            ลบ
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VisualPlanPreload() {
  const [prompt, setPrompt] = useState("");
  const { generate, isGenerating, error: genError } = useGenerateVisualPlan();
  const { plans, isLoading } = useVisualPlans();
  const deletePlan = useDeleteVisualPlan();

  async function handleGenerate() {
    if (!prompt.trim()) return;
    const result = await generate(prompt.trim());
    if (result) setPrompt("");
  }

  return (
    <main className="min-h-[calc(100vh-56px)] max-w-5xl mx-auto px-4 py-10">

      <div className="mb-8">
        <p className="text-xs font-semibold text-[#6AA098] uppercase tracking-widest mb-1">AI VISUAL PLAN</p>
        <h1 className="text-3xl font-bold text-[#1A2332]">สร้างแผนการเรียนเป็นภาพ</h1>
        <p className="text-[#64748B] text-sm mt-2">
          ป้อนแผนการเรียน → AI วิเคราะห์ → ได้ GIF/MP4 สำหรับ share หรือ embed
        </p>
      </div>

      {/* ── Generator ── */}
      <div className="bg-[#F7FAFA] border border-[#DDE8E6] rounded-2xl p-6 mb-10">
        <label className="block text-sm font-semibold text-[#1A2332] mb-2">
          แผนการเรียนของคุณ
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          placeholder={`ตัวอย่าง:\nเรียน React ใน 30 วัน:\n- Week 1: JavaScript fundamentals\n- Week 2: React basics, hooks\n- Week 3: State management, Zustand\n- Week 4: Deploy + portfolio project`}
          className="w-full border border-[#DDE8E6] rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#6AA098]/30 focus:border-[#6AA098] transition-all resize-none"
        />
        {genError && (
          <p className="text-red-500 text-xs mt-2">{genError}</p>
        )}
        <div className="flex justify-end mt-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="px-6 py-2.5 bg-[#1A2332] text-white text-sm font-semibold rounded-xl hover:bg-[#243447] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                กำลังสร้าง...
              </>
            ) : (
              "✦ สร้างแผนภาพ"
            )}
          </button>
        </div>
      </div>

      {/* ── My Plans ── */}
      <h2 className="text-lg font-bold text-[#1A2332] mb-4">แผนของฉัน</h2>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-[#DDE8E6] rounded-2xl overflow-hidden animate-pulse">
              <div className="bg-[#DDE8E6] h-40" />
              <div className="p-4 space-y-2">
                <div className="bg-[#DDE8E6] h-4 rounded w-3/4" />
                <div className="bg-[#DDE8E6] h-4 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <p className="text-[#64748B] text-sm py-8 text-center">
          ยังไม่มีแผน — ลองสร้างแผนแรกของคุณด้านบน
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} onDelete={deletePlan} />
          ))}
        </div>
      )}
    </main>
  );
}
