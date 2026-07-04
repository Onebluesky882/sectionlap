"use client";

import { useState } from "react";
import { authFetch } from "@/lib/authFetch";
import type { Lesson, LessonClip } from "@/hooks/useLessons";

export function useLessonMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run<T>(fn: () => Promise<T>): Promise<T | null> {
    setIsLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function throwIfNotOk(res: Response, fallback: string) {
    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      throw new Error(body.error ?? fallback);
    }
  }

  function createLesson(sectionId: string, title: string) {
    return run(async () => {
      const res = await authFetch(`/api/sections/${sectionId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      await throwIfNotOk(res, "สร้างบทเรียนไม่สำเร็จ");
      const { data } = (await res.json()) as { data: Lesson };
      return data;
    });
  }

  function updateLesson(lessonId: string, title: string) {
    return run(async () => {
      const res = await authFetch(`/api/lessons/${lessonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      await throwIfNotOk(res, "แก้ไขบทเรียนไม่สำเร็จ");
      const { data } = (await res.json()) as { data: Lesson };
      return data;
    });
  }

  function deleteLesson(lessonId: string) {
    return run(async () => {
      const res = await authFetch(`/api/lessons/${lessonId}`, { method: "DELETE" });
      await throwIfNotOk(res, "ลบบทเรียนไม่สำเร็จ");
      return true;
    });
  }

  function reorderLessons(sectionId: string, orderedIds: string[]) {
    return run(async () => {
      const res = await authFetch(`/api/sections/${sectionId}/lessons/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      await throwIfNotOk(res, "เรียงลำดับไม่สำเร็จ");
      return true;
    });
  }

  function registerClip(lessonId: string, r2KeyPrefix: string, chunkCount: number) {
    return run(async () => {
      const res = await authFetch(`/api/lessons/${lessonId}/clips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ r2KeyPrefix, chunkCount }),
      });
      await throwIfNotOk(res, "บันทึกคลิปไม่สำเร็จ");
      const { data } = (await res.json()) as { data: LessonClip };
      return data;
    });
  }

  function deleteClip(lessonId: string, clipId: string) {
    return run(async () => {
      const res = await authFetch(`/api/lessons/${lessonId}/clips/${clipId}`, { method: "DELETE" });
      await throwIfNotOk(res, "ลบคลิปไม่สำเร็จ");
      return true;
    });
  }

  return {
    createLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    registerClip,
    deleteClip,
    isLoading,
    error,
  };
}
