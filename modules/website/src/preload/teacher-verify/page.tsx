"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTeacherVerify } from "@/hooks/useTeacherVerify";
import ImageUpload from "@/components/ImageUpload";

export default function TeacherVerifyPreload() {
  const [fullName, setFullName] = useState("");
  const [idCard, setIdCard] = useState("");
  const [phone, setPhone] = useState("");
  const [expertise, setExpertise] = useState("");
  const [documentKey, setDocumentKey] = useState<string | null>(null);
  const { submitProfile, fetchProfile, profile, isLoading, isFetching, error } = useTeacherVerify();
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Pre-fill fields on a resubmission after rejection so the teacher doesn't
  // have to retype everything, just replace the document.
  useEffect(() => {
    if (profile && profile.verificationStatus === "rejected") {
      setFullName(profile.fullName);
      setIdCard(profile.idCard);
      setPhone(profile.phone);
      setExpertise(profile.expertise);
    }
  }, [profile]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!documentKey) return;
    submitProfile({ fullName, idCard, phone, expertise, documentKey });
  }

  const field = (
    label: string,
    type: string,
    placeholder: string,
    value: string,
    onChange: (v: string) => void
  ) => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[#64748B] uppercase tracking-widest">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full border border-[#DDE8E6] rounded-xl px-4 py-3 text-sm bg-[#F7FAFA] focus:outline-none focus:ring-2 focus:ring-[#6AA098]/30 focus:border-[#6AA098] transition-all placeholder:text-[#64748B]/50"
      />
    </div>
  );

  const form = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {field("ชื่อ-นามสกุล", "text", "ชื่อตามบัตรประชาชน/พาสปอร์ต", fullName, setFullName)}
      {field("เลขบัตรประชาชน / พาสปอร์ต", "text", "X-XXXX-XXXXX-XX-X", idCard, setIdCard)}
      {field("เบอร์โทรศัพท์", "tel", "08X-XXX-XXXX", phone, setPhone)}
      {field("ความเชี่ยวชาญ", "text", "เช่น HTML, CSS, JavaScript, React", expertise, setExpertise)}

      <ImageUpload
        label="อัปโหลดรูปถ่ายพาสปอร์ตหรือบัตรประชาชน"
        helpText="JPG, PNG, WEBP · สูงสุด 10 MB"
        accept="image/jpeg,image/png,image/webp"
        uploadType="identity-document"
        onUploaded={(key) => setDocumentKey(key)}
      />

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !documentKey}
        className="w-full rounded-full bg-[#6AA098] text-white py-3.5 text-sm font-semibold disabled:opacity-40 hover:bg-[#4D8078] transition-colors mt-2"
      >
        {isLoading ? "กำลังยืนยัน..." : "ยืนยันตัวตน"}
      </button>
    </form>
  );

  let body: React.ReactNode;

  if (isFetching) {
    body = <p className="text-sm text-[#64748B] text-center">กำลังโหลด...</p>;
  } else if (profile?.verificationStatus === "approved") {
    body = (
      <div className="space-y-6 text-center">
        <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-6 text-sm text-green-700">
          ยืนยันตัวตนสำเร็จแล้ว คุณสามารถเปิดคลาสสอนได้ทันที
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full rounded-full bg-[#6AA098] text-white py-3.5 text-sm font-semibold hover:bg-[#4D8078] transition-colors"
        >
          ไปที่แดชบอร์ด
        </button>
      </div>
    );
  } else if (profile?.verificationStatus === "pending") {
    body = (
      <div className="space-y-4 text-center">
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-6 text-sm text-amber-700">
          เอกสารของคุณอยู่ระหว่างการตรวจสอบ ระบบหรือแอดมินจะตรวจสอบและเปิดใช้งานบัญชีให้เร็วที่สุด
        </div>
        {profile.documentUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.documentUrl} alt="เอกสารที่ส่ง" className="w-full rounded-xl border border-[#DDE8E6]" />
        )}
      </div>
    );
  } else if (profile?.verificationStatus === "rejected") {
    body = (
      <div className="space-y-6">
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-4 text-sm text-red-600 space-y-1">
          <p className="font-semibold">เอกสารของคุณไม่ผ่านการตรวจสอบ</p>
          {profile.rejectionReason && <p>{profile.rejectionReason}</p>}
          <p className="text-red-500/80">กรุณาอัปโหลดเอกสารใหม่เพื่อยื่นคำขออีกครั้ง</p>
        </div>
        {form}
      </div>
    );
  } else {
    body = form;
  }

  return (
    <main className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-md space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-[#6AA098] uppercase tracking-widest">ยืนยันตัวตน</span>
          <h1 className="text-2xl font-bold text-[#1A2332]">ข้อมูลผู้สอน</h1>
          <p className="text-sm text-[#64748B] leading-relaxed">
            กรอกข้อมูลและอัปโหลดเอกสารเพื่อยืนยันตัวตนก่อนเริ่มสอน ระบบจะตรวจสอบอัตโนมัติ
            หากไม่สามารถยืนยันได้ทันที แอดมินจะตรวจสอบและอนุมัติให้ภายหลัง
          </p>
        </div>

        {body}

        <p className="text-xs text-[#64748B]/60 text-center leading-relaxed">
          ข้อมูลของคุณจะถูกเก็บเป็นความลับและใช้เพื่อยืนยันตัวตนเท่านั้น
        </p>
      </div>
    </main>
  );
}
