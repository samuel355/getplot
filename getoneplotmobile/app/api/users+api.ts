import { createClerkClient, verifyToken } from "@clerk/backend";

const secretKey = process.env.CLERK_SECRET_KEY;
const clerkClient = createClerkClient({ secretKey });

export async function GET(request: Request) {
  const startTime = Date.now();
  try {
    console.log("[Mobile API /users] Request started at", new Date().toISOString());
    console.log("[Mobile API /users] CLERK_SECRET_KEY available?", !!process.env.CLERK_SECRET_KEY);

    // Auth check
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[Mobile API /users] No auth header, returning 401");
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    console.log("[Mobile API /users] Token received, attempting verification...");

    let userId: string;
    try {
      const payload = await verifyToken(token, { secretKey });
      userId = payload.sub as string;
      console.log("[Mobile API /users] Token verified for userId:", userId);
    } catch (err: any) {
      console.error("[Mobile API /users] Token verification error:", err.message);
      return Response.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    console.log("[Mobile API /users] Fetching user from Clerk...");
    const user = await clerkClient.users.getUser(userId);
    console.log("[Mobile API /users] User fetched:", user?.id);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 401 });
    }

    const role = user.publicMetadata?.role;
    const allowedRoles = ["admin", "sysadmin"];
    const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;

    const isAllowedByRole = role && allowedRoles.includes(role as string);
    const isAllowedByEmail = email === "samueloseiboatenglistowell57@gmail.com";

    if (!isAllowedByRole && !isAllowedByEmail) {
      console.log("[Mobile API /users] User not authorized. Role:", role, "Email:", email);
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("[Mobile API /users] User authorized, fetching users list from Clerk...");
    const startClerkCall = Date.now();
    const users = await clerkClient.users.getUserList();
    console.log("[Mobile API /users] Clerk getUserList completed in", Date.now() - startClerkCall, "ms");
    console.log("[Mobile API /users] Users returned:", users.data?.length || 0);

    console.log("[Mobile API /users] Success! Elapsed:", Date.now() - startTime, "ms");
    return Response.json(users, { status: 200 });
  } catch (error: any) {
    console.error("[Mobile API /users] FATAL ERROR:", error.message || error);
    console.error("[Mobile API /users] Stack:", error.stack);
    console.log("[Mobile API /users] Total elapsed:", Date.now() - startTime, "ms");
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
