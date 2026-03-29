import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/articles(.*)",
  "/editor(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect({
      unauthenticatedUrl: new URL("/login", request.url).toString(),
    });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|login|.*\\..*).*)", "/(api|trpc)(.*)"],
};
