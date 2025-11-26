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

export default clerkMiddleware({
  publicRoutes: ["/"],
  afterAuth(auth, req) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      return Response.redirect(new URL("/sign-in", req.url));
    }
    
    // Redirect signed-in users to approval page
    if (auth.userId && req.nextUrl.pathname === "/") {
      return Response.redirect(new URL("/approval", req.url));
    }
  },
});

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
