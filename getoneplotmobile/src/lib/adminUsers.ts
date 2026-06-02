import Constants from "expo-constants";
import { Platform } from "react-native";

const ADMIN_API_PORT = 8787;

/** Mobile-only admin API (server/index.mjs), not the Next.js web app. */
export function getMobileAdminApiOrigin(): string {
  const configured = process.env.EXPO_PUBLIC_MOBILE_API_URL;
  if (configured) return configured.replace(/\/$/, "");

  // Reuse the same LAN host as Metro (EXPO_PUBLIC_API_URL), different port
  const metroApi = process.env.EXPO_PUBLIC_API_URL;
  if (metroApi) {
    try {
      const { protocol, hostname } = new URL(metroApi);
      return `${protocol}//${hostname}:${ADMIN_API_PORT}`;
    } catch {
      /* fall through */
    }
  }

  // Simulator / emulator → host machine (not the phone itself)
  if (!Constants.isDevice) {
    if (Platform.OS === "android") {
      return `http://10.0.2.2:${ADMIN_API_PORT}`;
    }
    return `http://127.0.0.1:${ADMIN_API_PORT}`;
  }

  const hostUri =
    Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:${ADMIN_API_PORT}`;
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${ADMIN_API_PORT}`;
  }

  return `http://127.0.0.1:${ADMIN_API_PORT}`;
}

export type AdminUsersResponse = {
  data: Array<{
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    imageUrl: string;
    emailAddresses: Array<{ emailAddress: string }>;
    publicMetadata: Record<string, unknown>;
  }>;
};

async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const origin = getMobileAdminApiOrigin();
  const url = `${origin}${path}`;

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log("[AdminUsers] GET/POST", url);
  }

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new Error(
      `Cannot reach admin API at ${origin}. In getoneplotmobile run: npm run dev:api`,
    );
  }
  const contentType = res.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const preview = (await res.text()).slice(0, 100);
    throw new Error(
      `Admin API is not running at ${origin}. Start it with: npm run dev:api (${preview})`,
    );
  }

  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function fetchAdminUsers(token: string | null) {
  return adminFetch<AdminUsersResponse>("/api/users", {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function updateAdminUser(
  token: string | null,
  body: { userId: string; newRole?: string; area?: string; banned?: boolean },
) {
  return adminFetch("/api/admin/update-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}
