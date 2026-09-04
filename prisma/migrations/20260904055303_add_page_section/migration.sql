-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('NOT_STARTED', 'ACTIVE', 'FINISHED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GalleryType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('BANK_TRANSFER', 'QRIS');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'ACCEPTED_BY_REVISION', 'REJECTED');

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'ACTIVE',
    "startAt" TIMESTAMPTZ(3) NOT NULL,
    "endAt" TIMESTAMPTZ(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetDonationAmount" DOUBLE PRECISION NOT NULL,
    "sponsorCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_sections" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "heroBgImage" TEXT,
    "heroTagline" TEXT,
    "heroTitle" TEXT,
    "heroDescription" TEXT,
    "whyHomeDescription" TEXT,
    "supportWorkTagline" TEXT,
    "supportWorkDescription" TEXT,
    "ctaSectionBgImage" TEXT,
    "ctaSectionTagline" TEXT,
    "ctaSectionTitle" TEXT,
    "ctaSectionSubtitle" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "why_sections" (
    "id" TEXT NOT NULL,
    "homePageSectionId" TEXT NOT NULL,
    "icon" TEXT,
    "title" TEXT NOT NULL,
    "subTitle" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "why_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_work_sections" (
    "id" TEXT NOT NULL,
    "homePageSectionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "icon" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tagline" TEXT,
    "focus" TEXT[],
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "support_work_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_us_sections" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "heroBgImage" TEXT,
    "heroTagline" TEXT,
    "heroTitle" TEXT,
    "heroDescription" TEXT,
    "vision" TEXT,
    "mission" TEXT[],
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "about_us_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_tim" (
    "id" TEXT NOT NULL,
    "aboutUsSectionId" TEXT NOT NULL,
    "image" TEXT,
    "name" TEXT NOT NULL,
    "position" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "campaign_tim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_structure_divisions" (
    "id" TEXT NOT NULL,
    "aboutUsSectionId" TEXT NOT NULL,
    "divisionName" TEXT NOT NULL,
    "divisionJobDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "work_structure_divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_proposals" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "proposalPdfUrl" TEXT,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "campaign_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "galleries" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "galleryType" "GalleryType" NOT NULL DEFAULT 'IMAGE',
    "imageUrl" TEXT NOT NULL,
    "videoUrl" TEXT,
    "title" TEXT,
    "description" TEXT,
    "timeStamp" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "galleries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL DEFAULT 'BANK_TRANSFER',
    "qrisImage" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "donorName" TEXT NOT NULL DEFAULT 'Anonymous',
    "amount" DOUBLE PRECISION NOT NULL,
    "acceptedAmount" DOUBLE PRECISION,
    "proofOfPaymentUrl" TEXT,
    "message" TEXT,
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_sections_campaignId_key" ON "page_sections"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "support_work_sections_homePageSectionId_order_key" ON "support_work_sections"("homePageSectionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "about_us_sections_campaignId_key" ON "about_us_sections"("campaignId");

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "why_sections" ADD CONSTRAINT "why_sections_homePageSectionId_fkey" FOREIGN KEY ("homePageSectionId") REFERENCES "page_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_work_sections" ADD CONSTRAINT "support_work_sections_homePageSectionId_fkey" FOREIGN KEY ("homePageSectionId") REFERENCES "page_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "about_us_sections" ADD CONSTRAINT "about_us_sections_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_tim" ADD CONSTRAINT "campaign_tim_aboutUsSectionId_fkey" FOREIGN KEY ("aboutUsSectionId") REFERENCES "about_us_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_structure_divisions" ADD CONSTRAINT "work_structure_divisions_aboutUsSectionId_fkey" FOREIGN KEY ("aboutUsSectionId") REFERENCES "about_us_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_proposals" ADD CONSTRAINT "campaign_proposals_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
