import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function GET(request: Request) {
  try {
    // Auth check: Expo Router API routes can access headers
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // In Expo Router API routes, we can verify the session token
    // We'll use the JWT to get the user ID. Clerk session tokens are JWTs.
    // For a more robust solution, use clerkClient.authenticateRequest

    let userId: string;
    try {
      // Direct verification if possible, or use the token to fetch the user
      // which implicitly validates it against Clerk's backend.
      const session = await clerkClient.sessions.getSessionList({ userId: undefined }); // This is just to test connectivity
      // A better way: fetch the user using the token as a Bearer if Clerk supports it,
      // but here we are on the SERVER side of the mobile app.

      // We'll use clerkClient.users.getUser(token) if it was a user ID, but it's a token.
      // So we use the verifyToken helper.
      const payload = await clerkClient.verifyToken(token);
      userId = payload.sub as string;
    } catch (err) {
      console.error("Token verification failed:", err);
      return Response.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    const user = await clerkClient.users.getUser(userId);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 401 });
    }

    const role = user.publicMetadata?.role;
    const allowedRoles = ["admin", "sysadmin"];
    const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;

    const isAllowedByRole = role && allowedRoles.includes(role as string);
    const isAllowedByEmail = email === "samueloseiboatenglistowell57@gmail.com";

    if (!isAllowedByRole && !isAllowedByEmail) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch user list
    const users = await clerkClient.users.getUserList();

    return Response.json(users, { status: 200 });
  } catch (error: any) {
    console.error("Error in mobile /api/users:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
