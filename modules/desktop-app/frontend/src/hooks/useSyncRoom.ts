import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { SYNC_BASE_URL } from "../config";

export type SyncStatus = "connecting" | "connected" | "disconnected";

// Connects to the sync-service (Stage 4a) WebSocket server for the given
// room and returns the shared Y.Doc plus connection status. See
// modules/sync-service/README.md for the room-naming convention and
// shared data shapes (strokes, document, highlights).
export function useSyncRoom(roomName: string) {
  const [status, setStatus] = useState<SyncStatus>("connecting");
  const docRef = useRef<Y.Doc | null>(null);
  const [doc, setDoc] = useState<Y.Doc | null>(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(SYNC_BASE_URL, roomName, ydoc);

    setStatus("connecting");
    docRef.current = ydoc;
    setDoc(ydoc);

    const onStatus = (event: { status: SyncStatus }) => setStatus(event.status);
    provider.on("status", onStatus);

    return () => {
      provider.off("status", onStatus);
      provider.destroy();
      ydoc.destroy();
      docRef.current = null;
      setDoc(null);
    };
  }, [roomName]);

  return { doc, status };
}
