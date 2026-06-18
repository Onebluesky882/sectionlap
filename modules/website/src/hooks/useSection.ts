"use client";

import { useEffect } from "react";
import { useSectionStore } from "@/store/useSectionStore";
import type { Section } from "@/store/useSectionStore";

export function useSection(id: string) {
  const { selected, isLoading, error, setSelected, setLoading, setError } = useSectionStore();

  useEffect(() => {
    if (selected?.id === id) return;
    setLoading(true);
    fetch(`/api/sections/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("ไม่พบ section นี้");
        return r.json() as Promise<{ data: Section }>;
      })
      .then(({ data }) => setSelected(data))
      .catch((e) => setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด"))
      .finally(() => setLoading(false));
  }, [id]);

  return { section: selected, isLoading, error };
}
