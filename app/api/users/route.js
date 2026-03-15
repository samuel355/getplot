import { NextResponse } from "next/server";
import { currentUser, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const role = user.publicMetadata?.role;
    const allowedRoles = ["admin", "sysadmin"];
    const email =
      user.primaryEmailAddress?.emailAddress ||
      user.emailAddresses?.[0]?.emailAddress;

    const isAllowedByRole = role && allowedRoles.includes(role);
    const isAllowedByEmail =
      email === "samueloseiboatenglistowell57@gmail.com";

    if (!isAllowedByRole && !isAllowedByEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use clerkClient from @clerk/nextjs/server (object, not function)
    const clerk = await clerkClient();
    const users = await clerk.users.getUserList();
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
