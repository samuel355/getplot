import { createClerkClient } from "@clerk/backend";

function getClerkConfig() {
  return {
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  };
}

let clerkClient;
function getClerkClient() {
  const { secretKey, publishableKey } = getClerkConfig();
  if (!secretKey) {
    console.warn("[mobile-api] CLERK_SECRET_KEY is missing — admin user routes will fail.");
  }
  if (!publishableKey) {
    console.warn(
      "[mobile-api] EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is missing — token verification may fail.",
    );
  }
  if (!clerkClient) {
    clerkClient = createClerkClient({ secretKey, publishableKey });
  }
  return clerkClient;
}

const ALLOWED_EMAIL = "samueloseiboatenglistowell57@gmail.com";
const ADMIN_ROLES = ["admin", "sysadmin"];

async function requireAdmin(request) {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Not authenticated", status: 401 };
  }

  const { secretKey, publishableKey } = getClerkConfig();
  const client = getClerkClient();

  let userId;
  try {
    const requestState = await client.authenticateRequest(request, {
      secretKey,
      publishableKey,
    });

    if (!requestState.isAuthenticated) {
      console.error(
        "[mobile-api] authenticateRequest failed:",
        requestState.reason,
        requestState.message,
      );
      return {
        error: requestState.message || "Invalid or expired session",
        status: 401,
      };
    }

    const auth = requestState.toAuth();
    userId = auth.userId;
    if (!userId) {
      return { error: "Invalid or expired session", status: 401 };
    }
  } catch (err) {
    console.error("[mobile-api] token verification error:", err?.message || err);
    return { error: "Invalid or expired session", status: 401 };
  }

  const user = await client.users.getUser(userId);
  const role = user.publicMetadata?.role;
  const email =
    user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;

  const allowed =
    (role && ADMIN_ROLES.includes(role)) || email === ALLOWED_EMAIL;

  if (!allowed) {
    return { error: "Forbidden", status: 403 };
  }

  return { user, userId };
}

export async function handleGetUsers(request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return json({ error: auth.error }, auth.status);
  }

  const users = await getClerkClient().users.getUserList();
  return json(users, 200);
}

export async function handleUpdateUser(request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return json({ error: auth.error }, auth.status);
  }

  const body = await request.json();
  const { userId, newRole, area, banned } = body;

  if (!userId || (newRole === undefined && banned === undefined)) {
    return json({ error: "User ID and either role or banned flag are required" }, 400);
  }

  if ((newRole === "chief" || newRole === "chief_asst") && !area) {
    return json({ error: "Area is required for chief roles" }, 400);
  }

  const finalArea = newRole === "chief" || newRole === "chief_asst" ? area : "";
  const targetUser = await getClerkClient().users.getUser(userId);
  const publicMetadata = { ...targetUser.publicMetadata };

  if (newRole !== undefined) publicMetadata.role = newRole;
  if (newRole !== undefined) publicMetadata.area = finalArea;
  if (banned !== undefined) publicMetadata.banned = banned;

  const updated = await getClerkClient().users.updateUser(userId, { publicMetadata });
  return json(updated, 200);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
