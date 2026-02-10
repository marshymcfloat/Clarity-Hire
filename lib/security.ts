import { prisma } from "@/prisma/prisma";
import { TeamRole, UserRole } from "@/lib/generated/prisma/enums";

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

export const RECRUITER_ROLES: TeamRole[] = [
  "ADMIN",
  "RECRUITER",
  "HIRING_MANAGER",
];

export const PLATFORM_ADMIN_ROLES: UserRole[] = [
  "PLATFORM_ADMIN",
  "OPS_REVIEWER",
];

export type RecruiterContext = {
  authorized: true;
  companyId: string;
  companySlug: string;
  companyName: string;
  role: TeamRole | "OWNER";
};

export type RecruiterContextDenied = {
  authorized: false;
  error: string;
};

export type PlatformAdminContext = {
  authorized: true;
  role: UserRole;
};

export type PlatformAdminContextDenied = {
  authorized: false;
  error: string;
};

/**
 * Resolve and verify recruiter access for a specific company (or the first valid one).
 * Owner access is always allowed for their own company.
 */
export async function getRecruiterContext(
  userId: string,
  options?: {
    companyId?: string;
    allowedMemberRoles?: TeamRole[];
  },
): Promise<RecruiterContext | RecruiterContextDenied> {
  const allowedMemberRoles = options?.allowedMemberRoles ?? RECRUITER_ROLES;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      Company: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
      CompanyMember: {
        select: {
          companyId: true,
          role: true,
          Company: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return { authorized: false, error: "User not found." };
  }

  const targetCompanyId = options?.companyId;

  // Company owner path
  if (user.Company) {
    if (!targetCompanyId || user.Company.id === targetCompanyId) {
      return {
        authorized: true,
        companyId: user.Company.id,
        companySlug: user.Company.slug,
        companyName: user.Company.name,
        role: "OWNER",
      };
    }
  }

  // Company member path
  const membership = targetCompanyId
    ? user.CompanyMember.find(
        (m) =>
          m.companyId === targetCompanyId && allowedMemberRoles.includes(m.role),
      )
    : user.CompanyMember.find((m) => allowedMemberRoles.includes(m.role));

  if (!membership) {
    return {
      authorized: false,
      error: "You do not have permission to perform this action.",
    };
  }

  return {
    authorized: true,
    companyId: membership.companyId,
    companySlug: membership.Company.slug,
    companyName: membership.Company.name,
    role: membership.role,
  };
}

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
      Company: {
        slug: companySlug,
      },
      role: {
        in: requiredRoles,
      },
    },
    include: {
      Company: {
        select: {
          id: true,
          slug: true,
          name: true,
          verificationStatus: true,
          suspendedAt: true,
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
    company: membership.Company,
  };
}

export async function getPlatformAdminContext(
  userId: string,
): Promise<PlatformAdminContext | PlatformAdminContextDenied> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    return { authorized: false, error: "User not found." };
  }

  if (!PLATFORM_ADMIN_ROLES.includes(user.role)) {
    return {
      authorized: false,
      error: "You do not have platform admin permission.",
    };
  }

  return {
    authorized: true,
    role: user.role,
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
