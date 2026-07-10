import { createClerkClient, verifyToken } from "@clerk/backend";

const secretKey = process.env.CLERK_SECRET_KEY;
const clerkClient = createClerkClient({ secretKey });

const acceptedRoles = ["sysadmin", "admin", "property_agent", "chief", "chief_asst"];
const AUTO_APPROVED_EMAIL = "samueloseiboatenglistowell57@gmail.com";
const AUTO_APPROVED_ROLE = "sysadmin";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token, { secretKey });
    const userId = payload.sub as string;
    const user = await clerkClient.users.getUser(userId);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 401 });
    }

    const userRole = user.publicMetadata?.role as string;
    const userArea = user.publicMetadata?.area as string;
    const userEmail =
      user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
    const isAutoApproved = userEmail?.trim().toLowerCase() === AUTO_APPROVED_EMAIL;
    const effectiveRole = isAutoApproved ? AUTO_APPROVED_ROLE : userRole;

    const isApproved =
      isAutoApproved || (effectiveRole && acceptedRoles.includes(effectiveRole));

    if (isAutoApproved && userRole !== AUTO_APPROVED_ROLE) {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          role: AUTO_APPROVED_ROLE,
        },
      });
    }

    return Response.json({
      isApproved: !!isApproved,
      area: userArea,
      role: effectiveRole,
      lastChecked: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in mobile /api/approval-status:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
