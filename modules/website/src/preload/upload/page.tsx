"use client";

import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import VideoChunkRecorder from "@/components/VideoChunkRecorder";
import VideoFileUploader from "@/components/VideoFileUploader";

const DEMO_CLASS_ID = "class-demo-001";

type Tab = "image" | "live" | "file";

const TABS: { id: Tab; label: string }[] = [
  { id: "image", label: "🖼️ รูปภาพ" },
  { id: "live",  label: "🔴 Live" },
  { id: "file",  label: "🎬 ไฟล์วิดีโอ" },
];

export default function UploadPreload() {
  const [tab, setTab] = useState<Tab>("image");
  const [uploadedKeys, setUploadedKeys] = useState<string[]>([]);

  function addKeys(keys: string | string[]) {
    setUploadedKeys((ks) => [...ks, ...(Array.isArray(keys) ? keys : [keys])]);
  }

  return (
    <main className="min-h-screen max-w-xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">อัปโหลดไฟล์</h1>
        <p className="text-sm text-gray-500 mt-1">รูปภาพ · Live recording · ไฟล์วิดีโอ</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-gray-200 overflow-hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id ? "bg-black text-white" : "hover:bg-gray-50 text-gray-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "image" && (
        <ImageUpload
          label="เลือกรูปภาพ"
          onUploaded={(key) => addKeys(key)}
        />
      )}

      {tab === "live" && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">
            อัปโหลด chunk ทุก 10 วินาที ขณะ live อัตโนมัติ
          </p>
          <VideoChunkRecorder
            classId={DEMO_CLASS_ID}
            onChunkDone={(key) => addKeys(key)}
          />
        </div>
      )}

      {tab === "file" && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">
            เลือกไฟล์ MP4 — ระบบตัด chunk 10 วิ แล้วอัปโหลดพร้อมกัน 3 ช่อง
          </p>
          <VideoFileUploader
            classId={DEMO_CLASS_ID}
            onDone={(keys) => addKeys(keys)}
          />
        </div>
      )}

      {/* R2 keys log */}
      {uploadedKeys.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            R2 Keys ({uploadedKeys.length})
          </p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {uploadedKeys.map((k) => (
              <p
                key={k}
                className="text-xs font-mono text-gray-500 bg-gray-50 rounded px-2 py-1 break-all"
              >
                {k}
              </p>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
