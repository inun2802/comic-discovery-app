-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "isFirstAppearance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isKeyIssue" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isMajorCrossover" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "universe" TEXT;
