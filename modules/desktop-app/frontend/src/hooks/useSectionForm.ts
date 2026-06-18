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
<<<<<<< HEAD
=======
  capacity: string;
>>>>>>> wansing
}

export const EMPTY_FORM: SectionFormValues = {
  title: "",
  description: "",
  price: "",
  teacher: "",
  category: "",
  durationMinutes: "",
<<<<<<< HEAD
=======
  capacity: "",
>>>>>>> wansing
};

function toFormValues(section: Section): SectionFormValues {
  return {
    title: section.title,
    description: section.description,
    price: String(section.price),
    teacher: section.teacher,
    category: section.category,
    durationMinutes: String(section.durationMinutes),
<<<<<<< HEAD
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
=======
    capacity: String(section.capacity),
  };
}

export function useSectionForm() {
  const currentUser = useAppStore((state) => state.currentUser);
  const sections = useAppStore((state) =>
    currentUser ? state.sections.filter((s) => s.teacherId === currentUser.id) : []
  );
>>>>>>> wansing
  const addSection = useAppStore((state) => state.addSection);
  const updateSection = useAppStore((state) => state.updateSection);

  const [editingId, setEditingId] = useState<string | null>(null);
<<<<<<< HEAD
  const [values, setValues] = useState<SectionFormValues>(EMPTY_FORM);

  function startCreate() {
    setEditingId("new");
    setValues(EMPTY_FORM);
=======
  const [values, setValues] = useState<SectionFormValues>({
    ...EMPTY_FORM,
    teacher: currentUser?.name ?? "",
  });

  function startCreate() {
    setEditingId("new");
    setValues({ ...EMPTY_FORM, teacher: currentUser?.name ?? "" });
>>>>>>> wansing
  }

  function startEdit(section: Section) {
    setEditingId(section.id);
    setValues(toFormValues(section));
  }

  function cancel() {
    setEditingId(null);
<<<<<<< HEAD
    setValues(EMPTY_FORM);
  }

  function submit() {
    if (!editingId) return;

    const section: Section = {
      id: editingId === "new" ? slugify(values.title) : editingId,
=======
    setValues({ ...EMPTY_FORM, teacher: currentUser?.name ?? "" });
  }

  async function submit() {
    if (!editingId || !currentUser) return;

    const sectionData = {
>>>>>>> wansing
      title: values.title,
      description: values.description,
      price: Number(values.price) || 0,
      teacher: values.teacher,
      category: values.category,
      durationMinutes: Number(values.durationMinutes) || 0,
<<<<<<< HEAD
    };

    if (editingId === "new") {
      addSection(section);
    } else {
      updateSection(section);
=======
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
>>>>>>> wansing
    }
    cancel();
  }

<<<<<<< HEAD
  return { sections, editingId, values, setValues, startCreate, startEdit, cancel, submit };
=======
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
>>>>>>> wansing
}
