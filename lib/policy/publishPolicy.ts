import { BillingStatus, JobStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/prisma/prisma";

export type PublishPolicyCode =
  | "COMPANY_NOT_FOUND"
  | "COMPANY_SUSPENDED"
  | "COMPANY_NOT_VERIFIED"
  | "BILLING_NOT_ENTITLED"
  | "ACTIVE_JOB_LIMIT_REACHED"
  | "ALLOWED";

export type PublishPolicyResult = {
  allowed: boolean;
  code: PublishPolicyCode;
  message: string;
  context?: {
    plan: string;
    billingStatus: BillingStatus;
    publishedJobCount?: number;
    activePublishedJobsLimit?: number | null;
  };
};

const BILLING_ACTIVE_STATUSES = new Set<BillingStatus>(["TRIALING", "ACTIVE"]);
const BILLING_BLOCKED_STATUSES = new Set<BillingStatus>([
  "PAST_DUE",
  "UNPAID",
  "CANCELED",
  "PAUSED",
]);

const PLAN_DEFAULT_LIMITS: Record<string, number | null> = {
  free: 1,
  starter: 3,
  pro: 20,
  enterprise: null,
};

function normalizePlan(plan: string | null | undefined): string {
  const value = (plan || "free").trim().toLowerCase();
  return value.length > 0 ? value : "free";
}

function defaultLimitForPlan(plan: string): number | null {
  return PLAN_DEFAULT_LIMITS[plan] ?? PLAN_DEFAULT_LIMITS.free;
}

function requiresPaidBilling(plan: string) {
  return plan !== "free";
}

export async function canPublishForCompany(params: {
  companyId: string;
  excludeJobId?: string;
  targetStatus?: JobStatus;
}): Promise<PublishPolicyResult> {
  if (params.targetStatus && params.targetStatus !== "PUBLISHED") {
    return {
      allowed: true,
      code: "ALLOWED",
      message: "Policy check skipped for non-publish transition.",
    };
  }

  const company = await prisma.company.findUnique({
    where: { id: params.companyId },
    select: {
      id: true,
      plan: true,
      verificationStatus: true,
      suspendedAt: true,
      billingStatus: true,
      activePublishedJobsLimit: true,
    },
  });

  if (!company) {
    return {
      allowed: false,
      code: "COMPANY_NOT_FOUND",
      message: "Company not found.",
    };
  }

  const normalizedPlan = normalizePlan(company.plan);

  if (company.suspendedAt) {
    return {
      allowed: false,
      code: "COMPANY_SUSPENDED",
      message: "Company is suspended and cannot publish jobs.",
      context: {
        plan: normalizedPlan,
        billingStatus: company.billingStatus,
      },
    };
  }

  if (company.verificationStatus !== "VERIFIED") {
    return {
      allowed: false,
      code: "COMPANY_NOT_VERIFIED",
      message: "Company must be VERIFIED before publishing jobs.",
      context: {
        plan: normalizedPlan,
        billingStatus: company.billingStatus,
      },
    };
  }

  if (
    BILLING_BLOCKED_STATUSES.has(company.billingStatus) ||
    (requiresPaidBilling(normalizedPlan) &&
      !BILLING_ACTIVE_STATUSES.has(company.billingStatus))
  ) {
    return {
      allowed: false,
      code: "BILLING_NOT_ENTITLED",
      message: "Company billing is not entitled for publishing jobs.",
      context: {
        plan: normalizedPlan,
        billingStatus: company.billingStatus,
      },
    };
  }

  const limit = company.activePublishedJobsLimit ?? defaultLimitForPlan(normalizedPlan);
  if (limit != null) {
    const publishedJobCount = await prisma.job.count({
      where: {
        companyId: company.id,
        status: "PUBLISHED",
        ...(params.excludeJobId ? { id: { not: params.excludeJobId } } : {}),
      },
    });

    if (publishedJobCount >= limit) {
      return {
        allowed: false,
        code: "ACTIVE_JOB_LIMIT_REACHED",
        message:
          "Company reached its active published job limit. Upgrade plan or increase quota.",
        context: {
          plan: normalizedPlan,
          billingStatus: company.billingStatus,
          publishedJobCount,
          activePublishedJobsLimit: limit,
        },
      };
    }
  }

  return {
    allowed: true,
    code: "ALLOWED",
    message: "Company is eligible to publish this job.",
    context: {
      plan: normalizedPlan,
      billingStatus: company.billingStatus,
      activePublishedJobsLimit: limit,
    },
  };
}
