// Local self-hosted Jitsi Meet instance (modules/live-class, Stage 2a).
// Override with VITE_JITSI_BASE_URL if the docker-compose stack runs on a
// different host/port (see modules/live-class/.env.example).
export const JITSI_BASE_URL =
  import.meta.env.VITE_JITSI_BASE_URL ?? "http://localhost:8000";

// Local sync-service instance (modules/sync-service, Stage 4a) for the
// real-time whiteboard and document-highlight features.
// Override with VITE_SYNC_BASE_URL if the server runs on a different host/port.
export const SYNC_BASE_URL =
  import.meta.env.VITE_SYNC_BASE_URL ?? "ws://localhost:1234";
