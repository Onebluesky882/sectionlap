import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useSection } from "../hooks/useSection";
import { useJitsiExternalApi, type JitsiMeetExternalApi } from "../hooks/useJitsiExternalApi";
import { JITSI_BASE_URL } from "../config";
import { WhiteboardPanel } from "../components/WhiteboardPanel";
import { DocumentHighlightPanel } from "../components/DocumentHighlightPanel";

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
    <div className="page live-class-page">
      <Link className="btn btn-link" to={`/sections/${sectionId}`}>
        ← Back to {section.title}
      </Link>
      <h1>Live Class — {section.title}</h1>

      {status === "left" && (
        <div className="note">You left the call. Reopen this page to rejoin.</div>
      )}
      {error && (
        <div className="note">
          Could not load Jitsi from {JITSI_BASE_URL}. Make sure the local
          Jitsi stack (modules/live-class) is running.
        </div>
      )}
      {!ready && !error && <div className="note">Connecting to live class…</div>}

      <div className="tab-bar">
        <button
          className={tab === "video" ? "btn tab-button active" : "btn tab-button"}
          onClick={() => setTab("video")}
        >
          Video Call
        </button>
        <button
          className={tab === "whiteboard" ? "btn tab-button active" : "btn tab-button"}
          onClick={() => setTab("whiteboard")}
        >
          Whiteboard
        </button>
        <button
          className={tab === "highlight" ? "btn tab-button active" : "btn tab-button"}
          onClick={() => setTab("highlight")}
        >
          Document Highlight
        </button>
      </div>

      <div className="jitsi-container" style={{ display: tab === "video" ? "block" : "none" }}>
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      </div>
      {tab === "whiteboard" && <WhiteboardPanel sectionSessionId={section.id} />}
      {tab === "highlight" && <DocumentHighlightPanel sectionSessionId={section.id} />}
    </div>
  );
}
