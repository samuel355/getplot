import { NextResponse } from "next/server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { getOrSetCache } from "@/lib/redis";
import {
  AUTO_SYSADMIN_ROLE,
  ensureAutoSysadminMetadata,
  getEffectiveRole,
  getUserPrimaryEmail,
  isAutoSysadminEmail,
} from "@/lib/autoApproval";

export const dynamic = "force-dynamic";

const acceptedRoles = ["sysadmin", "admin", "property_agent", "chief", "chief_asst"];

function buildApprovalResponse(user) {
  const userRole = getEffectiveRole(user);
  const userArea = user.publicMetadata?.area;
  const userEmail = getUserPrimaryEmail(user);

  const isApproved =
    isAutoSysadminEmail(userEmail) || (userRole && acceptedRoles.includes(userRole));

  return {
    isApproved: !!isApproved,
    area: userArea,
    role: isAutoSysadminEmail(userEmail) ? AUTO_SYSADMIN_ROLE : userRole,
    lastChecked: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    // Mobile / API callers: auth() handles both Bearer token and session cookie in Next.js
    const authObj = await auth();
    let userId = authObj.userId;
    let user = null;

    if (userId) {
      user = await getOrSetCache(
        `clerk:user:${userId}`,
        async () => {
          const client = await clerkClient();
          return await client.users.getUser(userId);
        },
        60,
      );
    } else {
      // Fallback for web if currentUser is preferred
      user = await currentUser();
    }

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (getEffectiveRole(user) === AUTO_SYSADMIN_ROLE) {
      const client = await clerkClient();
      await ensureAutoSysadminMetadata(client, user);
    }

    return NextResponse.json(buildApprovalResponse(user));
  } catch (error) {
    console.error("Error in approval status API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
