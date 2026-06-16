import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { SYNC_BASE_URL } from "../config";

export type SyncStatus = "connecting" | "connected" | "disconnected";

// Connects to sync-service (Stage 4a) for the given room and returns the
// shared Y.Doc and connection status. See modules/sync-service/README.md
// for the room-naming convention and shared data shapes.
export function useSyncRoom(roomName: string) {
  const [status, setStatus] = useState<SyncStatus>("connecting");
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const docRef = useRef<Y.Doc | null>(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(SYNC_BASE_URL, roomName, ydoc);
    docRef.current = ydoc;
    setDoc(ydoc);
    setStatus("connecting");

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
