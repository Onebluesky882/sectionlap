"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useLiveClass } from "@/hooks/useLiveClass";

const JITSI_URL = process.env.NEXT_PUBLIC_JITSI_URL ?? "https://meet.jit.si";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JitsiMeetExternalAPI: new (domain: string, options: Record<string, unknown>) => any;
  }
}

export default function LiveClassPreload({ id }: { id: string }) {
  const { jitsiToken, roomId, isLoading, error, user } = useLiveClass(id);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!jitsiToken || !roomId || !containerRef.current) return;
    if (typeof window.JitsiMeetExternalAPI === "undefined") return;

    const domain = JITSI_URL.replace(/^https?:\/\//, "");

    apiRef.current = new window.JitsiMeetExternalAPI(domain, {
      roomName: roomId,
      jwt: jitsiToken,
      parentNode: containerRef.current,
      width: "100%",
      height: "100%",
      userInfo: { displayName: user?.name ?? "ผู้ใช้" },
      configOverwrite: {
        prejoinPageEnabled: false,
        disableDeepLinking: true,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: ["microphone", "camera", "chat", "raisehand", "tileview", "hangup"],
        SHOW_JITSI_WATERMARK: false,
      },
    });

    apiRef.current.addEventListener("readyToClose", () => {
      router.back();
    });

    return () => {
      apiRef.current?.dispose();
    };
  }, [jitsiToken, roomId, user?.name, router]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <p className="text-sm text-[#64748B]">กำลังเข้าห้องเรียน...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-500">{error}</p>
        <button onClick={() => router.back()} className="text-sm text-[#6AA098] underline underline-offset-2">
          กลับ
        </button>
      </div>
    );
  }

  const jitsiDomain = JITSI_URL.replace(/^https?:\/\//, "");

  return (
    <>
      <Script
        src={`${JITSI_URL}/external_api.js`}
        strategy="afterInteractive"
        onLoad={() => {
          if (!jitsiToken || !roomId || !containerRef.current) return;
          apiRef.current = new window.JitsiMeetExternalAPI(jitsiDomain, {
            roomName: roomId,
            jwt: jitsiToken,
            parentNode: containerRef.current,
            width: "100%",
            height: "100%",
            userInfo: { displayName: user?.name ?? "ผู้ใช้" },
            configOverwrite: { prejoinPageEnabled: false, disableDeepLinking: true },
            interfaceConfigOverwrite: {
              TOOLBAR_BUTTONS: ["microphone", "camera", "chat", "raisehand", "tileview", "hangup"],
              SHOW_JITSI_WATERMARK: false,
            },
          });
          apiRef.current.addEventListener("readyToClose", () => router.back());
        }}
      />
      <div
        ref={containerRef}
        className="w-full"
        style={{ height: "calc(100vh - 56px)" }}
      />
    </>
  );
}
