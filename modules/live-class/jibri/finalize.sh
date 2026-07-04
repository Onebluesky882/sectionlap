#!/bin/sh
# Jibri calls this script (via JIBRI_FINALIZE_RECORDING_SCRIPT_PATH) once a
# local file recording finishes, passing the recording's directory as $1.
#
# Jibri names that directory after the conference room, e.g.
#   /config/recordings/section-<sectionId>_2026-07-04-12-00-00/
# The Jitsi room name is set by the backend as "section-<sectionId>" (see
# modules/backend/services/jitsi_service.go), so we recover the section id
# straight out of the directory name — no other section<->recording mapping
# exists.
#
# Deliberately dependency-free (sh + curl only) — the Jibri image is minimal
# and can't be assumed to have jq or similar installed.
#
# Setup: copy this file to ${CONFIG}/jibri/finalize.sh (see .env's CONFIG var)
# and chmod +x it — docker-compose.yml bind-mounts that path into the
# container. Also set BACKEND_URL and INTERNAL_INGEST_SECRET in .env
# (INTERNAL_INGEST_SECRET must match the backend's own env var of the same
# name exactly).
set -e

RECORDING_DIR="$1"
ROOM_DIR_NAME=$(basename "$RECORDING_DIR")
SECTION_ID=$(echo "$ROOM_DIR_NAME" | sed -n 's/^section-\(.*\)_[0-9-]*$/\1/p')
MP4_FILE=$(find "$RECORDING_DIR" -name "*.mp4" | head -1)

if [ -z "$SECTION_ID" ] || [ -z "$MP4_FILE" ]; then
  echo "finalize.sh: not a section recording or no file found, skipping ($RECORDING_DIR)"
  exit 0
fi

RESP=$(curl -sf -X POST "$BACKEND_URL/api/internal/recordings/presign" \
  -H "Content-Type: application/json" \
  -H "X-Internal-Secret: $INTERNAL_INGEST_SECRET" \
  -d "{\"sectionId\":\"$SECTION_ID\",\"fileName\":\"$(basename "$MP4_FILE")\"}")

CLIP_ID=$(echo "$RESP" | sed -n 's/.*"clipId":"\([^"]*\)".*/\1/p')
UPLOAD_URL=$(echo "$RESP" | sed -n 's/.*"uploadUrl":"\([^"]*\)".*/\1/p')

if [ -z "$CLIP_ID" ] || [ -z "$UPLOAD_URL" ]; then
  echo "finalize.sh: presign failed, response was: $RESP"
  exit 1
fi

curl -sf -T "$MP4_FILE" "$UPLOAD_URL"

curl -sf -X POST "$BACKEND_URL/api/internal/recordings/$CLIP_ID/complete" \
  -H "X-Internal-Secret: $INTERNAL_INGEST_SECRET"

echo "finalize.sh: uploaded $MP4_FILE as clip $CLIP_ID for section $SECTION_ID"
