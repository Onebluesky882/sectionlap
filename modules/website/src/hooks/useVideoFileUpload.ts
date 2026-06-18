"use client";

import { useState, useCallback } from "react";
import { chunkMP4File } from "@/lib/videoChunker";
import { useAuthStore } from "@/store/useAuthStore";

export type FileChunkStatus = "waiting" | "uploading" | "done" | "error";

export type FileChunkRecord = {
  index: number;
  startSec: number;
  endSec: number;
  status: FileChunkStatus;
  key: string | null;
};

type State = {
  phase: "idle" | "parsing" | "uploading" | "done" | "error";
  parseProgress: number;
  chunks: FileChunkRecord[];
  error: string | null;
};

const INIT: State = {
  phase: "idle",
  parseProgress: 0,
  chunks: [],
  error: null,
};

export function useVideoFileUpload(classId: string) {
  const token = useAuthStore((s) => s.token);
  const [state, setState] = useState<State>(INIT);

  const upload = useCallback(
    async (file: File) => {
      if (!file.type.includes("mp4") && !file.name.endsWith(".mp4")) {
        setState((s) => ({ ...s, phase: "error", error: "รองรับเฉพาะไฟล์ MP4" }));
        return;
      }

      setState({ phase: "parsing", parseProgress: 0, chunks: [], error: null });

      let videoChunks: Awaited<ReturnType<typeof chunkMP4File>>;
      try {
        videoChunks = await chunkMP4File(file, {
          chunkDurationSec: 10,
          onProgress: ({ parsed, chunked, total }) => {
            setState((s) => ({
              ...s,
              parseProgress: parsed,
              chunks:
                chunked > s.chunks.length
                  ? Array.from({ length: chunked }, (_, i) => {
                      const existing = s.chunks[i];
                      return existing ?? {
                        index: i,
                        startSec: i * 10,
                        endSec: (i + 1) * 10,
                        status: "waiting" as FileChunkStatus,
                        key: null,
                      };
                    })
                  : s.chunks,
              ...(total > 0
                ? {
                    chunks: Array.from({ length: total }, (_, i) => ({
                      index: i,
                      startSec: i * 10,
                      endSec: (i + 1) * 10,
                      status: "waiting" as FileChunkStatus,
                      key: null,
                    })),
                  }
                : {}),
            }));
          },
        });
      } catch (e) {
        setState((s) => ({
          ...s,
          phase: "error",
          error: e instanceof Error ? e.message : "แยก chunk ไม่สำเร็จ",
        }));
        return;
      }

      // Initialise chunk list from actual segmentation result
      setState((s) => ({
        ...s,
        phase: "uploading",
        chunks: videoChunks.map((c) => ({
          index: c.index,
          startSec: c.startSec,
          endSec: c.endSec,
          status: "waiting",
          key: null,
        })),
      }));

      // Upload chunks in parallel (concurrency 3)
      const queue = [...videoChunks];
      const CONCURRENCY = 3;

      async function uploadOne(c: (typeof videoChunks)[number]) {
        setState((s) => ({
          ...s,
          chunks: s.chunks.map((r) =>
            r.index === c.index ? { ...r, status: "uploading" } : r,
          ),
        }));
        try {
          const ticketRes = await fetch("/api/upload-ticket", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              type: "video-chunk",
              classId,
              chunkIndex: c.index,
              contentType: "video/mp4",
            }),
          });
          if (!ticketRes.ok) throw new Error(`chunk ${c.index}: ticket failed`);
          const { data } = (await ticketRes.json()) as { data: { url: string; key: string } };

          const putRes = await fetch(data.url, {
            method: "PUT",
            headers: { "Content-Type": "video/mp4" },
            body: c.blob,
          });
          if (!putRes.ok) throw new Error(`chunk ${c.index}: PUT failed`);

          setState((s) => ({
            ...s,
            chunks: s.chunks.map((r) =>
              r.index === c.index ? { ...r, status: "done", key: data.key } : r,
            ),
          }));
        } catch (e) {
          setState((s) => ({
            ...s,
            chunks: s.chunks.map((r) =>
              r.index === c.index ? { ...r, status: "error" } : r,
            ),
            error: e instanceof Error ? e.message : "upload error",
          }));
        }
      }

      // Sliding window concurrency
      async function runner() {
        while (queue.length > 0) {
          const batch = queue.splice(0, CONCURRENCY);
          await Promise.all(batch.map(uploadOne));
        }
        setState((s) => {
          const hasError = s.chunks.some((c) => c.status === "error");
          return { ...s, phase: hasError ? "error" : "done" };
        });
      }

      await runner();
    },
    [classId, token],
  );

  function reset() {
    setState(INIT);
  }

  return { ...state, upload, reset };
}
