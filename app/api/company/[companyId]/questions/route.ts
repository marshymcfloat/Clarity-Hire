import { prisma } from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";
import { JOB_MANAGEMENT_ROLES } from "@/lib/security";
import { requireRecruiterAccess } from "@/lib/server-auth";

type Params = Promise<{ companyId: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { companyId } = await params;
  const auth = await requireRecruiterAccess({
    companyId,
    allowedMemberRoles: JOB_MANAGEMENT_ROLES,
  });

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const questions = await prisma.question.findMany({ where: { companyId } });

    return NextResponse.json(questions);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
