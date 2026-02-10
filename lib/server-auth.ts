import { authOptions } from "@/lib/auth";
import { TeamRole } from "@/lib/generated/prisma/enums";
import {
  getRecruiterContext,
  getPlatformAdminContext,
  RECRUITER_ROLES,
  PlatformAdminContext,
  RecruiterContext,
} from "@/lib/security";
import { getServerSession } from "next-auth";

type RecruiterAccessSuccess = {
  authorized: true;
  userId: string;
  access: RecruiterContext;
};

type RecruiterAccessFailure = {
  authorized: false;
  status: 401 | 403;
  error: string;
};

export type RecruiterAccessResult =
  | RecruiterAccessSuccess
  | RecruiterAccessFailure;

type PlatformAdminAccessSuccess = {
  authorized: true;
  userId: string;
  access: PlatformAdminContext;
};

type PlatformAdminAccessFailure = {
  authorized: false;
  status: 401 | 403;
  error: string;
};

export type PlatformAdminAccessResult =
  | PlatformAdminAccessSuccess
  | PlatformAdminAccessFailure;

export async function requireRecruiterAccess(options?: {
  companyId?: string;
  allowedMemberRoles?: TeamRole[];
}): Promise<RecruiterAccessResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { authorized: false, status: 401, error: "Unauthorized" };
  }

  const access = await getRecruiterContext(session.user.id, {
    companyId: options?.companyId,
    allowedMemberRoles: options?.allowedMemberRoles ?? RECRUITER_ROLES,
  });

  if (!access.authorized) {
    return {
      authorized: false,
      status: 403,
      error: access.error,
    };
  }

  return {
    authorized: true,
    userId: session.user.id,
    access,
  };
}

export async function requirePlatformAdmin(): Promise<PlatformAdminAccessResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { authorized: false, status: 401, error: "Unauthorized" };
  }

  const access = await getPlatformAdminContext(session.user.id);

  if (!access.authorized) {
    return {
      authorized: false,
      status: 403,
      error: access.error,
    };
  }

  return {
    authorized: true,
    userId: session.user.id,
    access,
  };
}
