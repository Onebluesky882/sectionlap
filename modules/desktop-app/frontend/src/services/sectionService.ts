import { request } from "../lib/api";
import type { Section } from "../types";

export async function listSections(category?: string): Promise<Section[]> {
  const params = category ? `?category=${encodeURIComponent(category)}` : "";
  const res = await request<Section[]>(`/api/sections${params}`);
  return res.data ?? [];
}

export async function createSection(
  data: Omit<Section, "id" | "teacherId" | "teacher">
): Promise<Section> {
  const res = await request<Section>("/api/sections", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.data) throw new Error(res.error ?? "Failed to create section");
  return res.data;
}

export async function updateSection(section: Section): Promise<Section> {
  const res = await request<Section>(`/api/sections/${section.id}`, {
    method: "PUT",
    body: JSON.stringify(section),
  });
  if (!res.data) throw new Error(res.error ?? "Failed to update section");
  return res.data;
}

export async function getJitsiToken(
  sectionId: string
): Promise<{ token: string; roomId: string }> {
  const res = await request<{ token: string; roomId: string }>(
    `/api/sections/${sectionId}/jitsi-token`
  );
  if (!res.data) throw new Error(res.error ?? "Failed to get Jitsi token");
  return res.data;
}
