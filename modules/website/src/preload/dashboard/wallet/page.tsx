"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import { useOwnWallet } from "@/hooks/useWallet";
import { useWalletMutations } from "@/hooks/useWalletMutations";

export default function WalletPreload() {
  const { wallet, isLoading: fetching, refetch } = useOwnWallet();
  const { saveWallet, isLoading: saving, error } = useWalletMutations();

  const [qrCodeR2Key, setQrCodeR2Key] = useState("");
  const [bankAccountNameTh, setBankAccountNameTh] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!wallet) return;
    setQrCodeR2Key(wallet.qrCodeR2Key);
    setBankAccountNameTh(wallet.bankAccountNameTh);
    setBankAccountNumber(wallet.bankAccountNumber);
  }, [wallet]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    const result = await saveWallet(qrCodeR2Key, bankAccountNameTh.trim(), bankAccountNumber.trim());
    if (result) {
      setSaved(true);
      refetch();
    }
  }

  const valid = qrCodeR2Key !== "" && bankAccountNameTh.trim() !== "" && bankAccountNumber.trim() !== "";

  return (
    <main className="min-h-screen max-w-xl mx-auto px-4 py-12 space-y-8">
      <div>
        <nav className="text-xs text-[#64748B] mb-1">
          <Link href="/dashboard" className="hover:text-black">Dashboard</Link>
          <span className="mx-1">/</span>
          <span className="text-black">กระเป๋าเงิน</span>
        </nav>
        <h1 className="text-2xl font-bold">กระเป๋าเงิน (Wallet)</h1>
        <p className="text-sm text-[#64748B] mt-1">
          แนบ QR code และเลขบัญชีของคุณ นักเรียนจะโอนเงินตรงเข้าบัญชีคุณ แพลตฟอร์มไม่หักค่าธรรมเนียม
        </p>
      </div>

      {fetching ? (
        <p className="text-sm text-[#64748B]">กำลังโหลด...</p>
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">QR code รับเงิน</label>
            {qrCodeR2Key && wallet?.qrCodeUrl ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={wallet.qrCodeUrl}
                  alt="QR code"
                  className="w-48 h-48 object-contain rounded-xl border border-[#DDE8E6]"
                />
                <button
                  type="button"
                  onClick={() => setQrCodeR2Key("")}
                  className="text-xs text-[#64748B] hover:text-black underline underline-offset-2"
                >
                  เปลี่ยน QR code
                </button>
              </div>
            ) : (
              <ImageUpload label="อัปโหลด QR code" onUploaded={(key) => setQrCodeR2Key(key)} />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">ชื่อบัญชี (ภาษาไทย, ไม่ต้องใส่คำนำหน้า)</label>
            <input
              value={bankAccountNameTh}
              onChange={(e) => setBankAccountNameTh(e.target.value)}
              placeholder="เช่น สมชาย ใจดี"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6AA098]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">เลขบัญชี / เบอร์พร้อมเพย์ (ไม่ต้องเว้นวรรค)</label>
            <input
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value.replace(/\s/g, ""))}
              placeholder="เช่น 0982689882"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6AA098]"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {saved && !error && <p className="text-sm text-[#6AA098]">✓ บันทึกแล้ว</p>}

          <button
            type="submit"
            disabled={!valid || saving}
            className="rounded-full bg-black text-white px-6 py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-gray-800 transition-colors"
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </form>
      )}
    </main>
  );
}
