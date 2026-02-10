"use server";

import { Prisma } from "@/lib/generated/prisma/client";

type CreateAdminAuditLogInput = {
  actorUserId: string;
  action: string;
  targetType: "COMPANY" | "JOB" | "USER";
  targetId: string;
  reason?: string;
  companyId?: string;
  metadata?: Prisma.InputJsonValue;
};

export async function createAdminAuditLog(
  tx: Prisma.TransactionClient,
  input: CreateAdminAuditLogInput,
) {
  await tx.adminAuditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
      companyId: input.companyId,
      metadata: input.metadata,
    },
  });
}
