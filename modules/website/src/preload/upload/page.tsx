"use client";

import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import VideoChunkRecorder from "@/components/VideoChunkRecorder";

const DEMO_CLASS_ID = "class-demo-001";

type Tab = "image" | "video";

export default function UploadPreload() {
  const [tab, setTab] = useState<Tab>("image");
  const [uploadedKeys, setUploadedKeys] = useState<string[]>([]);

  return (
    <main className="min-h-screen max-w-xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">อัปโหลดไฟล์</h1>
        <p className="text-sm text-gray-500 mt-1">รูปภาพและวิดีโอสำหรับคลาส</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-gray-200 overflow-hidden">
        {(["image", "video"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === t ? "bg-black text-white" : "hover:bg-gray-50 text-gray-600"
            }`}
          >
            {t === "image" ? "🖼️ รูปภาพ" : "🎥 วิดีโอ"}
          </button>
        ))}
      </div>

      {tab === "image" && (
        <ImageUpload
          label="เลือกรูปภาพ"
          onUploaded={(key) => setUploadedKeys((ks) => [...ks, key])}
        />
      )}

      {tab === "video" && (
        <VideoChunkRecorder
          classId={DEMO_CLASS_ID}
          onChunkDone={(key) => setUploadedKeys((ks) => [...ks, key])}
        />
      )}

      {/* Uploaded keys log */}
      {uploadedKeys.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">R2 Keys</p>
          {uploadedKeys.map((k) => (
            <p key={k} className="text-xs font-mono text-gray-500 bg-gray-50 rounded px-2 py-1 break-all">
              {k}
            </p>
          ))}
        </div>
      )}
    </main>
  );
}
