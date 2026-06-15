import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useSection } from "../hooks/useSection";
import { useJitsiExternalApi, type JitsiMeetExternalApi } from "../hooks/useJitsiExternalApi";
import { JITSI_BASE_URL } from "../config";
import { WhiteboardPanel } from "../components/WhiteboardPanel";
import { DocumentHighlightPanel } from "../components/DocumentHighlightPanel";
import { Button } from "../components/ui/button";

type Tab = "video" | "whiteboard" | "highlight";

export function LiveClassPage() {
  const { sectionId = "" } = useParams();
  const { section, booking } = useSection(sectionId);
  const { ready, error } = useJitsiExternalApi();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiMeetExternalApi | null>(null);
  const [status, setStatus] = useState<"connecting" | "joined" | "left">("connecting");
  const [tab, setTab] = useState<Tab>("video");

  useEffect(() => {
    if (!ready || !section || !containerRef.current) return;

    const domain = JITSI_BASE_URL.replace(/^https?:\/\//, "");
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

    return () => {
      api.dispose();
      apiRef.current = null;
    };
  }, [ready, section]);

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
