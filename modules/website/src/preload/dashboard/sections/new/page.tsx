"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SectionForm from "@/components/SectionForm";
import { useSectionMutations } from "@/hooks/useSectionMutations";

export default function NewSectionPreload() {
  const router = useRouter();
  const { createSection, isLoading, error } = useSectionMutations();

  async function handleSubmit(data: Parameters<typeof createSection>[0]) {
    const section = await createSection(data);
    if (section) router.push("/dashboard/sections");
  }

  return (
    <main className="min-h-screen max-w-xl mx-auto px-4 py-12 space-y-8">
      <div>
        <nav className="text-xs text-gray-400 mb-1">
          <Link href="/dashboard" className="hover:text-black">Dashboard</Link>
          <span className="mx-1">/</span>
          <Link href="/dashboard/sections" className="hover:text-black">Sections</Link>
          <span className="mx-1">/</span>
          <span className="text-black">เพิ่มใหม่</span>
        </nav>
        <h1 className="text-2xl font-bold">เพิ่ม Section ใหม่</h1>
      </div>

      <SectionForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/dashboard/sections")}
        isLoading={isLoading}
        error={error}
        submitLabel="สร้าง Section"
      />
    </main>
  );
}
