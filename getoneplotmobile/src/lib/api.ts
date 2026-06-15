import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Resolve base URL for API calls in many dev environments (simulators, emulators, physical devices)
function resolveBaseUrl() {
  // Explicit env var (preferred for mobile + production)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  // Expo config extra
  const expoApi = Constants.expoConfig?.extra?.apiUrl || Constants.manifest?.extra?.apiUrl;
  if (expoApi) return expoApi.replace(/\/$/, "");

  // In Expo dev, derive LAN host and point to backend API (default Next.js port 3000)
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:3000`;
  }

  // Android emulator maps host loopback to 10.0.2.2
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }

  // iOS simulator / local fallback
  return "http://localhost:3000";
}

const baseURL = resolveBaseUrl();

/** Expo Router API routes (+api.ts) — independent of the Next.js web app */
export function resolveMobileServerOrigin() {
  const hostUri =
    Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:8081`;
  }

  const appUrl = process.env.EXPO_PUBLIC_APP_URL || process.env.EXPO_PUBLIC_API_URL;
  if (appUrl) return appUrl.replace(/\/$/, "");

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8081";
  }

  return "http://localhost:8081";
}

export async function fetchMobileApi<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const origin = resolveMobileServerOrigin();
  const url = `${origin}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, init);
  const contentType = res.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const preview = (await res.text()).slice(0, 120);
    throw new Error(
      `Mobile API returned HTML instead of JSON. Enable web.output=server in app.json and restart Expo. (${preview})`,
    );
  }

  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `Request failed (${res.status})`);
  }

  return data;
}

// Helpful for debugging network issues in development
if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log("[Mobile API] using baseURL =", baseURL);
  // eslint-disable-next-line no-console
  console.log("[Mobile API] mobile server origin =", resolveMobileServerOrigin());
}

export const api = axios.create({
  baseURL,
  timeout: 30000,
});

export async function checkApprovalStatus(getToken: () => Promise<string | null>): Promise<{
  isApproved: boolean;
  role?: string;
  area?: string;
  lastChecked?: string;
}> {
  const token = await getToken();
  return fetchMobileApi("/api/approval-status", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function sendContactEmail(payload: {
  fullname: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  return fetchMobileApi("/api/receive-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, from: payload.email }),
  });
}

export async function notifyPropertyInterest(payload: {
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  return fetchMobileApi("/api/properties/notify-interest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
