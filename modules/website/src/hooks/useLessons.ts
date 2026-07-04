"use client";

import { useCallback, useEffect, useState } from "react";

export type LessonClip = {
  id: string;
  lessonId: string;
  orderIndex: number;
  r2KeyPrefix: string;
  chunkCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type Lesson = {
  id: string;
  sectionId: string;
  title: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  clips: LessonClip[];
};

export function useLessons(sectionId: string) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sections/${sectionId}/lessons`);
      if (!res.ok) throw new Error("โหลดบทเรียนไม่สำเร็จ");
      const { data } = (await res.json()) as { data: Lesson[] };
      setLessons(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { lessons, isLoading, error, refetch };
}
