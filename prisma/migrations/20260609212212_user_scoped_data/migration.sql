/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `AppSettings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,cnpj]` on the table `Empresa` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,cnpj]` on the table `Hospital` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `AppSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Empresa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Hospital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `NotaFiscal` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Empresa_cnpj_key";

-- DropIndex
DROP INDEX "Hospital_cnpj_key";

-- AlterTable
ALTER TABLE "AppSettings" ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Hospital" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "NotaFiscal" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AppSettings_userId_key" ON "AppSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_userId_cnpj_key" ON "Empresa"("userId", "cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_userId_cnpj_key" ON "Hospital"("userId", "cnpj");

-- AddForeignKey
ALTER TABLE "Hospital" ADD CONSTRAINT "Hospital_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppSettings" ADD CONSTRAINT "AppSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaFiscal" ADD CONSTRAINT "NotaFiscal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
