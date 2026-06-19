"use client";

import { useState } from "react";
import { authFetch } from "@/lib/authFetch";
import type { Section } from "@/store/useSectionStore";
import { useSectionStore } from "@/store/useSectionStore";

export type SectionFormData = {
  title: string;
  description: string;
  price: number;
  category: string;
  durationMinutes: number;
  capacity: number;
  questions: string[];
  scheduledAt?: string;
};

export function useSectionMutations() {
  const { setSections, sections } = useSectionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createSection(data: SectionFormData): Promise<Section | null> {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          questions: data.questions ?? [],
          scheduledAt: data.scheduledAt || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? "สร้าง section ไม่สำเร็จ");
      }
      const { data: section } = (await res.json()) as { data: Section };
      setSections([section, ...sections]);
      return section;
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function updateSection(id: string, data: Partial<SectionFormData>): Promise<Section | null> {
    setIsLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {};
      if (data.title !== undefined) body.title = data.title;
      if (data.description !== undefined) body.description = data.description;
      if (data.price !== undefined) body.price = data.price;
      if (data.category !== undefined) body.category = data.category;
      if (data.durationMinutes !== undefined) body.durationMinutes = data.durationMinutes;
      if (data.capacity !== undefined) body.capacity = data.capacity;
      if (data.questions !== undefined) body.questions = data.questions;
      if (data.scheduledAt !== undefined) body.scheduledAt = data.scheduledAt;

      const res = await authFetch(`/api/sections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const b = await res.json() as { error?: string };
        throw new Error(b.error ?? "อัปเดต section ไม่สำเร็จ");
      }
      const { data: updated } = (await res.json()) as { data: Section };
      setSections(sections.map((s) => (s.id === id ? updated : s)));
      return updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { createSection, updateSection, isLoading, error };
}
