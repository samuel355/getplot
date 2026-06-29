import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

const LAND_MANAGEMENT_ROLES = ["chief", "chief_asst", "land_manager"];

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

    const { userId, newRole, area, banned } = await request.json();

    // Validate required fields
    if (!userId || (newRole === undefined && banned === undefined)) {
      return NextResponse.json(
        { error: "User ID and either role or banned flag are required" },
        { status: 400 },
      );
    }

    // Land-management roles must be assigned to a site/area.
    if (LAND_MANAGEMENT_ROLES.includes(newRole) && !area) {
      return NextResponse.json({ error: "Area is required for land management roles" }, { status: 400 });
    }

    // Determine area based on role - CLEAR area for non-land-management roles
    const finalArea = LAND_MANAGEMENT_ROLES.includes(newRole) ? area : "";

    // Build publicMetadata update object dynamically
    const publicMetadata = { ...(await client.users.getUser(userId)).publicMetadata };
    if (newRole !== undefined) publicMetadata.role = newRole;
    if (newRole !== undefined) publicMetadata.area = finalArea;
    if (banned !== undefined) publicMetadata.banned = banned;

    const user = await client.users.updateUser(userId, {
      publicMetadata,
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
