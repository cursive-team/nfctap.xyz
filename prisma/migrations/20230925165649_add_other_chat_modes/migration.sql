-- AlterTable
ALTER TABLE "ChatLog" ADD COLUMN     "isCardholderChat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pseudonym" TEXT,
ALTER COLUMN "sigmoji" DROP NOT NULL;
