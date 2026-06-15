import { createClerkClient, verifyToken } from "@clerk/backend";
import { supabase } from "@/lib/supabase";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY as string;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token, { secretKey: CLERK_SECRET_KEY });
    const requesterId = payload.sub as string;

    const requester = await clerkClient.users.getUser(requesterId);
    const requesterRole = requester.publicMetadata?.role as string;
    const isAdmin = requesterRole && ["admin", "sysadmin"].includes(requesterRole);

    if (!isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

    const { action, reviewer_notes, area } = await request.json();
    const id = params.id;

    if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

    const { data: existing, error: fetchErr } = await supabase.from("role_requests").select("*").eq("id", id).single();
    if (fetchErr || !existing) return Response.json({ error: "Request not found" }, { status: 404 });

    const updates: any = {
      status: action === "approve" ? "approved" : "denied",
      reviewer_id: requesterId,
      reviewer_notes: reviewer_notes || "",
      reviewed_at: new Date().toISOString(),
    };

    const { data: updated, error: updateErr } = await supabase
      .from("role_requests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      console.error("Failed to update role request:", updateErr);
      return Response.json({ error: updateErr.message || "Failed to update" }, { status: 500 });
    }

    if (action === "approve") {
      try {
        const targetUserId = existing.user_id;
        const targetUser = await clerkClient.users.getUser(targetUserId);
        const currentMetadata = targetUser.publicMetadata || {};

        const newMetadata: any = { ...currentMetadata, role: existing.role };
        if (area) newMetadata.area = area;

        const updatedUser = await clerkClient.users.updateUser(targetUserId, {
          publicMetadata: newMetadata,
        });

        return Response.json({ success: true, request: updated, user: updatedUser });
      } catch (err) {
        console.error("Failed to update clerk user on approval:", err);
        return Response.json({ error: "Failed to update user metadata" }, { status: 500 });
      }
    }

    return Response.json({ success: true, request: updated });
  } catch (err: any) {
    console.error("Error handling mobile role request action:", err);
    return Response.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token, { secretKey: CLERK_SECRET_KEY });
    const requesterId = payload.sub as string;

    const { data: existing, error: fetchErr } = await supabase.from("role_requests").select("*").eq("id", params.id).single();
    if (fetchErr || !existing) return Response.json({ error: "Not found" }, { status: 404 });

    const requester = await clerkClient.users.getUser(requesterId);
    const requesterRole = requester.publicMetadata?.role as string;
    const isAdmin = requesterRole && ["admin", "sysadmin"].includes(requesterRole);

    if (!isAdmin && existing.user_id !== requesterId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase.from("role_requests").delete().eq("id", params.id);
    if (error) return Response.json({ error: error.message || "Failed to delete" }, { status: 500 });

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting mobile role request:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
