import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    const { userId } = await request.json();
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
