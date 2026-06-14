import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import type { Section } from "../types";

export interface SectionFormValues {
  title: string;
  description: string;
  price: string;
  teacher: string;
  category: string;
  durationMinutes: string;
}

export const EMPTY_FORM: SectionFormValues = {
  title: "",
  description: "",
  price: "",
  teacher: "",
  category: "",
  durationMinutes: "",
};

function toFormValues(section: Section): SectionFormValues {
  return {
    title: section.title,
    description: section.description,
    price: String(section.price),
    teacher: section.teacher,
    category: section.category,
    durationMinutes: String(section.durationMinutes),
  };
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base ? `${base}-${Date.now()}` : `section-${Date.now()}`;
}

export function useSectionForm() {
  const sections = useAppStore((state) => state.sections);
  const addSection = useAppStore((state) => state.addSection);
  const updateSection = useAppStore((state) => state.updateSection);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<SectionFormValues>(EMPTY_FORM);

  function startCreate() {
    setEditingId("new");
    setValues(EMPTY_FORM);
  }

  function startEdit(section: Section) {
    setEditingId(section.id);
    setValues(toFormValues(section));
  }

  function cancel() {
    setEditingId(null);
    setValues(EMPTY_FORM);
  }

  function submit() {
    if (!editingId) return;

    const section: Section = {
      id: editingId === "new" ? slugify(values.title) : editingId,
      title: values.title,
      description: values.description,
      price: Number(values.price) || 0,
      teacher: values.teacher,
      category: values.category,
      durationMinutes: Number(values.durationMinutes) || 0,
    };

    if (editingId === "new") {
      addSection(section);
    } else {
      updateSection(section);
    }
    cancel();
  }

  return { sections, editingId, values, setValues, startCreate, startEdit, cancel, submit };
}
