/*
  Warnings:

  - You are about to drop the column `metadata` on the `Embedding` table. All the data in the column will be lost.
  - Changed the type of `vector` on the `Embedding` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Embedding" DROP COLUMN "metadata",
DROP COLUMN "vector",
ADD COLUMN     "vector" vector(768) NOT NULL;
