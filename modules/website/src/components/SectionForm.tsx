"use client";

import { useState } from "react";
import type { SectionFormData } from "@/hooks/useSectionMutations";

const CATEGORIES = ["Frontend", "Backend", "DevOps", "Mobile", "Database", "Testing", "Design", "Other"];

type Props = {
  initial?: Partial<SectionFormData>;
  onSubmit: (data: SectionFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string | null;
  submitLabel?: string;
};

export default function SectionForm({
  initial,
  onSubmit,
  onCancel,
  isLoading,
  error,
  submitLabel = "บันทึก",
}: Props) {
  const [form, setForm] = useState<SectionFormData>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? 0,
    category: initial?.category ?? CATEGORIES[0],
    durationMinutes: initial?.durationMinutes ?? 60,
    capacity: initial?.capacity ?? 20,
    questions: initial?.questions ?? [],
    scheduledAt: initial?.scheduledAt ?? "",
  });

  const [touched, setTouched] = useState<Partial<Record<keyof SectionFormData, boolean>>>({});
  const [newQuestion, setNewQuestion] = useState("");

  function set<K extends keyof SectionFormData>(key: K, value: SectionFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setTouched((t) => ({ ...t, [key]: true }));
  }

  const errors: Partial<Record<keyof SectionFormData, string>> = {};
  if (!form.title.trim()) errors.title = "กรุณากรอกชื่อ section";
  if (!form.description.trim()) errors.description = "กรุณากรอกคำอธิบาย";
  if (form.price < 0) errors.price = "ราคาต้องไม่ติดลบ";
  if (form.durationMinutes < 1) errors.durationMinutes = "ระยะเวลาต้องมากกว่า 0";
  if (form.capacity < 1) errors.capacity = "ที่นั่งต้องมากกว่า 0";

  const valid = Object.keys(errors).length === 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) {
      setTouched({ title: true, description: true, price: true, durationMinutes: true, capacity: true });
      return;
    }
    onSubmit({ ...form, scheduledAt: form.scheduledAt || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="ชื่อ Section *" error={touched.title ? errors.title : undefined}>
        <input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="เช่น React Hooks Deep Dive"
          className={input(!!errors.title && !!touched.title)}
        />
      </Field>

      <Field label="คำอธิบาย *" error={touched.description ? errors.description : undefined}>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          placeholder="อธิบายเนื้อหาที่จะสอน..."
          className={input(!!errors.description && !!touched.description) + " resize-none"}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="หมวดหมู่">
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={input(false)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="ราคา (฿)" error={touched.price ? errors.price : undefined}>
          <input
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => set("price", Number(e.target.value))}
            className={input(!!errors.price && !!touched.price)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="ระยะเวลา (นาที)" error={touched.durationMinutes ? errors.durationMinutes : undefined}>
          <input
            type="number"
            min={1}
            value={form.durationMinutes}
            onChange={(e) => set("durationMinutes", Number(e.target.value))}
            className={input(!!errors.durationMinutes && !!touched.durationMinutes)}
          />
        </Field>

        <Field label="จำนวนที่นั่ง" error={touched.capacity ? errors.capacity : undefined}>
          <input
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) => set("capacity", Number(e.target.value))}
            className={input(!!errors.capacity && !!touched.capacity)}
          />
        </Field>
      </div>

      <Field label="คำถามก่อน booking (ไม่บังคับ)">
        <p className="text-xs text-[#64748B] mb-2">นักเรียนต้องตอบคำถามเหล่านี้ก่อนจอง เพื่อยืนยันความพร้อม</p>
        {form.questions.map((q, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <span className="text-xs text-[#64748B] w-5 shrink-0">{i + 1}.</span>
            <span className="flex-1 text-sm border border-[#DDE8E6] rounded-lg px-3 py-2 bg-[#F7FAFA]">{q}</span>
            <button
              type="button"
              onClick={() => set("questions", form.questions.filter((_, j) => j !== i))}
              className="text-xs text-red-400 hover:text-red-600 px-2"
            >
              ลบ
            </button>
          </div>
        ))}
        <div className="flex gap-2 mt-1">
          <input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const q = newQuestion.trim();
                if (q) { set("questions", [...form.questions, q]); setNewQuestion(""); }
              }
            }}
            placeholder="พิมพ์คำถาม แล้วกด Enter หรือปุ่ม +"
            className={input(false)}
          />
          <button
            type="button"
            onClick={() => {
              const q = newQuestion.trim();
              if (q) { set("questions", [...form.questions, q]); setNewQuestion(""); }
            }}
            className="rounded-lg border border-[#DDE8E6] px-3 py-2 text-sm hover:bg-[#F7FAFA] transition-colors"
          >
            +
          </button>
        </div>
      </Field>

      <Field label="วันเวลาเริ่มเรียน (ไม่บังคับ)">
        <input
          type="datetime-local"
          value={form.scheduledAt ?? ""}
          onChange={(e) => set("scheduledAt", e.target.value)}
          className={input(false)}
        />
      </Field>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-full bg-black text-white px-6 py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-gray-800 transition-colors"
        >
          {isLoading ? "กำลังบันทึก..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
        )}
      </div>
    </form>
  );
}

function input(isError: boolean) {
  return [
    "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors",
    isError ? "border-red-300 focus:ring-red-400" : "border-gray-300 focus:ring-black",
  ].join(" ");
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
