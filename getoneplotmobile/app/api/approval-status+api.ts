import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const acceptedRoles = ["sysadmin", "admin", "property_agent", "chief", "chief_asst"];
const AUTO_APPROVED_EMAIL = "samueloseiboatenglistowell57@gmail.com";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await clerkClient.verifyToken(token);
    const userId = payload.sub as string;
    const user = await clerkClient.users.getUser(userId);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 401 });
    }

    const userRole = user.publicMetadata?.role as string;
    const userArea = user.publicMetadata?.area as string;
    const userEmail =
      user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;

    const isApproved =
      userEmail === AUTO_APPROVED_EMAIL || (userRole && acceptedRoles.includes(userRole));

    return Response.json({
      isApproved: !!isApproved,
      area: userArea,
      role: userRole,
      lastChecked: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in mobile /api/approval-status:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
