"use client";

import { useRef, useState, useCallback } from "react";
import { useUpload } from "@/hooks/useUpload";
import UploadProgressBar from "@/components/UploadProgressBar";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

type Props = {
  onUploaded?: (key: string) => void;
  label?: string;
};

export default function ImageUpload({ onUploaded, label = "อัปโหลดรูปภาพ" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const { isUploading, progress, key, error, uploadImage, reset } = useUpload();

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      return;
    }
    if (file.size > MAX_BYTES) {
      return;
    }
    setPreview(URL.createObjectURL(file));
    uploadImage(file).then((k) => {
      if (k) onUploaded?.(k);
    });
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [uploadImage],
  );

  function handleClear() {
    setPreview(null);
    reset();
    if (inputRef.current) inputRef.current.value = "";
  }

  const uploaded = !!key;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">{label}</p>

      {/* Drop zone */}
      <div
        onClick={() => !isUploading && !uploaded && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={[
          "relative w-full rounded-xl border-2 border-dashed transition-colors overflow-hidden",
          "flex flex-col items-center justify-center min-h-48 cursor-pointer",
          dragOver ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400",
          (isUploading || uploaded) ? "cursor-default" : "",
        ].join(" ")}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="w-full h-full object-cover absolute inset-0" />
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center select-none">
            <span className="text-3xl">🖼️</span>
            <p className="text-sm text-gray-500">ลากรูปมาวางที่นี่ หรือคลิกเพื่อเลือก</p>
            <p className="text-xs text-gray-400">JPG, PNG, WEBP, GIF · สูงสุด 10 MB</p>
          </div>
        )}

        {/* Uploading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3 p-6">
            <p className="text-white text-sm font-medium">กำลังอัปโหลด {progress}%</p>
            <UploadProgressBar progress={progress} className="w-full max-w-xs" />
          </div>
        )}

        {/* Done overlay */}
        {uploaded && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white rounded-full px-4 py-1.5 flex items-center gap-2 shadow">
              <span className="text-green-600 text-sm font-medium">✓ อัปโหลดสำเร็จ</span>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      {(preview || uploaded) && !isUploading && (
        <button
          onClick={handleClear}
          className="text-xs text-gray-400 hover:text-black underline underline-offset-2 transition-colors"
        >
          ลบและเลือกใหม่
        </button>
      )}

      {uploaded && key && (
        <p className="text-xs text-gray-400 font-mono break-all">{key}</p>
      )}
    </div>
  );
}
