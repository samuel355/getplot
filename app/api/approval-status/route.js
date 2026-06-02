import { NextResponse } from "next/server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { getOrSetCache } from "@/lib/redis";

const acceptedRoles = ["sysadmin", "admin", "property_agent", "chief", "chief_asst"];
const AUTO_APPROVED_EMAIL = "samueloseiboatenglistowell57@gmail.com";

function buildApprovalResponse(user) {
  const userRole = user.publicMetadata?.role;
  const userArea = user.publicMetadata?.area;
  const userEmail =
    user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;

  const isApproved =
    userEmail === AUTO_APPROVED_EMAIL || (userRole && acceptedRoles.includes(userRole));

  return {
    isApproved: !!isApproved,
    area: userArea,
    role: userRole,
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

    return NextResponse.json(buildApprovalResponse(user));
  } catch (error) {
    console.error("Error in approval status API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
