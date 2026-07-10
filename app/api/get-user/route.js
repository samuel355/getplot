import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getOrSetCache } from "@/lib/redis";

function isClerkNotFound(error) {
  return error?.status === 404 || error?.errors?.some((item) => item?.code === "resource_not_found");
}

export async function POST(request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const clerk = await clerkClient();

    const user = await getOrSetCache(
      `clerk:user:${userId}`,
      async () => {
        return await clerk.users.getUser(userId);
      },
      300 // cache for 5 minutes
    );

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    if (isClerkNotFound(error)) {
      return NextResponse.json(
        { error: "User not found", code: "user_not_found" },
        { status: 404 },
      );
    }

    console.error("Error in /api/get-user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
