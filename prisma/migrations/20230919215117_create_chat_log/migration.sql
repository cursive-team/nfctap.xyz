-- CreateTable
CREATE TABLE "ChatLog" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "sigmoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatLog_pkey" PRIMARY KEY ("id")
);
