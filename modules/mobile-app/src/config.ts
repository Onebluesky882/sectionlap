// Local self-hosted Jitsi Meet instance (modules/live-class, Stage 2a).
// Android emulator: 10.0.2.2 reaches the host machine's localhost.
// Override via EXPO_PUBLIC_JITSI_BASE_URL in .env.local.
export const JITSI_BASE_URL =
  process.env.EXPO_PUBLIC_JITSI_BASE_URL ?? "http://localhost:8000";

// Local sync-service instance (modules/sync-service, Stage 4a).
// Override via EXPO_PUBLIC_SYNC_BASE_URL in .env.local.
export const SYNC_BASE_URL =
  process.env.EXPO_PUBLIC_SYNC_BASE_URL ?? "ws://localhost:1234";
