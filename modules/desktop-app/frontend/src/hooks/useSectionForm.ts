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

export const EMPTY_FORM: SectionFormValues = {
  title: "",
  description: "",
  price: "",
  teacher: "",
  category: "",
  durationMinutes: "",
  capacity: "",
};

function toFormValues(section: Section): SectionFormValues {
  return {
    title: section.title,
    description: section.description,
    price: String(section.price),
    teacher: section.teacher,
    category: section.category,
    durationMinutes: String(section.durationMinutes),
    capacity: String(section.capacity),
  };
}

export function useSectionForm() {
  const currentUser = useAppStore((state) => state.currentUser);
  const sections = useAppStore((state) =>
    state.sections.filter((s) => s.teacherId === currentUser?.id)
  );
  const addSection = useAppStore((state) => state.addSection);
  const updateSection = useAppStore((state) => state.updateSection);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<SectionFormValues>({
    ...EMPTY_FORM,
    teacher: currentUser?.name ?? "",
  });

  function startCreate() {
    setEditingId("new");
    setValues({ ...EMPTY_FORM, teacher: currentUser?.name ?? "" });
  }

  function startEdit(section: Section) {
    setEditingId(section.id);
    setValues(toFormValues(section));
  }

  function cancel() {
    setEditingId(null);
    setValues({ ...EMPTY_FORM, teacher: currentUser?.name ?? "" });
  }

  async function submit() {
    if (!editingId || !currentUser) return;

    const sectionData = {
      title: values.title,
      description: values.description,
      price: Number(values.price) || 0,
      teacher: values.teacher,
      category: values.category,
      durationMinutes: Number(values.durationMinutes) || 0,
      capacity: Number(values.capacity) || 0,
    };

    if (editingId === "new") {
      await addSection(sectionData);
    } else {
      await updateSection({
        ...sectionData,
        id: editingId,
        teacherId: currentUser.id,
      });
    }
    cancel();
  }

  return {
    sections,
    currentUser,
    editingId,
    values,
    setValues,
    startCreate,
    startEdit,
    cancel,
    submit,
  };
}
