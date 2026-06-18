import { create } from "zustand";

export type Section = {
  id: string;
  title: string;
  description: string;
  teacher: string;
  teacherId: string;
  category: string;
  price: number;
  capacity: number;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
};

type SectionStore = {
  sections: Section[];
  selected: Section | null;
  isLoading: boolean;
  error: string | null;

  setSections: (sections: Section[]) => void;
  setSelected: (section: Section | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useSectionStore = create<SectionStore>((set) => ({
  sections: [],
  selected: null,
  isLoading: false,
  error: null,

  setSections: (sections) => set({ sections }),
  setSelected: (selected) => set({ selected }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
