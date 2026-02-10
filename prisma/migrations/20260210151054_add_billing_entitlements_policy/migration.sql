-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('NONE', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'UNPAID', 'CANCELED', 'PAUSED');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "activePublishedJobsLimit" INTEGER,
ADD COLUMN     "billingStatus" "BillingStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "subscriptionCurrentPeriodEnd" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Company_billingStatus_idx" ON "Company"("billingStatus");
