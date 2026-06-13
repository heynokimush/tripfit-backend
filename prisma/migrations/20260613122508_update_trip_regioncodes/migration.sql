/*
  Warnings:

  - Changed the type of `regionCodes` on the `Trip` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "regionCodes",
ADD COLUMN     "regionCodes" JSONB NOT NULL;
