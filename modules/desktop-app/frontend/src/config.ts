// Local self-hosted Jitsi Meet instance (modules/live-class, Stage 2a).
// Override with VITE_JITSI_BASE_URL if the docker-compose stack runs on a
// different host/port (see modules/live-class/.env.example).
export const JITSI_BASE_URL =
  import.meta.env.VITE_JITSI_BASE_URL ?? "http://localhost:8000";
