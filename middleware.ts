import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 1. If the user is not a logged-in recruiter, do nothing.
  // Let the page-level logic handle authorization.
  if (!token || !token.isRecruiter) {
    return NextResponse.next();
  }

  const userId = token.id as string;
  const companyId = token.activeCompanyId as string;

  // 2. If token is incomplete, do nothing and let the user get logged out or handled by the app.
  if (!userId || !companyId) {
    console.error("Recruiter token is missing userId or activeCompanyId.");
    return NextResponse.next();
  }

  // Prisma Client cannot run in Edge Middleware.
  // We should rely on standard redirection or handle this logic in a Server Component layout.

  // Redirect recruiters to their dashboard if they are on a generic page
  // console.log("Middleware Token:", {
  //   isRecruiter: token?.isRecruiter,
  //   slug: token?.activeCompanySlug,
  //   memberId: token?.memberId,
  //   path: pathname
  // });

  if (token.isRecruiter && token.activeCompanySlug && token.memberId) {
    const recruiterBasePath = `/${token.activeCompanySlug}/${token.memberId}`;

    // Allow access if already on the recruiter's specific path
    if (pathname.startsWith(recruiterBasePath)) {
      return NextResponse.next();
    }

    // Redirect to dashboard if on strictly root or other generic landing/auth pages
    if (
      pathname === "/" ||
      pathname === "/companies" ||
      pathname === "/api/auth/signin"
    ) {
      const redirectUrl = new URL(`${recruiterBasePath}/dashboard`, req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
