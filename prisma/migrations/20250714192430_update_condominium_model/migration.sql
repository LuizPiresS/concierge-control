/*
  Warnings:

  - You are about to drop the column `address` on the `condominiums` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `condominiums` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[state_registration]` on the table `condominiums` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[municipal_registration]` on the table `condominiums` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `city` to the `condominiums` table without a default value. This is not possible if the table is not empty.
  - Added the required column `neighborhood` to the `condominiums` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `condominiums` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `condominiums` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `condominiums` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zip_code` to the `condominiums` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "condominiums" DROP COLUMN "address",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "complement" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "municipal_registration" TEXT,
ADD COLUMN     "neighborhood" TEXT NOT NULL,
ADD COLUMN     "number" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "state_registration" TEXT,
ADD COLUMN     "street" TEXT NOT NULL,
ADD COLUMN     "zip_code" TEXT NOT NULL,
ALTER COLUMN "isActive" SET DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "condominiums_email_key" ON "condominiums"("email");

-- CreateIndex
CREATE UNIQUE INDEX "condominiums_state_registration_key" ON "condominiums"("state_registration");

-- CreateIndex
CREATE UNIQUE INDEX "condominiums_municipal_registration_key" ON "condominiums"("municipal_registration");
