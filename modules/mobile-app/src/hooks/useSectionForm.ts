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
  capacity: string;
}

const EMPTY: SectionFormValues = {
  title: "",
  description: "",
  price: "",
  teacher: "",
  category: "",
  durationMinutes: "",
  capacity: "",
};

function toValues(s: Section): SectionFormValues {
  return {
    title: s.title,
    description: s.description,
    price: String(s.price),
    teacher: s.teacher,
    category: s.category,
    durationMinutes: String(s.durationMinutes),
    capacity: String(s.capacity),
  };
}

export function useSectionForm() {
  const currentUser = useAppStore((s) => s.currentUser);
  const sections = useAppStore((s) =>
    currentUser ? s.sections.filter((x) => x.teacherId === currentUser.id) : []
  );
  const addSection = useAppStore((s) => s.addSection);
  const updateSection = useAppStore((s) => s.updateSection);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<SectionFormValues>({
    ...EMPTY,
    teacher: currentUser?.name ?? "",
  });

  function startCreate() {
    setEditingId("new");
    setValues({ ...EMPTY, teacher: currentUser?.name ?? "" });
  }

  function startEdit(section: Section) {
    setEditingId(section.id);
    setValues(toValues(section));
  }

  function cancel() {
    setEditingId(null);
    setValues({ ...EMPTY, teacher: currentUser?.name ?? "" });
  }

  async function submit() {
    if (!editingId || !currentUser) return;
    const data = {
      title: values.title,
      description: values.description,
      price: Number(values.price) || 0,
      teacher: values.teacher,
      category: values.category,
      durationMinutes: Number(values.durationMinutes) || 0,
      capacity: Number(values.capacity) || 0,
    };
    if (editingId === "new") {
      await addSection(data);
    } else {
      await updateSection({ ...data, id: editingId, teacherId: currentUser.id });
    }
    cancel();
  }

  return { sections, currentUser, editingId, values, setValues, startCreate, startEdit, cancel, submit };
}
