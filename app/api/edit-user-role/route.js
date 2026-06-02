import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    const authObj = await auth();
    const { userId: requesterId } = authObj;

    if (!requesterId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const client = await clerkClient();
    const requester = await client.users.getUser(requesterId);
    const requesterRole = requester.publicMetadata?.role;
    const allowedRoles = ["admin", "sysadmin"];

    const isAllowedByRole = requesterRole && allowedRoles.includes(requesterRole);
    const isAllowedByEmail =
      requester.primaryEmailAddress?.emailAddress === "samueloseiboatenglistowell57@gmail.com";

    if (!isAllowedByRole && !isAllowedByEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, role, area } = await request.json();

    // Validate required fields
    if (!userId || !role) {
      return NextResponse.json({ error: "User ID and role are required" }, { status: 400 });
    }

    // For chief roles, area is required
    if ((role === "chief" || role === "chief_asst") && !area) {
      return NextResponse.json({ error: "Area is required for chief roles" }, { status: 400 });
    }

    // Determine area based on role - CLEAR area for non-chief roles
    const finalArea = role === "chief" || role === "chief_asst" ? area : "";

    // Update user in Clerk
    const user = await client.users.updateUser(userId, {
      publicMetadata: {
        role: role,
        area: finalArea,
      },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
