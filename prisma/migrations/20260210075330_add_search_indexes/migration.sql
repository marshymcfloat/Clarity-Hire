-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AccessAction" ADD VALUE 'SEARCH';
ALTER TYPE "AccessAction" ADD VALUE 'DOWNLOAD_RESUME';
ALTER TYPE "AccessAction" ADD VALUE 'GENERATE_MATCH_REPORT';

-- CreateIndex
CREATE INDEX "DocumentChunk_parsedDocId_idx" ON "DocumentChunk"("parsedDocId");
