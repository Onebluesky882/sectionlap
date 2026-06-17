import { API_BASE_URL } from "../config";
import type { BookingRecord, CreateBookingResult, Section, User, UserRole } from "../types";

const TOKEN_KEY = "sectionlap_token";
const USER_NAME_KEY = "sectionlap_username";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
export function setUserName(name: string): void {
  localStorage.setItem(USER_NAME_KEY, name);
}
export function clearUserName(): void {
  localStorage.removeItem(USER_NAME_KEY);
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const userName = localStorage.getItem(USER_NAME_KEY);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (userName) headers["X-User-Name"] = userName;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const body: ApiResponse<T> = await res.json();
  return body;
}

// Auth

export interface SessionData {
  token: string;
  user: User & { email: string };
}

export async function apiSignup(
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<SessionData> {
  const res = await request<SessionData>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });
  if (!res.data) throw new Error(res.error ?? "Signup failed");
  return res.data;
}

export async function apiSignin(
  email: string,
  password: string
): Promise<SessionData> {
  const res = await request<SessionData>("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res.data) throw new Error(res.error ?? "Signin failed");
  return res.data;
}

export async function apiSignout(): Promise<void> {
  await request("/api/auth/signout", { method: "POST" });
}

export async function apiMe(): Promise<SessionData["user"] | null> {
  const res = await request<SessionData["user"]>("/api/auth/me");
  return res.data;
}

// Sections

export async function apiListSections(category?: string): Promise<Section[]> {
  const params = category ? `?category=${encodeURIComponent(category)}` : "";
  const res = await request<Section[]>(`/api/sections${params}`);
  return res.data ?? [];
}

export async function apiCreateSection(
  section: Omit<Section, "id" | "teacherId" | "teacher">
): Promise<Section> {
  const res = await request<Section>("/api/sections", {
    method: "POST",
    body: JSON.stringify(section),
  });
  if (!res.data) throw new Error(res.error ?? "Failed to create section");
  return res.data;
}

export async function apiUpdateSection(section: Section): Promise<Section> {
  const res = await request<Section>(`/api/sections/${section.id}`, {
    method: "PUT",
    body: JSON.stringify(section),
  });
  if (!res.data) throw new Error(res.error ?? "Failed to update section");
  return res.data;
}

export async function apiGetJitsiToken(
  sectionId: string
): Promise<{ token: string; roomId: string }> {
  const res = await request<{ token: string; roomId: string }>(
    `/api/sections/${sectionId}/jitsi-token`
  );
  if (!res.data) throw new Error(res.error ?? "Failed to get Jitsi token");
  return res.data;
}

// Bookings

export async function apiCreateBooking(
  sectionId: string
): Promise<CreateBookingResult> {
  const res = await request<BookingRecord>("/api/bookings", {
    method: "POST",
    body: JSON.stringify({ sectionId }),
  });
  if (res.error === "ALREADY_BOOKED") return { booking: null, error: "ALREADY_BOOKED" };
  if (res.error === "CAPACITY_FULL") return { booking: null, error: "CAPACITY_FULL" };
  if (!res.data) throw new Error(res.error ?? "Failed to create booking");
  return { booking: res.data, error: null };
}

export async function apiListBookings(): Promise<BookingRecord[]> {
  const res = await request<BookingRecord[]>("/api/bookings");
  return res.data ?? [];
}

export async function apiPayBooking(bookingId: string): Promise<BookingRecord> {
  const res = await request<BookingRecord>(`/api/bookings/${bookingId}/pay`, { method: "POST" });
  if (!res.data) throw new Error(res.error ?? "Failed to pay booking");
  return res.data;
}

export async function apiFailBooking(bookingId: string): Promise<BookingRecord> {
  const res = await request<BookingRecord>(`/api/bookings/${bookingId}/fail`, { method: "POST" });
  if (!res.data) throw new Error(res.error ?? "Failed to fail booking");
  return res.data;
}

export async function apiRetryBooking(bookingId: string): Promise<BookingRecord> {
  const res = await request<BookingRecord>(`/api/bookings/${bookingId}/retry`, { method: "POST" });
  if (!res.data) throw new Error(res.error ?? "Failed to retry booking");
  return res.data;
}

export async function apiCancelBooking(bookingId: string): Promise<BookingRecord> {
  const res = await request<BookingRecord>(`/api/bookings/${bookingId}/cancel`, { method: "POST" });
  if (!res.data) throw new Error(res.error ?? "Failed to cancel booking");
  return res.data;
}
