"use client";

import { useRef, useState, useCallback } from "react";
import { useVideoFileUpload } from "@/hooks/useVideoFileUpload";
import type { FileChunkStatus } from "@/hooks/useVideoFileUpload";
import UploadProgressBar from "@/components/UploadProgressBar";

type Props = {
  classId: string;
  onDone?: (keys: string[]) => void;
};

const STATUS_ICON: Record<FileChunkStatus, string> = {
  waiting:   "○",
  uploading: "↑",
  done:      "✓",
  error:     "✕",
};

const STATUS_COLOR: Record<FileChunkStatus, string> = {
  waiting:   "text-gray-300",
  uploading: "text-blue-500 animate-pulse",
  done:      "text-green-600",
  error:     "text-red-500",
};

function formatSec(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function VideoFileUploader({ classId, onDone }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { phase, parseProgress, chunks, error, upload, reset } = useVideoFileUpload(classId);

  const doneChunks  = chunks.filter((c) => c.status === "done");
  const errorChunks = chunks.filter((c) => c.status === "error");
  const uploadPct   = chunks.length
    ? Math.round((doneChunks.length / chunks.length) * 100)
    : 0;

  function handleFile(file: File) {
    upload(file).then(() => {
      const keys = chunks.filter((c) => c.key).map((c) => c.key!);
      if (keys.length) onDone?.(keys);
    });
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [upload],
  );

  const idle = phase === "idle";
  const busy = phase === "parsing" || phase === "uploading";

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => idle && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (idle) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={[
          "w-full min-h-44 rounded-xl border-2 border-dashed transition-colors",
          "flex flex-col items-center justify-center gap-3 px-6 text-center",
          idle ? "cursor-pointer" : "cursor-default",
          dragOver ? "border-black bg-gray-50" : "border-gray-200",
          idle && !dragOver ? "hover:border-gray-400" : "",
        ].join(" ")}
      >
        {phase === "idle" && (
          <>
            <span className="text-4xl">🎬</span>
            <p className="text-sm text-gray-500">ลากไฟล์ MP4 มาวางที่นี่ หรือคลิกเพื่อเลือก</p>
            <p className="text-xs text-gray-400">ระบบจะตัดเป็น chunk 10 วิ อัตโนมัติ</p>
          </>
        )}

        {phase === "parsing" && (
          <div className="w-full space-y-3">
            <p className="text-sm font-medium text-gray-600">กำลังอ่านไฟล์วิดีโอ…</p>
            <UploadProgressBar progress={parseProgress} />
            <p className="text-xs text-gray-400">{parseProgress}% parsed</p>
          </div>
        )}

        {phase === "uploading" && (
          <div className="w-full space-y-3">
            <p className="text-sm font-medium text-gray-600">
              กำลังอัปโหลด {doneChunks.length}/{chunks.length} chunks…
            </p>
            <UploadProgressBar progress={uploadPct} />
            <p className="text-xs text-gray-400">{uploadPct}%</p>
          </div>
        )}

        {phase === "done" && (
          <div className="space-y-1">
            <p className="text-green-600 font-medium text-sm">✓ อัปโหลดเสร็จสมบูรณ์</p>
            <p className="text-xs text-gray-400">{doneChunks.length} chunks · R2 key prefix: video/{classId}/</p>
          </div>
        )}

        {phase === "error" && !busy && (
          <div className="space-y-1">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,.mp4"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* Chunk grid */}
      {chunks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Chunks — {chunks.length} ทั้งหมด
            </p>
            <div className="flex gap-3 text-xs">
              <span className="text-green-600">{doneChunks.length} done</span>
              {errorChunks.length > 0 && (
                <span className="text-red-500">{errorChunks.length} error</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {chunks.map((c) => (
              <div
                key={c.index}
                title={`${formatSec(c.startSec)} – ${formatSec(c.endSec)}`}
                className={[
                  "flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-mono",
                  c.status === "done"      ? "border-green-200 bg-green-50" :
                  c.status === "error"     ? "border-red-200 bg-red-50" :
                  c.status === "uploading" ? "border-blue-200 bg-blue-50" :
                                             "border-gray-200 bg-gray-50",
                ].join(" ")}
              >
                <span className={STATUS_COLOR[c.status]}>{STATUS_ICON[c.status]}</span>
                <span className="text-gray-500">{String(c.index).padStart(4, "0")}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400">
            hover บน chunk เพื่อดูช่วงเวลา · เรียง parallel 3 ช่องพร้อมกัน
          </p>
        </div>
      )}

      {(phase === "done" || phase === "error") && (
        <button
          onClick={reset}
          className="text-xs text-gray-400 hover:text-black underline underline-offset-2 transition-colors"
        >
          อัปโหลดไฟล์ใหม่
        </button>
      )}
    </div>
  );
}
