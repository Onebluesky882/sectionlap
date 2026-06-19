"use client";

const DESKTOP = [
  {
    os: "Windows",
    version: "v1.0.0",
    file: "SectionLap-1.0.0-setup.exe",
    size: "68 MB",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" aria-hidden>
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.8" />
      </svg>
    ),
    badge: null,
  },
  {
    os: "macOS",
    version: "v1.0.0",
    file: "SectionLap-1.0.0.dmg",
    size: "72 MB",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" aria-hidden>
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
    ),
    badge: null,
  },
];

const MOBILE = [
  {
    os: "iOS",
    subtitle: "iPhone & iPad",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" aria-hidden>
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
    ),
    storeName: "App Store",
    storeColor: "bg-black text-white",
    comingSoon: true,
  },
  {
    os: "Android",
    subtitle: "Phone & Tablet",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" aria-hidden>
        <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4483.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4483.9993.9993 0 .5511-.4483.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1367 1.0989L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3435-4.1021-2.6892-7.5743-6.1185-9.4396" />
      </svg>
    ),
    storeName: "Google Play",
    storeColor: "bg-[#01875F] text-white",
    comingSoon: true,
  },
];

const REQUIREMENTS = [
  { label: "Windows", value: "Windows 10 / 11 (64-bit)" },
  { label: "macOS", value: "macOS 12 Monterey or later" },
  { label: "iOS", value: "iOS 16 or later" },
  { label: "Android", value: "Android 8.0 (Oreo) or later" },
];

export default function DownloadPreload() {
  return (
    <main className="bg-white min-h-screen">

      {/* ── HEADER ── */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-10 space-y-4">
        <div className="inline-flex items-center gap-2 border border-[#DDE8E6] rounded-full px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-[#6AA098]" />
          <span className="text-xs font-semibold text-[#64748B] tracking-widest uppercase">Download SectionLap</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1A2332] leading-tight">
          Learn anywhere.<br />
          <span className="text-[#6AA098]">On any device.</span>
        </h1>
        <p className="text-[#64748B] text-lg max-w-xl">
          Get the full SectionLap experience — desktop app for teachers and students,
          mobile app to join classes on the go.
        </p>
      </section>

      {/* ── DESKTOP ── */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xl">🖥️</span>
          <h2 className="text-xl font-bold text-[#1A2332]">Desktop App</h2>
          <span className="text-xs font-semibold text-[#64748B] border border-[#DDE8E6] rounded-full px-2 py-0.5">Wails</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DESKTOP.map(({ os, version, file, size, href, icon }) => (
            <div key={os} className="rounded-2xl border border-[#DDE8E6] p-6 flex flex-col gap-5 hover:border-[#6AA098]/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#F7FAFA] border border-[#DDE8E6] flex items-center justify-center text-[#1A2332]">
                  {icon}
                </div>
                <div>
                  <p className="font-bold text-[#1A2332]">{os}</p>
                  <p className="text-xs text-[#64748B]">{version} · {size}</p>
                </div>
              </div>

              <div className="rounded-lg bg-[#F7FAFA] border border-[#DDE8E6] px-3 py-2">
                <p className="text-xs font-mono text-[#64748B] truncate">{file}</p>
              </div>

              <a
                href={href}
                className="w-full rounded-full bg-[#1A2332] text-white text-sm font-semibold py-3 text-center hover:bg-[#6AA098] transition-colors flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current" aria-hidden>
                  <path d="M10 3a1 1 0 011 1v7.586l2.293-2.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 11.586V4a1 1 0 011-1zM3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                </svg>
                Download for {os}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="border-t border-[#DDE8E6]" />
      </div>

      {/* ── MOBILE ── */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xl">📱</span>
          <h2 className="text-xl font-bold text-[#1A2332]">Mobile App</h2>
          <span className="text-xs font-semibold text-[#64748B] border border-[#DDE8E6] rounded-full px-2 py-0.5">Expo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MOBILE.map(({ os, subtitle, href, icon, storeName, storeColor, comingSoon }) => (
            <div key={os} className="rounded-2xl border border-[#DDE8E6] p-6 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#F7FAFA] border border-[#DDE8E6] flex items-center justify-center text-[#1A2332]">
                  {icon}
                </div>
                <div>
                  <p className="font-bold text-[#1A2332]">{os}</p>
                  <p className="text-xs text-[#64748B]">{subtitle}</p>
                </div>
              </div>

              {comingSoon ? (
                <div className="flex flex-col gap-3">
                  <div className="rounded-lg bg-[#FFF9E6] border border-[#F0E0A0] px-3 py-2 flex items-center gap-2">
                    <span className="text-xs">⏳</span>
                    <p className="text-xs font-semibold text-[#A07C20]">Coming Soon — store submission pending</p>
                  </div>
                  <a
                    href={href}
                    className={`w-full rounded-full text-sm font-semibold py-3 text-center transition-opacity opacity-50 pointer-events-none flex items-center justify-center gap-2 ${storeColor}`}
                    aria-disabled
                    tabIndex={-1}
                  >
                    {storeName}
                  </a>
                </div>
              ) : (
                <a
                  href={href}
                  className={`w-full rounded-full text-sm font-semibold py-3 text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-2 ${storeColor}`}
                >
                  {storeName}
                </a>
              )}
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-[#64748B]">
          For development access, use{" "}
          <a
            href="https://expo.dev/go"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6AA098] hover:underline underline-offset-2"
          >
            Expo Go
          </a>{" "}
          and scan the QR code from your development server.
        </p>
      </section>

      {/* ── SYSTEM REQUIREMENTS ── */}
      <section className="bg-[#F7FAFA] border-y border-[#DDE8E6] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-base font-bold text-[#1A2332] mb-6">System Requirements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REQUIREMENTS.map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <p className="text-xs font-bold text-[#1A2332] uppercase tracking-widest">{label}</p>
                <p className="text-sm text-[#64748B]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RELEASE NOTES ── */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-base font-bold text-[#1A2332] mb-4">What&apos;s in v1.0.0</h2>
        <ul className="space-y-2 text-sm text-[#64748B]">
          {[
            "Live video class via Jitsi — join, mic, and camera from the app",
            "Real-time whiteboard and document highlight synced across all participants",
            "Booking, payment, and enrollment flow fully integrated with the backend",
            "Teacher dashboard — create and manage sections, verify your profile",
            "Student dashboard — browse sections, track enrollments",
          ].map((note) => (
            <li key={note} className="flex items-start gap-2">
              <span className="text-[#6AA098] mt-0.5 shrink-0">✓</span>
              {note}
            </li>
          ))}
        </ul>
      </section>

    </main>
  );
}
