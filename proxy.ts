import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const RECRUITER_ROUTE_PATTERN =
  /^\/([^/]+)\/([^/]+)\/(dashboard|manage-jobs|manage-applicants)(?:\/|$)/;
const APPLICANT_ROUTE_PATTERN =
  /^\/([^/]+)\/(saved-jobs|job-applications)(?:\/|$)/;
const CANDIDATE_ROUTE_PATTERN = /^\/candidates(?:\/|$)/;
const PLATFORM_ADMIN_ROUTE_PATTERN = /^\/admin(?:\/|$)/;

function redirectToSignIn(req: NextRequest) {
  const signInUrl = new URL("/api/auth/signin", req.url);
  signInUrl.searchParams.set(
    "callbackUrl",
    `${req.nextUrl.pathname}${req.nextUrl.search}`,
  );
  return NextResponse.redirect(signInUrl);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = Boolean(token?.id);
  const isRecruiter = token?.isRecruiter === true;
  const isPlatformAdmin = token?.isPlatformAdmin === true;
  const activeCompanySlug =
    typeof token?.activeCompanySlug === "string" ? token.activeCompanySlug : "";
  const memberId = typeof token?.memberId === "string" ? token.memberId : "";

  const recruiterRouteMatch = pathname.match(RECRUITER_ROUTE_PATTERN);
  const applicantRouteMatch = pathname.match(APPLICANT_ROUTE_PATTERN);
  const isCandidatesRoute = CANDIDATE_ROUTE_PATTERN.test(pathname);
  const isPlatformAdminRoute = PLATFORM_ADMIN_ROUTE_PATTERN.test(pathname);

  if (isPlatformAdminRoute) {
    if (!isAuthenticated) {
      return redirectToSignIn(req);
    }

    if (!isPlatformAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  // Recruiter-only route protection.
  if (recruiterRouteMatch || isCandidatesRoute) {
    if (!isAuthenticated) {
      return redirectToSignIn(req);
    }

    if (!isRecruiter) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (recruiterRouteMatch) {
      if (!activeCompanySlug || !memberId) {
        return redirectToSignIn(req);
      }

      const [, routeCompanySlug, routeMemberId, section] = recruiterRouteMatch;

      if (
        routeCompanySlug !== activeCompanySlug ||
        routeMemberId !== memberId
      ) {
        return NextResponse.redirect(
          new URL(`/${activeCompanySlug}/${memberId}/${section}`, req.url),
        );
      }
    }

    return NextResponse.next();
  }

  // Applicant-only routes require authentication.
  if (applicantRouteMatch) {
    if (!isAuthenticated) {
      return redirectToSignIn(req);
    }

    // Recruiters should stay in recruiter workspaces.
    if (isRecruiter && activeCompanySlug && memberId) {
      return NextResponse.redirect(
        new URL(`/${activeCompanySlug}/${memberId}/dashboard`, req.url),
      );
    }

    return NextResponse.next();
  }

  // Convenience: recruiters on generic pages go to their dashboard.
  if (
    isPlatformAdmin &&
    (pathname === "/" || pathname === "/companies")
  ) {
    return NextResponse.redirect(new URL("/admin/companies", req.url));
  }

  if (
    isRecruiter &&
    activeCompanySlug &&
    memberId &&
    (pathname === "/" || pathname === "/companies")
  ) {
    return NextResponse.redirect(
      new URL(`/${activeCompanySlug}/${memberId}/dashboard`, req.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
