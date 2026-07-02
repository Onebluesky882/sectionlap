"use client";

import { useEffect, useState } from "react";
import type { VisualPlan } from "@/store/useVisualPlanStore";

export default function VisualPlanDetailPreload({ id }: { id: string }) {
  const [plan, setPlan] = useState<VisualPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/visual-plans/${id}`)
      .then((r) => r.json() as Promise<{ data: VisualPlan }>)
      .then(({ data }) => setPlan(data))
      .finally(() => setIsLoading(false));
  }, [id]);

  function copyEmbed() {
    if (!plan) return;
    navigator.clipboard.writeText(`<img src="${plan.gifUrl}" alt="${plan.title}" />`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-56px)] max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="bg-[#DDE8E6] h-8 rounded w-1/2" />
          <div className="bg-[#1A2332] rounded-2xl h-72" />
        </div>
      </main>
    );
  }

  if (!plan) {
    return (
      <main className="min-h-[calc(100vh-56px)] max-w-4xl mx-auto px-4 py-10">
        <p className="text-[#64748B]">ไม่พบแผนนี้</p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-56px)] max-w-4xl mx-auto px-4 py-10">
      <p className="text-xs font-semibold text-[#6AA098] uppercase tracking-widest mb-1">VISUAL PLAN</p>
      <h1 className="text-2xl font-bold text-[#1A2332] mb-6">{plan.title}</h1>

      {/* ── GIF preview ── */}
      <div className="rounded-2xl overflow-hidden border border-[#DDE8E6] mb-8 bg-[#1A2332]">
        <img src={plan.gifUrl} alt={plan.title} className="w-full" />
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={copyEmbed}
          className="px-5 py-2.5 bg-[#6AA098] text-white text-sm font-semibold rounded-xl hover:bg-[#5a8f88] transition-colors"
        >
          {copied ? "คัดลอกแล้ว ✓" : "Copy Embed Link"}
        </button>
        <a
          href={plan.gifUrl}
          download={`${plan.title}.gif`}
          className="px-5 py-2.5 border border-[#DDE8E6] text-[#1A2332] text-sm font-semibold rounded-xl hover:border-[#6AA098] hover:text-[#6AA098] transition-colors"
        >
          Download GIF
        </a>
        <a
          href={plan.mp4Url}
          download={`${plan.title}.mp4`}
          className="px-5 py-2.5 border border-[#DDE8E6] text-[#1A2332] text-sm font-semibold rounded-xl hover:border-[#6AA098] hover:text-[#6AA098] transition-colors"
        >
          Download MP4
        </a>
      </div>

      {/* ── Embed snippet ── */}
      <div className="bg-[#1A2332] rounded-2xl p-5">
        <p className="text-[#6AA098] text-xs font-semibold uppercase tracking-widest mb-3">Embed Code</p>
        <code className="text-[#F7FAFA] text-sm break-all font-mono">
          {`<img src="${plan.gifUrl}" alt="${plan.title}" />`}
        </code>
      </div>
    </main>
  );
}
