Stage: 7
Domain: modules/website
Status: PASS
Ready For Next Stage: YES

---

## Summary

Built and deployed the SectionLap public website using Next.js 16 (App Router)
on Cloudflare Workers via OpenNext. All pages follow the Server Component /
`"use client"` preload pattern. Booking flow is wired to the real backend.
Website is live at https://section-lap-web.onebluesky882.workers.dev.

---

## Deliverables

### New module
- `modules/website/` — full Next.js 16 App Router project

### App routes
- `src/app/page.tsx` — Home page (landing with CTA)
- `src/app/booking/page.tsx` — Booking page (date + time slot, POST /api/bookings)
- `src/app/sections/page.tsx` — Section listing
- `src/app/login/page.tsx` — Auth (login / signup)
- `src/app/dashboard/page.tsx` — Teacher dashboard
- `src/app/profile/page.tsx` — User profile
- `src/app/roadmap/page.tsx` — Public roadmap
- `src/app/feedback/page.tsx` — Feedback
- `src/app/upload/page.tsx` — Content upload
- `src/app/api/` — API route handlers

### Preload layer (client components)
- `src/preload/homepage/page.tsx`
- `src/preload/booking/page.tsx`
- `src/preload/sections/page.tsx`
- `src/preload/login/page.tsx`
- `src/preload/dashboard/page.tsx`
- `src/preload/profile/page.tsx`
- `src/preload/roadmap/page.tsx`
- `src/preload/feedback/page.tsx`
- `src/preload/upload/page.tsx`

### Hooks
- `src/hooks/useAuth.ts`
- `src/hooks/useBooking.ts`
- `src/hooks/useSection.ts`
- `src/hooks/useSectionMutations.ts`
- `src/hooks/useSections.ts`
- `src/hooks/useUpload.ts`
- `src/hooks/useVideoChunkUpload.ts`
- `src/hooks/useVideoFileUpload.ts`

### Zustand stores
- `src/store/useAuthStore.ts`
- `src/store/useBookingStore.ts`
- `src/store/useSectionStore.ts`

### Components
- `src/components/Navbar.tsx`
- `src/components/DataTable.tsx`
- `src/components/ImageUpload.tsx`
- `src/components/SectionForm.tsx`
- `src/components/SessionProvider.tsx`
- `src/components/UploadProgressBar.tsx`
- `src/components/VideoChunkRecorder.tsx`
- `src/components/VideoFileUploader.tsx`

### Deploy config
- `wrangler.jsonc` — Cloudflare Workers config
- `open-next.config.ts` — OpenNext adapter config

---

## Acceptance Criteria Status

- [x] Home page (`/`) — landing with CTA to booking
- [x] Booking page (`/booking`) — date + time slot selection wired to POST /api/bookings
- [x] Zustand store for booking state (`useBookingStore.ts`)
- [x] All pages pass TypeScript strict mode
- [x] Deployed to Cloudflare Workers via OpenNext

---

## Deployment

- URL: https://section-lap-web.onebluesky882.workers.dev
- Version ID: 6c000218-8ae0-40e9-9d48-3961bd5ff986
- Deploy time: 2026-06-18
- Deploy method: `pnpm run deploy` via Wrangler + OpenNext

---

## Notes

- Duplicate key warning (`euro` in HTML entity map) in bundled handler — third-party
  library issue, does not affect runtime behavior.
- All pages follow the Server Component → preload (`"use client"`) architecture pattern
  as specified in PIPELINE.md Stage 7.
