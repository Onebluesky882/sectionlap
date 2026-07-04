"use client";

import { useState } from "react";
import jsQR from "jsqr";
import { authFetch } from "@/lib/authFetch";
import type { Booking } from "@/store/useBookingStore";

type Phase = "idle" | "decoding" | "verifying" | "done" | "error";

async function decodeQrFromFile(file: File): Promise<string> {
  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("อ่านรูปภาพไม่สำเร็จ");
  ctx.drawImage(imageBitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const result = jsQR(imageData.data, imageData.width, imageData.height);
  if (!result) throw new Error("อ่าน QR จากสลิปไม่พบ ลองถ่ายรูปใหม่ให้เห็น QR ชัดเจน");
  return result.data;
}

export function useSlipVerification(bookingId: string) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  async function verify(file: File) {
    setPhase("decoding");
    setError(null);
    try {
      const qrCode = await decodeQrFromFile(file);

      setPhase("verifying");
      const res = await authFetch(`/api/bookings/${bookingId}/verify-slip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "ตรวจสอบสลิปไม่สำเร็จ");
      }
      const { data } = (await res.json()) as { data: Booking };
      setBooking(data);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
      setPhase("error");
    }
  }

  function reset() {
    setPhase("idle");
    setError(null);
    setBooking(null);
  }

  return { phase, error, booking, verify, reset };
}
