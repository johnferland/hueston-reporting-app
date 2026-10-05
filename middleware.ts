import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/** Production host; vercel.app traffic is redirected here. */
const CANONICAL_HOST = "dashboard.hueston.co";
const LEGACY_HOST = "hueston-reporting-app.vercel.app";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/no-access(.*)",
  "/api/webhooks/clerk(.*)",
  "/api/webhooks/web-leads(.*)",
  "/api/cron(.*)",
]);

function hasValidCronSecret(request: Request): boolean {
  const auth = request.headers.get("authorization") ?? "";
  return Boolean(process.env.CRON_SECRET) && auth === `Bearer ${process.env.CRON_SECRET}`;
}

export default clerkMiddleware(async (authFn, req) => {
  const host = req.headers.get("host")?.split(":")[0] ?? "";
  if (host === LEGACY_HOST) {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  if (req.nextUrl.pathname.startsWith("/api/cron")) {
    if (!hasValidCronSecret(req)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    return;
  }
  if (!isPublicRoute(req)) {
    await authFn.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js|json|png|svg|jpg|ico)).*)", "/(api|trpc)(.*)"],
};
