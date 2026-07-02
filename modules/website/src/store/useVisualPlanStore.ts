import { create } from "zustand";

export type VisualPlan = {
  id: string;
  userId: string;
  title: string;
  promptText: string;
  gifUrl: string;
  mp4Url: string;
  createdAt: string;
};

type VisualPlanStore = {
  plans: VisualPlan[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;

  setPlans: (plans: VisualPlan[]) => void;
  addPlan: (plan: VisualPlan) => void;
  removePlan: (id: string) => void;
  setLoading: (v: boolean) => void;
  setGenerating: (v: boolean) => void;
  setError: (e: string | null) => void;
};

export const useVisualPlanStore = create<VisualPlanStore>((set) => ({
  plans: [],
  isLoading: false,
  isGenerating: false,
  error: null,

  setPlans: (plans) => set({ plans }),
  addPlan: (plan) => set((s) => ({ plans: [plan, ...s.plans] })),
  removePlan: (id) => set((s) => ({ plans: s.plans.filter((p) => p.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setError: (error) => set({ error }),
}));
