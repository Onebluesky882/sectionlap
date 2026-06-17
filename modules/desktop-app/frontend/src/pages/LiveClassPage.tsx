import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useSection } from "../hooks/useSection";
import { useJitsiExternalApi, type JitsiMeetExternalApi } from "../hooks/useJitsiExternalApi";
import { JITSI_BASE_URL, DEFAULT_RTMP_STREAM_KEY } from "../config";
import { WhiteboardPanel } from "../components/WhiteboardPanel";
import { DocumentHighlightPanel } from "../components/DocumentHighlightPanel";
import { Button } from "../components/ui/button";
import { useAppStore } from "../store/useAppStore";
import { getJitsiToken } from "../services/sectionService";

type Tab = "video" | "whiteboard" | "highlight";
type StreamStatus = "idle" | "live";

const inputClass =
  "bg-input/30 border border-border rounded-md text-foreground px-2 py-2 text-sm";

export function LiveClassPage() {
  const { sectionId = "" } = useParams();
  const { section, booking } = useSection(sectionId);
  const { ready, error } = useJitsiExternalApi();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiMeetExternalApi | null>(null);
  const [status, setStatus] = useState<"connecting" | "joined" | "left">("connecting");
  const [tab, setTab] = useState<Tab>("video");
  const [streamStatus, setStreamStatus] = useState<StreamStatus>("idle");
  const [rtmpKey, setRtmpKey] = useState(DEFAULT_RTMP_STREAM_KEY);
  const isTeacher = useAppStore((s) => s.currentUser?.role === "teacher");

  useEffect(() => {
    if (!ready || !section || !containerRef.current) return;

    const domain = JITSI_BASE_URL.replace(/^https?:\/\//, "");

    getJitsiToken(sectionId).then(({ token: jitsiJwt, roomId }) => {
      if (!containerRef.current) return;
      const api = new window.JitsiMeetExternalAPI!(domain, {
        roomName: roomId,
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        jwt: jitsiJwt,
        configOverwrite: {
          prejoinPageEnabled: false,
        },
      });
      apiRef.current = api;

      api.addEventListener("videoConferenceJoined", () => setStatus("joined"));
      api.addEventListener("videoConferenceLeft", () => setStatus("left"));
      api.addEventListener("recordingStatusChanged", (event: unknown) => {
        const e = event as { on: boolean; mode: string };
        if (e.mode === "stream") {
          setStreamStatus(e.on ? "live" : "idle");
        }
      });
    }).catch(() => {
      // Token fetch failed — fall back to unauthenticated join using section.id
      if (!containerRef.current) return;
      const api = new window.JitsiMeetExternalAPI!(domain, {
        roomName: section.id,
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        configOverwrite: {
          prejoinPageEnabled: false,
        },
      });
      apiRef.current = api;
      api.addEventListener("videoConferenceJoined", () => setStatus("joined"));
      api.addEventListener("videoConferenceLeft", () => setStatus("left"));
    });

    return () => {
      apiRef.current?.dispose();
      apiRef.current = null;
      setStreamStatus("idle");
    };
  }, [ready, section, sectionId]);

  function handleStartStream() {
    if (!apiRef.current || !rtmpKey.trim()) return;
    apiRef.current.executeCommand("startRecording", {
      mode: "stream",
      rtmpStreamKey: rtmpKey.trim(),
    });
  }

  function handleStopStream() {
    if (!apiRef.current) return;
    apiRef.current.executeCommand("stopRecording", "stream");
  }

  if (!section) {
    return <Navigate to="/" replace />;
  }

  if (booking?.status !== "paid") {
    return <Navigate to={`/sections/${sectionId}`} replace />;
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="link" asChild className="mb-4 px-0 self-start">
        <Link to={`/sections/${sectionId}`}>← Back to {section.title}</Link>
      </Button>
      <h1 className="text-2xl font-semibold">Live Class — {section.title}</h1>

      {status === "left" && (
        <div className="text-muted-foreground text-sm mt-4">You left the call. Reopen this page to rejoin.</div>
      )}
      {error && (
        <div className="text-muted-foreground text-sm mt-4">
          Could not load Jitsi from {JITSI_BASE_URL}. Make sure the local
          Jitsi stack (modules/live-class) is running.
        </div>
      )}
      {!ready && !error && <div className="text-muted-foreground text-sm mt-4">Connecting to live class…</div>}

      <div className="flex gap-2 my-3">
        <Button
          variant={tab === "video" ? "secondary" : "outline"}
          onClick={() => setTab("video")}
        >
          Video Call
        </Button>
        <Button
          variant={tab === "whiteboard" ? "secondary" : "outline"}
          onClick={() => setTab("whiteboard")}
        >
          Whiteboard
        </Button>
        <Button
          variant={tab === "highlight" ? "secondary" : "outline"}
          onClick={() => setTab("highlight")}
        >
          Document Highlight
        </Button>
      </div>

      {isTeacher && tab === "video" && (
        <div className="flex flex-col gap-2 p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Live Stream</span>
            {streamStatus === "live" && (
              <span className="text-sm font-medium text-destructive">● LIVE</span>
            )}
            {streamStatus === "idle" && (
              <span className="text-sm text-muted-foreground">Idle</span>
            )}
          </div>
          {streamStatus === "idle" && (
            <div className="flex gap-2 items-center">
              <input
                className={inputClass + " flex-1"}
                type="text"
                placeholder="Paste RTMP stream key (e.g. YouTube Live key)"
                value={rtmpKey}
                onChange={(e) => setRtmpKey(e.target.value)}
                aria-label="RTMP stream key"
              />
              <Button
                onClick={handleStartStream}
                disabled={!rtmpKey.trim() || status !== "joined"}
              >
                Start Live Stream
              </Button>
            </div>
          )}
          {streamStatus === "live" && (
            <Button variant="outline" onClick={handleStopStream}>
              Stop Live Stream
            </Button>
          )}
        </div>
      )}

      <div
        className="flex-1 min-h-[480px] rounded-lg overflow-hidden bg-card"
        style={{ display: tab === "video" ? "block" : "none" }}
      >
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      </div>
      {tab === "whiteboard" && <WhiteboardPanel sectionSessionId={section.id} />}
      {tab === "highlight" && <DocumentHighlightPanel sectionSessionId={section.id} />}
    </div>
  );
}
