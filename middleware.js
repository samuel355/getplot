import { auth, clerkMiddleware } from "@clerk/nextjs/server";

const protectedRoutes = {
  "/properties": ["admin", "sysadmin"],
  "/properties/all-properties": ["admin", "sysadmin"],
  "/properties/users": ["admin", "sysadmin"],
  "/properties/analytics": ["admin", "sysadmin"],
  "/properties/activity": ["admin", "sysadmin"],
  "/properties/settings": ["admin", "sysadmin"],
  "/properties/system-logs": ["admin", "sysadmin"],
};

export default clerkMiddleware(
  (auth, req) => {
    const { userId, isPublicRoute } = auth();

    // If it's an API route and not authenticated, return 401 instead of redirecting
    if (!userId && !isPublicRoute && req.nextUrl.pathname.startsWith("/api")) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle users who aren't authenticated for non-API routes
    if (!userId && !isPublicRoute) {
      return Response.redirect(new URL("/sign-in", req.url));
    }

    // Redirect signed-in users to approval page from root
    if (userId && req.nextUrl.pathname === "/") {
      return Response.redirect(new URL("/approval", req.url));
    }
  },
  {
    publicRoutes: ["/", "/api/approval-status", "/api/properties/list", "/api/properties/:id"],
  },
);

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
