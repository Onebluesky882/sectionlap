"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export type UploadState = {
  isUploading: boolean;
  progress: number;
  key: string | null;
  error: string | null;
};

export function useUpload() {
  const token = useAuthStore((s) => s.token);
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    key: null,
    error: null,
  });

  async function uploadImage(file: File): Promise<string | null> {
    setState({ isUploading: true, progress: 0, key: null, error: null });
    try {
      // 1. Get presigned PUT URL
      const ticketRes = await fetch("/api/upload-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "image",
          name: file.name,
          contentType: file.type,
        }),
      });
      if (!ticketRes.ok) throw new Error("ขอ upload ticket ไม่สำเร็จ");
      const { data } = (await ticketRes.json()) as { data: { url: string; key: string } };

      setState((s) => ({ ...s, progress: 20 }));

      // 2. PUT file directly to R2
      const putRes = await fetch(data.url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("อัปโหลดไฟล์ไม่สำเร็จ");

      setState({ isUploading: false, progress: 100, key: data.key, error: null });
      return data.key;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
      setState({ isUploading: false, progress: 0, key: null, error: msg });
      return null;
    }
  }

  function reset() {
    setState({ isUploading: false, progress: 0, key: null, error: null });
  }

  return { ...state, uploadImage, reset };
}
