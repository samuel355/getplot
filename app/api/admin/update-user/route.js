import { createClerkClient } from "@clerk/clerk-sdk-node";
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(request) {
  try {
    const { userId, newRole, area } = await request.json();
    //console.log(userId, newRole, area)

    // Validate required fields
    if (!userId || !newRole) {
      return new Response(
        JSON.stringify({ error: "User ID and role are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // For chief roles, area is required
    if ((newRole === "chief" || newRole === "chief_asst") && !area) {
      return new Response(
        JSON.stringify({ error: "Area is required for chief roles" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Determine area based on role - CLEAR area for non-chief roles
    const finalArea =
      newRole === "chief" || newRole === "chief_asst" ? area : "";

    const user = await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: newRole,
        area: finalArea,
      },
    });

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
