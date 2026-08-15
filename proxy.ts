// proxy.ts
// (Next.js 16 renamed the `middleware` file convention to `proxy`.)
// Gates the dashboards. /admin needs the ADMIN role; /dashboard needs any signed-in staff.
//
// NOTE: we deliberately do NOT use next-auth v4's `withAuth` helper here — it
// assumes the old `middleware.ts` convention and swallows failures into a
// generic `?error=Configuration` redirect. Calling getToken() directly is the
// same work, with errors we can actually see.
import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

const isProduction = process.env.NODE_ENV === "production";

export default async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: isProduction
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token",
    secureCookie: isProduction,
  });

  // Not signed in → send to login, remembering where they were headed.
  if (!token) {
    const signInUrl = new URL("/login", req.url);
    signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(signInUrl);
  }

  const roles = (token.role as string[] | undefined) ?? [];

  if (pathname.startsWith("/admin") && !roles.includes("ADMIN")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
