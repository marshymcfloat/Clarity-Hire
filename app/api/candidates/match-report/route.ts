import { generateMatchReport } from "@/lib/rag/match-report";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logCandidateAccess } from "@/lib/rag/audit";
import { getRecruiterContext, JOB_MANAGEMENT_ROLES } from "@/lib/security";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  candidateId: z.string().cuid(),
  jobId: z.string().cuid(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { candidateId, jobId } = requestSchema.parse(body);

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { companyId: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const access = await getRecruiterContext(session.user.id, {
      companyId: job.companyId,
      allowedMemberRoles: JOB_MANAGEMENT_ROLES,
    });

    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: 403 });
    }

    const matchReport = await generateMatchReport(candidateId, jobId, {
      companyId: access.companyId,
    });

    await logCandidateAccess({
      companyId: access.companyId,
      userId: session.user.id,
      candidateId,
      action: "GENERATE_MATCH_REPORT",
      metadata: { jobId },
    });

    return NextResponse.json(matchReport);
  } catch (error) {
    console.error("Error in match report generation:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
