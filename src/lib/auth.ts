const TOKEN_KEY = "quizup_token";
const USER_KEY = "quizup_user_id";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
};

type AuthSuccess = {
  token: string;
  user: AuthUser;
};

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function setUserId(id: string) {
  localStorage.setItem(USER_KEY, id);
}

export function getUserId() {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(USER_KEY);
  if (stored) return stored;
  const token = getToken();
  if (!token) return null;
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const payload: unknown = JSON.parse(atob(segment.replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload || typeof payload !== "object" || !("sub" in payload) || typeof payload.sub !== "string") return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export function apiUrl(path: string) {
  const configured = import.meta.env.VITE_API_URL;
  const base = (configured ?? "http://localhost:4000").replace(/\/$/, "");
  return `${base}${path}`;
}

export async function signupRequest(body: { username: string; email: string; password: string }) {
  return authRequest("/api/auth/signup", body);
}

export async function loginRequest(body: { username: string; password: string }) {
  return authRequest("/api/auth/login", body);
}

async function authRequest(path: string, body: { username: string; email?: string; password: string }) {
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach the server. Is the API running?");
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = messageFrom(data);
    throw new Error(message ?? "Something went wrong.");
  }
  if (!isAuthSuccess(data)) {
    throw new Error("Something went wrong.");
  }
  return data;
}

export async function apiFetch(path: string, options: { method?: string; body?: unknown; auth?: boolean } = {}) {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const init: RequestInit = { method: options.method ?? "GET", headers };
  if (options.body !== undefined) init.body = JSON.stringify(options.body);
  let response: Response;
  try {
    response = await fetch(apiUrl(path), init);
  } catch {
    throw new Error("Could not reach the server. Is the API running?");
  }
  if (response.status === 204) return null;
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(messageFrom(data) ?? "Something went wrong.");
  return data;
}

function messageFrom(data: unknown) {
  if (!data || typeof data !== "object" || !("message" in data)) return undefined;
  return typeof data.message === "string" ? data.message : undefined;
}

function isAuthSuccess(data: unknown): data is AuthSuccess {
  if (!data || typeof data !== "object") return false;
  if (!("token" in data) || typeof data.token !== "string") return false;
  if (!("user" in data) || !data.user || typeof data.user !== "object") return false;
  const user = data.user;
  return "id" in user && typeof user.id === "string" && "username" in user && typeof user.username === "string" && "email" in user && typeof user.email === "string";
}
