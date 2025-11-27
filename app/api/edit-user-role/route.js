import { createClerkClient } from "@clerk/clerk-sdk-node";
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(request) {
  try {
    const { userId, role, area } = await request.json();

    // Validate required fields
    if (!userId || !role) {
      return new Response(
        JSON.stringify({ error: "User ID and role are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // For chief roles, area is required
    if ((role === "chief" || role === "chief_asst") && !area) {
      return new Response(
        JSON.stringify({ error: "Area is required for chief roles" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Determine area based on role - CLEAR area for non-chief roles
    const finalArea = role === "chief" || role === "chief_asst" ? area : "";

    // Update user in Clerk
    const user = await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: role,
        area: finalArea, // This will be empty string for non-chief roles
      },
    });

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
