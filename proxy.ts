// proxy.ts
// (Next.js 16 renamed the `middleware` file convention to `proxy`.)
// Gates the dashboards. /admin needs the ADMIN role; /dashboard needs any signed-in staff.
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const roles = (req.nextauth?.token?.role as string[] | undefined) ?? [];

    if (pathname.startsWith("/admin") && !roles.includes("ADMIN")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
