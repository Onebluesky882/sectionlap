"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/authFetch";
import { useAuthStore } from "@/store/useAuthStore";

type JitsiTokenResult = {
  token: string;
  roomId: string;
};

export function useLiveClass(sectionId: string) {
  const [jitsiToken, setJitsiToken] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!sectionId) return;
    setIsLoading(true);
    authFetch(`/api/sections/${sectionId}/jitsi-token`, {
      headers: { "X-User-Name": user?.name ?? "" },
    })
      .then((res) => res.json() as Promise<{ data?: JitsiTokenResult; error?: string }>)
      .then(({ data, error: err }) => {
        if (!data) throw new Error(err ?? "ไม่สามารถเข้าห้องเรียนได้");
        setJitsiToken(data.token);
        setRoomId(data.roomId);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด"))
      .finally(() => setIsLoading(false));
  }, [sectionId, user?.name]);

  return { jitsiToken, roomId, isLoading, error, user };
}
