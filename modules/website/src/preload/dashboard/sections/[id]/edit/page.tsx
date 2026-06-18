"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SectionForm from "@/components/SectionForm";
import { useSection } from "@/hooks/useSection";
import { useSectionMutations } from "@/hooks/useSectionMutations";

export default function EditSectionPreload({ id }: { id: string }) {
  const router = useRouter();
  const { section, isLoading: fetching } = useSection(id);
  const { updateSection, isLoading: saving, error } = useSectionMutations();

  async function handleSubmit(data: Parameters<typeof updateSection>[1]) {
    const updated = await updateSection(id, data);
    if (updated) router.push("/dashboard/sections");
  }

  if (fetching) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">กำลังโหลด...</p>
      </main>
    );
  }

  if (!section) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">ไม่พบ section นี้</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-xl mx-auto px-4 py-12 space-y-8">
      <div>
        <nav className="text-xs text-gray-400 mb-1">
          <Link href="/dashboard" className="hover:text-black">Dashboard</Link>
          <span className="mx-1">/</span>
          <Link href="/dashboard/sections" className="hover:text-black">Sections</Link>
          <span className="mx-1">/</span>
          <span className="text-black">แก้ไข</span>
        </nav>
        <h1 className="text-2xl font-bold">แก้ไข Section</h1>
        <p className="text-sm text-gray-400 mt-0.5">{section.title}</p>
      </div>

      <SectionForm
        initial={{
          title: section.title,
          description: section.description,
          price: section.price,
          category: section.category,
          durationMinutes: section.durationMinutes,
          capacity: section.capacity,
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/dashboard/sections")}
        isLoading={saving}
        error={error}
        submitLabel="บันทึกการแก้ไข"
      />
    </main>
  );
}
