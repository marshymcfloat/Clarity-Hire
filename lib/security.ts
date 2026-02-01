import { prisma } from "@/prisma/prisma";
import { TeamRole } from "@prisma/client";

/**
 * Verifies that a user has a valid, active membership in a company with the required role.
 * This is crucial for preventing "stale session" attacks where a fired employee
 * still has a valid JWT session.
 */
// Granular Role Definitions
export const JOB_MANAGEMENT_ROLES: TeamRole[] = [
  "ADMIN",
  "RECRUITER",
  "HIRING_MANAGER",
];

export const COMPANY_ADMIN_ROLES: TeamRole[] = ["ADMIN"];

/**
 * Verifies that a user has a valid, active membership in a company with the required role.
 * This is crucial for preventing "stale session" attacks where a fired employee
 * still has a valid JWT session.
 */
export async function verifyCompanyAccess(
  userId: string,
  companySlug: string,
  requiredRoles: TeamRole[] = JOB_MANAGEMENT_ROLES,
) {
  const membership = await prisma.companyMember.findFirst({
    where: {
      userId,
      company: {
        slug: companySlug,
      },
      role: {
        in: requiredRoles,
      },
    },
    include: {
      company: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
  });

  if (!membership) {
    return {
      authorized: false,
      error: "You do not have permission to perform this action.",
    };
  }

  return {
    authorized: true,
    membership,
    company: membership.company,
  };
}

// Simple In-Memory Rate Limiter (Token Bucket)
// Note: In production serverless environments (Vercel), use Redis (Upstash).
// This is a "good enough" implementation for single-instance deployments.
const rateLimits = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60,
): boolean {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = rateLimits.get(identifier);

  // Clean up expired
  if (record && now > record.expiresAt) {
    rateLimits.delete(identifier);
  }

  const currentReference = rateLimits.get(identifier);

  if (!currentReference) {
    rateLimits.set(identifier, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (currentReference.count >= limit) {
    return false;
  }

  currentReference.count++;
  return true;
}
