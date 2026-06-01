import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Resolve base URL for API calls in many dev environments (simulators, emulators, physical devices)
function resolveBaseUrl() {
  // Explicit env var (preferred for device/staging)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  // expo config extra
  const expoApi = Constants.expoConfig?.extra?.apiUrl || Constants.manifest?.extra?.apiUrl;
  if (expoApi) return expoApi;

  // If running in Expo client / simulator, try debuggerHost to derive host IP
  const debuggerHost =
    Constants.manifest?.debuggerHost || Constants.expoConfig?.extra?.debuggerHost;
  if (debuggerHost) {
    const host = debuggerHost.split(":")[0];
    // Use Next.js dev server (3000) for API routes by default in this project
    return `http://${host}:3000`;
  }

  // Emulator fallbacks: prefer Next.js dev server on 3000
  if (Platform.OS === "android") {
    // Android emulator (using 3000 for Next.js API)
    return "http://10.0.2.2:3000";
  }

  // iOS simulator / default - point to Next.js dev server
  return "http://localhost:3000";
}

const baseURL = resolveBaseUrl();

// Helpful for debugging network issues in development
if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log("[Mobile API] using baseURL =", baseURL);
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
  const { data } = await api.get("/api/approval-status", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
}

export async function sendContactEmail(payload: {
  fullname: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  const { data } = await api.post("/api/receive-email", {
    ...payload,
    from: payload.email,
  });
  return data;
}

export async function notifyPropertyInterest(payload: {
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const { data } = await api.post("/api/properties/notify-interest", payload);
  return data;
}
