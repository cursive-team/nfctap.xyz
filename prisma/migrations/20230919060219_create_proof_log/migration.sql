-- CreateTable
CREATE TABLE "ProofLog" (
    "id" SERIAL NOT NULL,
    "pseudonym" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "provingTime" INTEGER NOT NULL,
    "proofCount" INTEGER NOT NULL,
    "proofType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProofLog_pkey" PRIMARY KEY ("id")
);
