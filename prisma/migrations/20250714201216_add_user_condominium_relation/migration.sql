/*
  Warnings:

  - Added the required column `condominiumId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "condominiumId" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "users_condominiumId_idx" ON "users"("condominiumId");
