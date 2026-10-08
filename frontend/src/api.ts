import type { AuthTokens, URLItem, URLStats } from "./types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";


function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function login(
  username: string,
  password: string
): Promise<AuthTokens> {
  const res = await fetch(`${BASE}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Invalid credentials");
  return res.json();
}

export async function register(
  username: string,
  password: string,
  confirmPassword: string
): Promise<void> {
  const res = await fetch(`${BASE}/api/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, confirm_password: confirmPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Registration failed");
}


export async function shortenURL(
  token: string,
  url: string
): Promise<{ id: number; short_code: string; short_url: string; click_count: number; created_at: string }> {
  const res = await fetch(`${BASE}/api/shorten/`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.url?.[0] ?? "Failed to shorten URL");
  }
  return res.json();
}

export async function fetchURLs(token: string): Promise<URLItem[]> {
  const res = await fetch(`${BASE}/api/urls/`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch URLs");
  return res.json();
}

export async function deleteURL(token: string, id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/urls/${id}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete URL");
}

export async function fetchStats(
  token: string,
  id: number
): Promise<URLStats> {
  const res = await fetch(`${BASE}/api/urls/${id}/stats/`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}
