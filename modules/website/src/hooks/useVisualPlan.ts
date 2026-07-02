"use client";

import { useCallback, useEffect } from "react";
import { authFetch } from "@/lib/authFetch";
import { useVisualPlanStore, type VisualPlan } from "@/store/useVisualPlanStore";

export function useVisualPlans() {
  const { plans, isLoading, error, setPlans, setLoading, setError } = useVisualPlanStore();

  useEffect(() => {
    setLoading(true);
    authFetch("/api/visual-plans")
      .then((r) => {
        if (!r.ok) throw new Error("โหลดแผนไม่ได้");
        return r.json() as Promise<{ data: VisualPlan[] }>;
      })
      .then(({ data }) => setPlans(data ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด"))
      .finally(() => setLoading(false));
  }, []);

  return { plans, isLoading, error };
}

export function useGenerateVisualPlan() {
  const { isGenerating, error, addPlan, setGenerating, setError } = useVisualPlanStore();

  const generate = useCallback(async (promptText: string): Promise<VisualPlan | null> => {
    setGenerating(true);
    setError(null);
    try {
      const res = await authFetch("/api/visual-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptText }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        throw new Error(j.error ?? "สร้างแผนไม่ได้");
      }
      const { data } = (await res.json()) as { data: VisualPlan };
      addPlan(data);
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  return { generate, isGenerating, error };
}

export function useDeleteVisualPlan() {
  const { removePlan } = useVisualPlanStore();

  return useCallback(async (id: string): Promise<boolean> => {
    const res = await authFetch(`/api/visual-plans/${id}`, { method: "DELETE" });
    if (res.ok) removePlan(id);
    return res.ok;
  }, []);
}
