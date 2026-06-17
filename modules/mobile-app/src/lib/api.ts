import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";

const TOKEN_KEY = "sectionlap_token";
const USER_NAME_KEY = "sectionlap_username";

// In-memory cache — loaded once at app init via loadTokenCache()
let _token: string | null = null;
let _userName: string | null = null;

export async function loadTokenCache(): Promise<void> {
  _token = await AsyncStorage.getItem(TOKEN_KEY);
  _userName = await AsyncStorage.getItem(USER_NAME_KEY);
}

export function getCachedToken(): string | null {
  return _token;
}

export async function setToken(token: string): Promise<void> {
  _token = token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  _token = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function setUserName(name: string): Promise<void> {
  _userName = name;
  await AsyncStorage.setItem(USER_NAME_KEY, name);
}

export async function clearUserName(): Promise<void> {
  _userName = null;
  await AsyncStorage.removeItem(USER_NAME_KEY);
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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (_token) headers["Authorization"] = `Bearer ${_token}`;
  if (_userName) headers["X-User-Name"] = _userName;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const body: ApiResponse<T> = await res.json();
  return body;
}
