import { prisma } from "@/lib/prisma";
import { AccessAction } from "../generated/prisma/enums";

export interface AuditLogEntry {
  companyId: string;
  userId: string; // Recruiter who performed the action
  candidateId: string;
  action: AccessAction;
  metadata?: Record<string, any>;
}

/**
 * Log candidate access for GDPR compliance
 *
 * Records who accessed candidate data, when, and why
 * This helps with:
 * - GDPR Article 15 (Right of Access) - candidates can see who viewed their data
 * - GDPR Article 30 (Records of Processing Activities)
 * - Audit trails for compliance verification
 *
 * @param entry - Audit log entry details
 */
export async function logCandidateAccess(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.candidateAccessLog.create({
      data: {
        companyId: entry.companyId,
        accessorId: entry.userId,
        candidateId: entry.candidateId,
        actionType: entry.action,
        resourceType: "CANDIDATE",
        resourceId: entry.candidateId,
        metadata: entry.metadata || {},
      },
    });
  } catch (error) {
    // Don't throw - audit logging should not break the main flow
    console.error("Failed to log candidate access:", error);
  }
}

/**
 * Get access logs for a specific candidate
 * Useful for GDPR data access requests
 *
 * @param candidateId - User ID of the candidate
 * @returns Array of access logs
 */
export async function getCandidateAccessLogs(candidateId: string) {
  return prisma.candidateAccessLog.findMany({
    where: { candidateId },
    include: {
      Company: {
        select: {
          name: true,
        },
      },
      Accessor: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Get access logs for a company
 * Useful for internal auditing
 *
 * @param companyId - Company ID
 * @param options - Filter and pagination options
 */
export async function getCompanyAccessLogs(
  companyId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    action?: AccessAction;
    limit?: number;
  },
) {
  return prisma.candidateAccessLog.findMany({
    where: {
      companyId,
      ...(options?.startDate && { createdAt: { gte: options.startDate } }),
      ...(options?.endDate && { createdAt: { lte: options.endDate } }),
      ...(options?.action && { actionType: options.action }),
    },
    include: {
      Accessor: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: options?.limit || 100,
  });
}

/**
 * Delete access logs older than retention period
 * Run this as a cron job for GDPR compliance
 *
 * @param retentionDays - Number of days to retain logs (default: 90)
 */
export async function cleanupOldAccessLogs(
  retentionDays: number = 90,
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const result = await prisma.candidateAccessLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  console.log(
    `Deleted ${result.count} access logs older than ${retentionDays} days`,
  );
  return result.count;
}
