import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/approval(.*)",
  "/unauthorized(.*)",
  "/contact(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/message(.*)",
  "/marketplace(.*)",
  "/sites(.*)",
  "/api/approval-status",
  "/api/properties/list",
  "/api/properties/:id",
  "/api/receive-email",
  "/api/properties/notify-interest",
  "/api/reserve-plot",
  "/api/buy-plot",
  "/api/send-sms",
]);

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAgentRoute = createRouteMatcher(["/agent(.*)"]);
const isManagerRoute = createRouteMatcher(["/manager(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const isPublic = isPublicRoute(req);

  if (!isPublic && !userId) {
    if (req.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (userId) {
    const role = sessionClaims?.publicMetadata?.role;

    if (isDashboardRoute(req) && role !== "sysadmin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (isAgentRoute(req) && role !== "agent" && role !== "sysadmin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (isManagerRoute(req) && role !== "land_manager" && role !== "sysadmin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf|map)$).*)",
  ],
};
