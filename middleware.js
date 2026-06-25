import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Freely accessible — no sign-in required
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/contact-us(.*)",
  "/market-place(.*)",
  "/get-plot(.*)",
  "/get-home(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/property/(.*)",
  "/view-land-listing(.*)",
  "/view-house-listing(.*)",
  "/trabuom(.*)",
  "/legon-hills(.*)",
  "/berekuso(.*)",
  "/yabi(.*)",
  "/nthc(.*)",
  "/dar-es-salaam(.*)",
  "/asokore-mampong(.*)",
  "/royal-court-estate(.*)",
  "/new-trabuom(.*)",
  "/api/approval-status",
  "/api/properties/list",
  "/api/properties/:id",
  "/api/receive-email",
  "/api/properties/notify-interest",
  "/api/reserve-plot",
  "/api/buy-plot",
  "/api/send-sms",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const isPublic = isPublicRoute(req);

  if (!isPublic && !userId) {
    if (req.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf|map)$).*)",
  ],
};
