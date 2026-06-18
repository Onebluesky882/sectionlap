"use client";

import { useRef, useEffect, useState } from "react";
import { useVideoChunkUpload } from "@/hooks/useVideoChunkUpload";
import type { ChunkStatus } from "@/hooks/useVideoChunkUpload";

type Props = {
  classId: string;
  onChunkDone?: (key: string, index: number) => void;
};

const STATUS_ICON: Record<ChunkStatus, string> = {
  pending:   "○",
  uploading: "↑",
  done:      "✓",
  error:     "✕",
};

const STATUS_COLOR: Record<ChunkStatus, string> = {
  pending:   "text-gray-400",
  uploading: "text-blue-500 animate-pulse",
  done:      "text-green-600",
  error:     "text-red-500",
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function VideoChunkRecorder({ classId, onChunkDone }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isRecording, chunks, error, startRecording, stopRecording } = useVideoChunkUpload(classId);

  // Elapsed timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Mirror live stream into <video>
  useEffect(() => {
    if (!isRecording || !videoRef.current) return;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    });
  }, [isRecording]);

  // Fire onChunkDone callback
  useEffect(() => {
    chunks.forEach((c) => {
      if (c.status === "done" && c.key) onChunkDone?.(c.key, c.index);
    });
  }, [chunks]);

  const doneCount = chunks.filter((c) => c.status === "done").length;
  const errorCount = chunks.filter((c) => c.status === "error").length;

  return (
    <div className="space-y-4">
      {/* Camera preview */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
        {isRecording ? (
          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">🎥</span>
            <p className="text-gray-400 text-sm">กดเริ่มบันทึกเพื่อเปิดกล้อง</p>
          </div>
        )}

        {/* Recording badge */}
        {isRecording && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs font-mono">{formatTime(elapsed)}</span>
          </div>
        )}

        {/* Chunk counter */}
        {isRecording && chunks.length > 0 && (
          <div className="absolute top-3 right-3 bg-black/60 rounded-full px-3 py-1">
            <span className="text-white text-xs font-mono">
              {doneCount}/{chunks.length} chunks
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-red-500 text-white py-3 text-sm font-medium hover:bg-red-600 transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
            เริ่มบันทึก
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gray-900 text-white py-3 text-sm font-medium hover:bg-black transition-colors"
          >
            <span className="w-3 h-3 rounded-sm bg-white" />
            หยุดบันทึก
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* Chunk list */}
      {chunks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Chunks</p>
            {errorCount > 0 && (
              <span className="text-xs text-red-500">{errorCount} ล้มเหลว</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {chunks.map((c) => (
              <div
                key={c.index}
                title={c.key ?? `chunk ${c.index}`}
                className={[
                  "flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-mono",
                  c.status === "done"      ? "border-green-200 bg-green-50" :
                  c.status === "error"     ? "border-red-200 bg-red-50" :
                  c.status === "uploading" ? "border-blue-200 bg-blue-50" :
                                             "border-gray-200 bg-gray-50",
                ].join(" ")}
              >
                <span className={STATUS_COLOR[c.status]}>{STATUS_ICON[c.status]}</span>
                <span className="text-gray-600">{String(c.index).padStart(4, "0")}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            แต่ละ chunk = 10 วินาที · {doneCount} อัปโหลดแล้ว
          </p>
        </div>
      )}
    </div>
  );
}
