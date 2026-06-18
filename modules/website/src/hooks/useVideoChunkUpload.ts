"use client";

import { useRef, useState, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";

const CHUNK_MS = 10_000; // 10 seconds

export type ChunkStatus = "pending" | "uploading" | "done" | "error";

export type ChunkRecord = {
  index: number;
  key: string | null;
  status: ChunkStatus;
};

type VideoChunkState = {
  isRecording: boolean;
  chunks: ChunkRecord[];
  error: string | null;
};

export function useVideoChunkUpload(classId: string) {
  const token = useAuthStore((s) => s.token);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunkIndexRef = useRef(0);

  const [state, setState] = useState<VideoChunkState>({
    isRecording: false,
    chunks: [],
    error: null,
  });

  async function uploadChunk(blob: Blob, index: number) {
    setState((s) => ({
      ...s,
      chunks: s.chunks.map((c) => (c.index === index ? { ...c, status: "uploading" } : c)),
    }));

    try {
      // Get presigned URL for this chunk
      const ticketRes = await fetch("/api/upload-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "video-chunk",
          classId,
          chunkIndex: index,
          contentType: "video/webm",
        }),
      });
      if (!ticketRes.ok) throw new Error(`chunk ${index}: ticket failed`);
      const { data } = (await ticketRes.json()) as { data: { url: string; key: string } };

      // PUT chunk directly to R2
      const putRes = await fetch(data.url, {
        method: "PUT",
        headers: { "Content-Type": "video/webm" },
        body: blob,
      });
      if (!putRes.ok) throw new Error(`chunk ${index}: PUT failed`);

      setState((s) => ({
        ...s,
        chunks: s.chunks.map((c) =>
          c.index === index ? { ...c, key: data.key, status: "done" } : c,
        ),
      }));
    } catch (e) {
      setState((s) => ({
        ...s,
        chunks: s.chunks.map((c) => (c.index === index ? { ...c, status: "error" } : c)),
        error: e instanceof Error ? e.message : "upload error",
      }));
    }
  }

  const startRecording = useCallback(async () => {
    if (state.isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      chunkIndexRef.current = 0;

      const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
      mediaRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size === 0) return;
        const index = chunkIndexRef.current++;
        setState((s) => ({
          ...s,
          chunks: [...s.chunks, { index, key: null, status: "pending" }],
        }));
        uploadChunk(e.data, index);
      };

      recorder.start(CHUNK_MS);
      setState({ isRecording: true, chunks: [], error: null });
    } catch (e) {
      setState((s) => ({
        ...s,
        error: e instanceof Error ? e.message : "ไม่สามารถเข้าถึงกล้องได้",
      }));
    }
  }, [state.isRecording, classId, token]);

  const stopRecording = useCallback(() => {
    mediaRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    mediaRef.current = null;
    streamRef.current = null;
    setState((s) => ({ ...s, isRecording: false }));
  }, []);

  return {
    isRecording: state.isRecording,
    chunks: state.chunks,
    error: state.error,
    startRecording,
    stopRecording,
  };
}
