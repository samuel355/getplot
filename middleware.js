import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/manager(.*)",
  "/agent(.*)",
  "/properties(.*)",
  "/my-properties(.*)",
  "/api/admin(.*)",
  "/api/cache/clear",
  "/api/edit-user-role",
  "/api/get-user",
  "/api/users",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (isProtectedRoute(req) && !userId) {
    if (req.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Role-based access is enforced in each route's server-side layout via
  // currentUser() (always fresh from Clerk's API), avoiding stale-JWT issues.
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf|map)$).*)",
  ],
};
