-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_DONATION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('WHATSAPP', 'TELEGRAM');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'NEW_DONATION',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "donationId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactList" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "type" "ContactType" NOT NULL DEFAULT 'WHATSAPP',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ContactList_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContactList" ADD CONSTRAINT "ContactList_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
