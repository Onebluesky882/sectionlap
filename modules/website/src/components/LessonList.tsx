"use client";

import { useState } from "react";
import VideoFileUploader from "@/components/VideoFileUploader";
import { useLessons } from "@/hooks/useLessons";
import { useLessonMutations } from "@/hooks/useLessonMutations";

type Props = {
  sectionId: string;
};

const STATUS_LABEL: Record<string, string> = {
  ready: "พร้อมใช้งาน",
  uploading: "กำลังอัปโหลด",
};

export default function LessonList({ sectionId }: Props) {
  const { lessons, isLoading, error, refetch } = useLessons(sectionId);
  const mutations = useLessonMutations();
  const [newTitle, setNewTitle] = useState("");
  const [addingClipFor, setAddingClipFor] = useState<string | null>(null);

  async function handleAddLesson() {
    const title = newTitle.trim();
    if (!title) return;
    const lesson = await mutations.createLesson(sectionId, title);
    if (lesson) {
      setNewTitle("");
      refetch();
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= lessons.length) return;
    const orderedIds = lessons.map((l) => l.id);
    [orderedIds[index], orderedIds[target]] = [orderedIds[target], orderedIds[index]];
    const ok = await mutations.reorderLessons(sectionId, orderedIds);
    if (ok) refetch();
  }

  async function handleDeleteLesson(lessonId: string) {
    const ok = await mutations.deleteLesson(lessonId);
    if (ok) refetch();
  }

  async function handleClipUploaded(lessonId: string, uploadId: string, keys: string[]) {
    if (keys.length === 0) return;
    const clip = await mutations.registerClip(lessonId, `video/${uploadId}/`, keys.length);
    if (clip) {
      setAddingClipFor(null);
      refetch();
    }
  }

  async function handleDeleteClip(lessonId: string, clipId: string) {
    const ok = await mutations.deleteClip(lessonId, clipId);
    if (ok) refetch();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">บทเรียน (Lessons)</h2>

      {isLoading && <p className="text-sm text-[#64748B]">กำลังโหลด...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <ul className="space-y-3">
        {lessons.map((lesson, index) => (
          <li key={lesson.id} className="rounded-lg border border-[#DDE8E6] p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs text-[#64748B]">Topic {index + 1}</p>
                <p className="font-medium">{lesson.title}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  className="text-xs px-2 py-1 rounded border border-[#DDE8E6] disabled:opacity-30 hover:bg-[#F7FAFA]"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === lessons.length - 1}
                  className="text-xs px-2 py-1 rounded border border-[#DDE8E6] disabled:opacity-30 hover:bg-[#F7FAFA]"
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteLesson(lesson.id)}
                  className="text-xs text-red-400 hover:text-red-600 px-2 py-1"
                >
                  ลบ
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {lesson.clips.map((clip, clipIndex) => (
                <div
                  key={clip.id}
                  className="flex items-center justify-between gap-2 text-sm bg-[#F7FAFA] rounded-lg px-3 py-2"
                >
                  <span>
                    คลิป {clipIndex + 1} · {STATUS_LABEL[clip.status] ?? clip.status} · {clip.chunkCount} chunks
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteClip(lesson.id, clip.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    ลบ
                  </button>
                </div>
              ))}

              {addingClipFor === lesson.id ? (
                <ClipUploader
                  lessonId={lesson.id}
                  onDone={(uploadId, keys) => handleClipUploaded(lesson.id, uploadId, keys)}
                  onCancel={() => setAddingClipFor(null)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingClipFor(lesson.id)}
                  className="text-xs text-[#6AA098] hover:underline"
                >
                  + เพิ่มคลิป
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 pt-1">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddLesson();
            }
          }}
          placeholder="ชื่อ topic ของบทเรียนใหม่"
          className="flex-1 border border-[#DDE8E6] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6AA098]"
        />
        <button
          type="button"
          onClick={handleAddLesson}
          disabled={mutations.isLoading}
          className="rounded-lg border border-[#DDE8E6] px-4 py-2 text-sm hover:bg-[#F7FAFA] disabled:opacity-40"
        >
          + เพิ่มบทเรียน
        </button>
      </div>
      {mutations.error && <p className="text-sm text-red-500">{mutations.error}</p>}
    </div>
  );
}

function ClipUploader({
  lessonId,
  onDone,
  onCancel,
}: {
  lessonId: string;
  onDone: (uploadId: string, keys: string[]) => void;
  onCancel: () => void;
}) {
  const [uploadId] = useState(() => `lesson-${lessonId}-clip-${crypto.randomUUID()}`);
  return (
    <div className="space-y-2 border border-dashed border-[#DDE8E6] rounded-lg p-3">
      <VideoFileUploader classId={uploadId} onDone={(keys) => onDone(uploadId, keys)} />
      <button type="button" onClick={onCancel} className="text-xs text-[#64748B] hover:text-black underline">
        ยกเลิก
      </button>
    </div>
  );
}
