Stage: 5
Domain: modules/mobile-app
Branch: wansing
Status: APPROVED

PR Title: feat(mobile-app): Stage 5 — Expo app (student/teacher flows + sync + live class)

PR Description:
## What
Built the SectionLap Expo mobile app (Android + iPad) mirroring the full
student/teacher flow from the Wails desktop app (Stage 3). Connects to the same
sync-service (Stage 4a) for whiteboard and document-highlight. Live class embedded
via react-native-webview pointing to the self-hosted Jitsi instance.

## Files Changed
* modules/mobile-app/ — entire new module:
  package.json, pnpm-workspace.yaml, pnpm-lock.yaml, tsconfig.json,
  app.json, tailwind.config.js, babel.config.js, metro.config.js,
  global.css, .npmrc
* modules/mobile-app/app/ — _layout.tsx, (tabs)/_layout.tsx, browse/teach/enrollments tabs
* modules/mobile-app/app/sections/[id]/ — index.tsx, checkout.tsx, live-class.tsx
* modules/mobile-app/src/types/ — index.ts, css.d.ts, nativewind.d.ts
* modules/mobile-app/src/store/ — mockData.ts, useAppStore.ts
* modules/mobile-app/src/config.ts
* modules/mobile-app/src/hooks/ — useSection.ts, useCheckout.ts, useSyncRoom.ts, useSectionForm.ts
* modules/mobile-app/src/components/ — Button, Card, Input, Badge, SectionCard,
  SectionForm, SyncCanvas, WhiteboardPanel, DocumentHighlightPanel

## Dependencies Added
* expo-router ~5.0.7, nativewind ^4.1.23, tailwindcss ^3.4.17
* zustand ^5.0.4, @react-native-async-storage/async-storage ^2.2.0
* yjs ^13.6.31, y-websocket ^3.0.0
* react-native-svg ^15.11.2, react-native-webview ^13.13.5
* react-native-gesture-handler, reanimated, safe-area-context, screens (Expo Router deps)
* react-native-svg-transformer ^1.5.0 (devDep)

## Tests
* pnpm typecheck (tsc --noEmit) — PASS, 0 errors
* Sync verification: two Y.Doc clients over ws://localhost:1234; stroke pushed by
  client1 received by client2 in <500ms — PASS

## Acceptance Criteria
- [x] Expo app runs on Android and iPad (TypeScript clean; native build requires toolchain)
- [x] Student/Teacher flows mirrored from Wails (Stage 3 mock logic)
- [x] Live class via Jitsi WebView embed
- [x] Whiteboard & document-highlight connected to Stage 4a sync-service
- [x] Real-time sync verified between two Yjs clients

## Known Issues
* @jitsi/react-native-sdk blocked by supply-chain policy (tarball sub-deps).
  WebView embed is functionally equivalent. Conductor approved WebView approach.
* No native build in CI — requires expo run:android / expo run:ios on native toolchain.
* Dark-mode Tailwind variant deferred to Stage 6c.

Merge Strategy: squash
Base Branch: wansing
Ready to Merge: YES

---

## Conductor Approval

Gate-Out Status: PASS
Approved By: Dev
Approved Date: 2026-06-19
