import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useSection } from "../hooks/useSection";
import { useJitsiExternalApi, type JitsiMeetExternalApi } from "../hooks/useJitsiExternalApi";
import { JITSI_BASE_URL } from "../config";

export function LiveClassPage() {
  const { sectionId = "" } = useParams();
  const { section, booking } = useSection(sectionId);
  const { ready, error } = useJitsiExternalApi();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiMeetExternalApi | null>(null);
  const [status, setStatus] = useState<"connecting" | "joined" | "left">("connecting");

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

      <div ref={containerRef} className="jitsi-container" />
    </div>
  );
}
