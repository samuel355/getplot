import { NextResponse } from "next/server";
import { currentUser, clerkClient, auth } from "@clerk/nextjs/server";
import { getOrSetCache } from "@/lib/redis";

export const dynamic = "force-dynamic";

function isClerkNotFound(error) {
  return error?.status === 404 || error?.errors?.some((item) => item?.code === "resource_not_found");
}

export async function GET(request) {
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

    const role = user.publicMetadata?.role;
    const allowedRoles = ["admin", "sysadmin"];
    const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;

    const isAllowedByRole = role && allowedRoles.includes(role);
    const isAllowedByEmail = email === "samueloseiboatenglistowell57@gmail.com";

    if (!isAllowedByRole && !isAllowedByEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use clerkClient to fetch user list
    const client = await clerkClient();

    const usersResponse = await getOrSetCache(
      "clerk:users:list",
      async () => {
        return await client.users.getUserList();
      },
      300, // 5 minutes cache
    );

    // Ensure we return an object with a 'data' property for the mobile app
    // If usersResponse is already an array, wrap it. If it's the PaginatedResourceResponse, it already has .data
    const responseData = Array.isArray(usersResponse) ? { data: usersResponse } : usersResponse;

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    if (isClerkNotFound(error)) {
      return NextResponse.json({ error: "User not found", code: "user_not_found" }, { status: 404 });
    }

    console.error("Error in /api/users:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
