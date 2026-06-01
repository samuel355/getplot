import { createClerkClient } from "@clerk/backend";
import { supabase } from "../../../src/lib/supabase";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const ALLOWED_ROLES = ["property_agent", "chief"];

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await clerkClient.verifyToken(token);
    const userId = payload.sub as string;

    const { role, details } = await request.json();

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    const payloadRow = {
      user_id: userId,
      role,
      details: details || "",
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("role_requests").insert([payloadRow]).select().single();

    if (error) {
      console.error("Supabase insert error:", error);
      return Response.json({ error: error.message || "Failed to create request" }, { status: 500 });
    }

    return Response.json({ success: true, request: data });
  } catch (err: any) {
    console.error("Error in mobile role-requests POST:", err);
    return Response.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await clerkClient.verifyToken(token);
    const requesterId = payload.sub as string;

    const requester = await clerkClient.users.getUser(requesterId);
    const requesterRole = requester.publicMetadata?.role as string;
    const isAdmin = requesterRole && ["admin", "sysadmin"].includes(requesterRole);

    let query = supabase.from("role_requests").select("*").order("created_at", { ascending: false });
    if (!isAdmin) query = query.eq("user_id", requesterId);

    const { data, error } = await query;
    if (error) {
      console.error("Supabase select error:", error);
      return Response.json({ error: error.message || "Failed to fetch requests" }, { status: 500 });
    }

    return Response.json({ data });
  } catch (err: any) {
    console.error("Error in mobile role-requests GET:", err);
    return Response.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
