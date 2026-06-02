import { createClerkClient, verifyToken } from "@clerk/backend";

const secretKey = process.env.CLERK_SECRET_KEY;
const clerkClient = createClerkClient({ secretKey });

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // Verify requester is an admin
    let requesterId: string;
    try {
      const payload = await verifyToken(token, { secretKey });
      requesterId = payload.sub as string;
    } catch (err) {
      return Response.json({ error: "Invalid session" }, { status: 401 });
    }

    const requester = await clerkClient.users.getUser(requesterId);
    const requesterRole = requester.publicMetadata?.role;
    const allowedRoles = ["admin", "sysadmin"];

    const isAllowedByRole = requesterRole && allowedRoles.includes(requesterRole as string);
    const isAllowedByEmail =
      requester.primaryEmailAddress?.emailAddress === "samueloseiboatenglistowell57@gmail.com";

    if (!isAllowedByRole && !isAllowedByEmail) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, newRole, area, banned } = await request.json();
    if (!userId || (newRole === undefined && banned === undefined)) {
      return Response.json(
        { error: "User ID and either role or banned flag are required" },
        { status: 400 },
      );
    }

    if ((newRole === "chief" || newRole === "chief_asst") && !area) {
      return Response.json({ error: "Area is required for chief roles" }, { status: 400 });
    }

    const finalArea = newRole === "chief" || newRole === "chief_asst" ? area : "";

    const targetUser = await clerkClient.users.getUser(userId);
    const publicMetadata: any = { ...targetUser.publicMetadata };

    if (newRole !== undefined) publicMetadata.role = newRole;
    if (newRole !== undefined) publicMetadata.area = finalArea;
    if (banned !== undefined) publicMetadata.banned = banned;

    const user = await clerkClient.users.updateUser(userId, {
      publicMetadata,
    });

    return Response.json(user, { status: 200 });
  } catch (error: any) {
    console.error("Error updating user role in mobile API:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
