import { NextResponse } from "next/server";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { getOrSetCache } from "@/lib/redis";

export async function GET() {
  try {
    const user = await currentUser();
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

    // Use clerkClient from @clerk/nextjs/server (object, not function)
    const clerk = await clerkClient();

    // Cache the user list for 10 minutes (600 seconds)
    const users = await getOrSetCache(
      "clerk:users:list",
      async () => {
        const response = await clerk.users.getUserList();
        // Clerk might return a complex object, ensure it's JSON serializable if needed
        // Actually getUserList() usually returns an array or object with data
        return response;
      },
      600,
    );

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
