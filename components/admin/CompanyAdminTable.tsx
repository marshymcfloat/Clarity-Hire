"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  rejectCompanyAction,
  suspendCompanyAction,
  unsuspendCompanyAction,
  updateCompanyEntitlementsAction,
  verifyCompanyAction,
} from "@/lib/actions/admin/companyAdminActions";

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  verificationStatus:
    | "UNVERIFIED"
    | "PENDING"
    | "VERIFIED"
    | "REJECTED"
    | "SUSPENDED";
  plan: string;
  billingStatus:
    | "NONE"
    | "TRIALING"
    | "ACTIVE"
    | "PAST_DUE"
    | "UNPAID"
    | "CANCELED"
    | "PAUSED";
  activePublishedJobsLimit: number | null;
  ownerEmail: string;
  verificationRequestedAt: Date | null;
  verifiedAt: Date | null;
};

export default function CompanyAdminTable({
  companies,
}: {
  companies: CompanyRow[];
}) {
  const [isPending, startTransition] = useTransition();

  const runAction = (
    action: (companyId: string, reason?: string) => Promise<{
      success: boolean;
      error?: string;
      message?: string;
    }>,
    companyId: string,
    promptMessage: string,
  ) => {
    const reason = window.prompt(promptMessage);
    if (reason === null) {
      return;
    }

    startTransition(async () => {
      const result = await action(companyId, reason || undefined);
      if (!result.success) {
        toast.error(result.error || "Action failed.");
        return;
      }
      toast.success(result.message || "Action completed.");
    });
  };

  const runEntitlementsAction = (company: CompanyRow) => {
    const planInput = window.prompt(
      "Set plan (free/starter/pro/enterprise):",
      company.plan,
    );
    if (planInput === null) {
      return;
    }

    const billingInput = window.prompt(
      "Set billing status (NONE/TRIALING/ACTIVE/PAST_DUE/UNPAID/CANCELED/PAUSED):",
      company.billingStatus,
    );
    if (billingInput === null) {
      return;
    }

    const limitInput = window.prompt(
      "Set active published jobs limit (blank for unlimited):",
      company.activePublishedJobsLimit != null
        ? String(company.activePublishedJobsLimit)
        : "",
    );
    if (limitInput === null) {
      return;
    }

    const normalizedBilling = billingInput.trim().toUpperCase();
    const parsedLimit =
      limitInput.trim() === "" ? null : Number.parseInt(limitInput, 10);

    startTransition(async () => {
      const result = await updateCompanyEntitlementsAction({
        companyId: company.id,
        plan: planInput,
        billingStatus: normalizedBilling as CompanyRow["billingStatus"],
        activePublishedJobsLimit:
          limitInput.trim() === ""
            ? null
            : Number.isNaN(parsedLimit)
              ? -1
              : parsedLimit,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to update company entitlements.");
        return;
      }

      toast.success(result.message || "Company entitlements updated.");
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left">
          <tr>
            <th className="px-4 py-3 font-semibold">Company</th>
            <th className="px-4 py-3 font-semibold">Owner Email</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Plan</th>
            <th className="px-4 py-3 font-semibold">Billing</th>
            <th className="px-4 py-3 font-semibold">Limit</th>
            <th className="px-4 py-3 font-semibold">Requested</th>
            <th className="px-4 py-3 font-semibold">Verified</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id} className="border-t">
              <td className="px-4 py-3">
                <p className="font-medium">{company.name}</p>
                <p className="text-xs text-slate-500">/{company.slug}</p>
              </td>
              <td className="px-4 py-3">{company.ownerEmail}</td>
              <td className="px-4 py-3">{company.verificationStatus}</td>
              <td className="px-4 py-3">{company.plan}</td>
              <td className="px-4 py-3">{company.billingStatus}</td>
              <td className="px-4 py-3">
                {company.activePublishedJobsLimit ?? "Unlimited"}
              </td>
              <td className="px-4 py-3">
                {company.verificationRequestedAt
                  ? new Date(company.verificationRequestedAt).toLocaleString()
                  : "-"}
              </td>
              <td className="px-4 py-3">
                {company.verifiedAt
                  ? new Date(company.verifiedAt).toLocaleString()
                  : "-"}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => runEntitlementsAction(company)}
                  >
                    Entitlements
                  </Button>

                  {company.verificationStatus !== "VERIFIED" &&
                    company.verificationStatus !== "SUSPENDED" && (
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() =>
                          runAction(
                            verifyCompanyAction,
                            company.id,
                            "Reason for verifying this company (optional):",
                          )
                        }
                      >
                        Verify
                      </Button>
                    )}

                  {company.verificationStatus === "PENDING" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isPending}
                      onClick={() =>
                        runAction(
                          rejectCompanyAction,
                          company.id,
                          "Reason for rejecting this company:",
                        )
                      }
                    >
                      Reject
                    </Button>
                  )}

                  {company.verificationStatus !== "SUSPENDED" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isPending}
                      onClick={() =>
                        runAction(
                          suspendCompanyAction,
                          company.id,
                          "Reason for suspending this company:",
                        )
                      }
                    >
                      Suspend
                    </Button>
                  )}

                  {company.verificationStatus === "SUSPENDED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() =>
                        runAction(
                          unsuspendCompanyAction,
                          company.id,
                          "Reason for unsuspending this company (optional):",
                        )
                      }
                    >
                      Unsuspend
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
