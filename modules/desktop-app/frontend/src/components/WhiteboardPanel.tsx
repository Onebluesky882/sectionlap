import { useSyncRoom } from "../hooks/useSyncRoom";
import { SyncCanvas } from "./SyncCanvas";
import type { Stroke } from "../types";

const WIDTH = 800;
const HEIGHT = 500;

interface WhiteboardPanelProps {
  sectionSessionId: string;
}

export function WhiteboardPanel({ sectionSessionId }: WhiteboardPanelProps) {
  const { doc, status } = useSyncRoom(`whiteboard-${sectionSessionId}`);
  const strokes = doc?.getArray<Stroke>("strokes");

  return (
    <div className="sync-panel">
      {status !== "connected" && (
        <div className="note">
          {status === "connecting"
            ? "Connecting to whiteboard…"
            : "Disconnected from sync service. Make sure modules/sync-service is running."}
        </div>
      )}
      <SyncCanvas strokes={strokes} width={WIDTH} height={HEIGHT} />
    </div>
  );
}
