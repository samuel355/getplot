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
});

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
