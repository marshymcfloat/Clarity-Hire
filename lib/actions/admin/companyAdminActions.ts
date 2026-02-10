"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/prisma/prisma";
import { requirePlatformAdmin } from "@/lib/server-auth";
import { BillingStatus } from "@/lib/generated/prisma/client";
import { createAdminAuditLog } from "./audit";

type AdminActionResult = {
  success: boolean;
  error?: string;
  message?: string;
};

const ALLOWED_COMPANY_PLANS = new Set(["free", "starter", "pro", "enterprise"]);
const ALLOWED_BILLING_STATUSES = new Set<BillingStatus>([
  "NONE",
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "UNPAID",
  "CANCELED",
  "PAUSED",
]);

export async function verifyCompanyAction(
  companyId: string,
  reason?: string,
): Promise<AdminActionResult> {
  const admin = await requirePlatformAdmin();
  if (!admin.authorized) {
    return { success: false, error: admin.error };
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, slug: true, verificationStatus: true },
  });

  if (!company) {
    return { success: false, error: "Company not found." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.company.update({
      where: { id: companyId },
      data: {
        verificationStatus: "VERIFIED",
        verificationRequestedAt: null,
        verifiedAt: new Date(),
        verifiedByUserId: admin.userId,
        verificationReason: reason ?? "Verified by platform admin.",
        suspendedAt: null,
        suspensionReason: null,
      },
    });

    await createAdminAuditLog(tx, {
      actorUserId: admin.userId,
      action: "COMPANY_VERIFIED",
      targetType: "COMPANY",
      targetId: companyId,
      reason,
      companyId,
      metadata: {
        previousStatus: company.verificationStatus,
        nextStatus: "VERIFIED",
      },
    });
  });

  revalidatePath("/admin/companies");
  revalidatePath(`/${company.slug}/available-jobs`);
  return { success: true, message: "Company verified." };
}

export async function rejectCompanyAction(
  companyId: string,
  reason?: string,
): Promise<AdminActionResult> {
  const admin = await requirePlatformAdmin();
  if (!admin.authorized) {
    return { success: false, error: admin.error };
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, verificationStatus: true },
  });

  if (!company) {
    return { success: false, error: "Company not found." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.company.update({
      where: { id: companyId },
      data: {
        verificationStatus: "REJECTED",
        verifiedByUserId: admin.userId,
        verificationReason: reason ?? "Verification request rejected.",
      },
    });

    await createAdminAuditLog(tx, {
      actorUserId: admin.userId,
      action: "COMPANY_REJECTED",
      targetType: "COMPANY",
      targetId: companyId,
      reason,
      companyId,
      metadata: {
        previousStatus: company.verificationStatus,
        nextStatus: "REJECTED",
      },
    });
  });

  revalidatePath("/admin/companies");
  return { success: true, message: "Company rejected." };
}

export async function suspendCompanyAction(
  companyId: string,
  reason?: string,
): Promise<AdminActionResult> {
  const admin = await requirePlatformAdmin();
  if (!admin.authorized) {
    return { success: false, error: admin.error };
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, slug: true, verificationStatus: true },
  });

  if (!company) {
    return { success: false, error: "Company not found." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.company.update({
      where: { id: companyId },
      data: {
        verificationStatus: "SUSPENDED",
        suspendedAt: new Date(),
        suspensionReason: reason ?? "Suspended by platform admin.",
      },
    });

    const archived = await tx.job.updateMany({
      where: {
        companyId,
        status: "PUBLISHED",
      },
      data: {
        status: "ARCHIVED",
      },
    });

    await createAdminAuditLog(tx, {
      actorUserId: admin.userId,
      action: "COMPANY_SUSPENDED",
      targetType: "COMPANY",
      targetId: companyId,
      reason,
      companyId,
      metadata: {
        previousStatus: company.verificationStatus,
        nextStatus: "SUSPENDED",
        archivedPublishedJobsCount: archived.count,
      },
    });
  });

  revalidatePath("/admin/companies");
  revalidatePath("/admin/jobs");
  revalidatePath(`/${company.slug}/available-jobs`);
  return { success: true, message: "Company suspended and published jobs archived." };
}

export async function unsuspendCompanyAction(
  companyId: string,
  reason?: string,
): Promise<AdminActionResult> {
  const admin = await requirePlatformAdmin();
  if (!admin.authorized) {
    return { success: false, error: admin.error };
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, verificationStatus: true, verifiedAt: true },
  });

  if (!company) {
    return { success: false, error: "Company not found." };
  }

  const nextStatus = company.verifiedAt ? "VERIFIED" : "PENDING";

  await prisma.$transaction(async (tx) => {
    await tx.company.update({
      where: { id: companyId },
      data: {
        verificationStatus: nextStatus,
        suspendedAt: null,
        suspensionReason: null,
        verificationReason: reason ?? "Suspension lifted by platform admin.",
      },
    });

    await createAdminAuditLog(tx, {
      actorUserId: admin.userId,
      action: "COMPANY_UNSUSPENDED",
      targetType: "COMPANY",
      targetId: companyId,
      reason,
      companyId,
      metadata: {
        previousStatus: company.verificationStatus,
        nextStatus,
      },
    });
  });

  revalidatePath("/admin/companies");
  return { success: true, message: "Company unsuspended." };
}

type UpdateCompanyEntitlementsPayload = {
  companyId: string;
  plan: string;
  billingStatus: BillingStatus;
  activePublishedJobsLimit?: number | null;
  reason?: string;
};

export async function updateCompanyEntitlementsAction(
  payload: UpdateCompanyEntitlementsPayload,
): Promise<AdminActionResult> {
  const admin = await requirePlatformAdmin();
  if (!admin.authorized) {
    return { success: false, error: admin.error };
  }

  const normalizedPlan = payload.plan.trim().toLowerCase();
  if (!ALLOWED_COMPANY_PLANS.has(normalizedPlan)) {
    return {
      success: false,
      error: "Invalid plan. Allowed values: free, starter, pro, enterprise.",
    };
  }

  if (!ALLOWED_BILLING_STATUSES.has(payload.billingStatus)) {
    return { success: false, error: "Invalid billing status value." };
  }

  if (
    payload.activePublishedJobsLimit != null &&
    (payload.activePublishedJobsLimit < 0 ||
      !Number.isInteger(payload.activePublishedJobsLimit))
  ) {
    return {
      success: false,
      error: "activePublishedJobsLimit must be a non-negative integer or null.",
    };
  }

  const company = await prisma.company.findUnique({
    where: { id: payload.companyId },
    select: {
      id: true,
      plan: true,
      billingStatus: true,
      activePublishedJobsLimit: true,
    },
  });

  if (!company) {
    return { success: false, error: "Company not found." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.company.update({
      where: { id: payload.companyId },
      data: {
        plan: normalizedPlan,
        billingStatus: payload.billingStatus,
        activePublishedJobsLimit: payload.activePublishedJobsLimit,
      },
    });

    await createAdminAuditLog(tx, {
      actorUserId: admin.userId,
      action: "COMPANY_ENTITLEMENTS_UPDATED",
      targetType: "COMPANY",
      targetId: payload.companyId,
      reason: payload.reason,
      companyId: payload.companyId,
      metadata: {
        previous: {
          plan: company.plan,
          billingStatus: company.billingStatus,
          activePublishedJobsLimit: company.activePublishedJobsLimit,
        },
        next: {
          plan: normalizedPlan,
          billingStatus: payload.billingStatus,
          activePublishedJobsLimit: payload.activePublishedJobsLimit,
        },
      },
    });
  });

  revalidatePath("/admin/companies");
  revalidatePath("/admin/jobs");
  return { success: true, message: "Company entitlements updated." };
}
