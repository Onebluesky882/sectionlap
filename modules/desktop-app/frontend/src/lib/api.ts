import { API_BASE_URL } from "../config";

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

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: string;
}

export async function request<T>(
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
