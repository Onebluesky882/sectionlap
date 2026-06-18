"use client";

import { useEffect } from "react";
import { useSectionStore } from "@/store/useSectionStore";
import type { Section } from "@/store/useSectionStore";

export function useSections() {
  const { sections, isLoading, error, setSections, setLoading, setError } = useSectionStore();

  useEffect(() => {
    if (sections.length > 0) return;
    setLoading(true);
    fetch("/api/sections")
      .then((r) => {
        if (!r.ok) throw new Error("โหลด section ไม่สำเร็จ");
        return r.json() as Promise<{ data: Section[] }>;
      })
      .then(({ data }) => setSections(data))
      .catch((e) => setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด"))
      .finally(() => setLoading(false));
  }, []);

  return { sections, isLoading, error };
}
