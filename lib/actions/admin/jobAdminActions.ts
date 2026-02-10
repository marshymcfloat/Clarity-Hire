"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/prisma/prisma";
import { requirePlatformAdmin } from "@/lib/server-auth";
import { createAdminAuditLog } from "./audit";
import { canPublishForCompany } from "@/lib/policy/publishPolicy";

type AdminJobActionResult = {
  success: boolean;
  error?: string;
  message?: string;
};

export async function approveJobAction(
  jobId: string,
  reason?: string,
): Promise<AdminJobActionResult> {
  const admin = await requirePlatformAdmin();
  if (!admin.authorized) {
    return { success: false, error: admin.error };
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      companyId: true,
      Company: {
        select: {
          slug: true,
          verificationStatus: true,
        },
      },
    },
  });

  if (!job) {
    return { success: false, error: "Job not found." };
  }

  const policy = await canPublishForCompany({
    companyId: job.companyId,
    excludeJobId: job.id,
    targetStatus: "PUBLISHED",
  });
  if (!policy.allowed) {
    await prisma.adminAuditLog.create({
      data: {
        actorUserId: admin.userId,
        action: "JOB_APPROVAL_BLOCKED_BY_POLICY",
        targetType: "JOB",
        targetId: jobId,
        companyId: job.companyId,
        reason: reason ?? policy.message,
        metadata: {
          previousStatus: job.status,
          policyCode: policy.code,
          policyMessage: policy.message,
          policyContext: policy.context,
        },
      },
    });

    return {
      success: false,
      error: policy.message,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.job.update({
      where: { id: jobId },
      data: { status: "PUBLISHED" },
    });

    await createAdminAuditLog(tx, {
      actorUserId: admin.userId,
      action: "JOB_APPROVED",
      targetType: "JOB",
      targetId: jobId,
      reason,
      companyId: job.companyId,
      metadata: {
        previousStatus: job.status,
        nextStatus: "PUBLISHED",
        policyCode: policy.code,
        policyContext: policy.context,
      },
    });
  });

  revalidatePath("/admin/jobs");
  revalidatePath(`/${job.Company.slug}/available-jobs`);
  return { success: true, message: "Job approved and published." };
}

export async function rejectJobAction(
  jobId: string,
  reason?: string,
): Promise<AdminJobActionResult> {
  const admin = await requirePlatformAdmin();
  if (!admin.authorized) {
    return { success: false, error: admin.error };
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      companyId: true,
      Company: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!job) {
    return { success: false, error: "Job not found." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.job.update({
      where: { id: jobId },
      data: { status: "REJECTED" },
    });

    await createAdminAuditLog(tx, {
      actorUserId: admin.userId,
      action: "JOB_REJECTED",
      targetType: "JOB",
      targetId: jobId,
      reason,
      companyId: job.companyId,
      metadata: {
        previousStatus: job.status,
        nextStatus: "REJECTED",
      },
    });
  });

  revalidatePath("/admin/jobs");
  revalidatePath(`/${job.Company.slug}/available-jobs`);
  return { success: true, message: "Job rejected." };
}
