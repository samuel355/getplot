import { NextResponse } from "next/server";
import { currentUser, clerkClient, auth } from "@clerk/nextjs/server";
import { getOrSetCache } from "@/lib/redis";

export async function GET(request) {
  try {
    // Try web session first
    let user = await currentUser();

    // Mobile / API callers: accept Bearer token (Clerk session JWT)
    if (!user) {
      const { userId } = await auth({ acceptsToken: ["session_token", "oauth_token"] });
      if (userId) {
        user = await getOrSetCache(
          `clerk:user:${userId}`,
          async () => {
            const client = await clerkClient();
            return await client.users.getUser(userId);
          },
          60
        );
      }
    } else if (user?.id) {
      // warm cache for web callers
      getOrSetCache(`clerk:user:${user.id}`, async () => user, 60).catch(() => {});
    }

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const role = user.publicMetadata?.role;
    const allowedRoles = ["admin", "sysadmin"];
    const email =
      user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;

    const isAllowedByRole = role && allowedRoles.includes(role);
    const isAllowedByEmail = email === "samueloseiboatenglistowell57@gmail.com";

    if (!isAllowedByRole && !isAllowedByEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use clerkClient to fetch user list
    const client = await clerkClient();

    const users = await getOrSetCache(
      "clerk:users:list",
      async () => {
        const response = await client.users.getUserList();
        return response;
      },
      600
    );

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error in /api/users:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
