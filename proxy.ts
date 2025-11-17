import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/prisma/prisma";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.isRecruiter) {
    return NextResponse.next();
  }

  const userId = token.id as string;
  const companyId = token.activeCompanyId as string;

  if (!userId || !companyId) {
    console.error("Recruiter token is missing userId or activeCompanyId.");
    return NextResponse.next();
  }

  try {
    const companyMember = await prisma.companyMember.findUnique({
      where: {
        userId_companyId: {
          userId: userId,
          companyId: companyId,
        },
      },
      include: {
        company: {
          select: { slug: true },
        },
      },
    });

    if (companyMember && companyMember.company.slug) {
      const {
        id: memberId,
        company: { slug: companySlug },
      } = companyMember;

      const recruiterBasePath = `/${companySlug}/${memberId}`;

      if (pathname.startsWith(recruiterBasePath)) {
        return NextResponse.next();
      }

      const redirectUrl = new URL(`${recruiterBasePath}/dashboard`, req.url);
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error("Error in middleware while fetching company data:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
