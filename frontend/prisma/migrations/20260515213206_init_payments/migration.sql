/*
  Warnings:

  - You are about to drop the column `estimated_amount` on the `claims` table. All the data in the column will be lost.
  - You are about to drop the column `generated_text` on the `claims` table. All the data in the column will be lost.
  - You are about to drop the column `rd_expenses_total` on the `claims` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `invited_by` on the `company_members` table. All the data in the column will be lost.
  - You are about to drop the column `joined_at` on the `company_members` table. All the data in the column will be lost.
  - The `role` column on the `company_members` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `metadata` on the `integrations` table. All the data in the column will be lost.
  - You are about to drop the column `token_expires_at` on the `integrations` table. All the data in the column will be lost.
  - You are about to drop the `activity_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `analysis_runs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `expenses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `projects` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `submissions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,company_id]` on the table `company_members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripe_customer_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripe_subscription_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `claims` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_dev_cost` to the `claims` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_salary_cost` to the `claims` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE', 'UNLIMITED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'NONE');

-- DropForeignKey
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_company_id_fkey";

-- DropForeignKey
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "analysis_runs" DROP CONSTRAINT "analysis_runs_company_id_fkey";

-- DropForeignKey
ALTER TABLE "company_members" DROP CONSTRAINT "company_members_invited_by_fkey";

-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_company_id_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_company_id_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_claim_id_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_company_id_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_submitted_by_fkey";

-- DropIndex
DROP INDEX "company_members_company_id_idx";

-- DropIndex
DROP INDEX "company_members_company_id_user_id_key";

-- DropIndex
DROP INDEX "company_members_user_id_idx";

-- DropIndex
DROP INDEX "integrations_company_id_idx";

-- AlterTable
ALTER TABLE "claims" DROP COLUMN "estimated_amount",
DROP COLUMN "generated_text",
DROP COLUMN "rd_expenses_total",
ADD COLUMN     "claim_text" TEXT,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "estimated_rd_amount" DECIMAL,
ADD COLUMN     "fy_year" VARCHAR NOT NULL DEFAULT '2024',
ADD COLUMN     "rd_score" DOUBLE PRECISION,
ADD COLUMN     "total_dev_cost" DECIMAL NOT NULL,
ADD COLUMN     "total_salary_cost" DECIMAL NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "company_id" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Draft';

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "industry",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" VARCHAR,
ADD COLUMN     "default_hourly_rate" DECIMAL NOT NULL DEFAULT 50.0,
ADD COLUMN     "registration_number" VARCHAR,
ADD COLUMN     "tax_credit_rate" DECIMAL NOT NULL DEFAULT 0.14,
ADD COLUMN     "vat_number" VARCHAR,
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "company_members" DROP COLUMN "invited_by",
DROP COLUMN "joined_at",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hourly_rate" DECIMAL,
ADD COLUMN     "status" VARCHAR NOT NULL DEFAULT 'Pending',
ALTER COLUMN "id" DROP DEFAULT,
DROP COLUMN "role",
ADD COLUMN     "role" VARCHAR NOT NULL DEFAULT 'Viewer';

-- AlterTable
ALTER TABLE "integrations" DROP COLUMN "metadata",
DROP COLUMN "token_expires_at",
ADD COLUMN     "config" JSONB,
ADD COLUMN     "status" VARCHAR NOT NULL DEFAULT 'active',
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "current_period_end" TIMESTAMP(3),
ADD COLUMN     "display_name" VARCHAR,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "stripe_customer_id" VARCHAR,
ADD COLUMN     "stripe_subscription_id" VARCHAR,
ADD COLUMN     "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "subscription_tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "password_hash" DROP NOT NULL;

-- DropTable
DROP TABLE "activity_logs";

-- DropTable
DROP TABLE "analysis_runs";

-- DropTable
DROP TABLE "expenses";

-- DropTable
DROP TABLE "projects";

-- DropTable
DROP TABLE "submissions";

-- DropEnum
DROP TYPE "ActivityType";

-- DropEnum
DROP TYPE "CompanyRole";

-- DropEnum
DROP TYPE "SubmissionFormat";

-- DropEnum
DROP TYPE "SubmissionStatus";

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "claim_id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engineering_events" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "integration_id" UUID,
    "event_type" VARCHAR NOT NULL,
    "source_id" VARCHAR NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "author_email" VARCHAR,
    "event_timestamp" TIMESTAMP(3) NOT NULL,
    "raw_payload" JSONB,
    "status" VARCHAR NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engineering_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyzed_logs" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "is_rd" BOOLEAN NOT NULL DEFAULT false,
    "confidence_score" DOUBLE PRECISION NOT NULL,
    "complexity_weight" DOUBLE PRECISION NOT NULL,
    "justification" TEXT,
    "calculated_value" DECIMAL NOT NULL DEFAULT 0,
    "model_used" VARCHAR,
    "user_override" BOOLEAN,
    "override_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analyzed_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_value_maps" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "total_events" INTEGER NOT NULL DEFAULT 0,
    "rd_events" INTEGER NOT NULL DEFAULT 0,
    "total_value" DECIMAL NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_value_maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" VARCHAR NOT NULL,
    "external_payment_id" VARCHAR NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" VARCHAR NOT NULL,
    "status" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "engineering_events_integration_id_source_id_key" ON "engineering_events"("integration_id", "source_id");

-- CreateIndex
CREATE UNIQUE INDEX "analyzed_logs_event_id_key" ON "analyzed_logs"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_value_maps_company_id_date_key" ON "daily_value_maps"("company_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "payments_external_payment_id_key" ON "payments"("external_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_members_user_id_company_id_key" ON "company_members"("user_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_subscription_id_key" ON "users"("stripe_subscription_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engineering_events" ADD CONSTRAINT "engineering_events_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engineering_events" ADD CONSTRAINT "engineering_events_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyzed_logs" ADD CONSTRAINT "analyzed_logs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "engineering_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyzed_logs" ADD CONSTRAINT "analyzed_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_value_maps" ADD CONSTRAINT "daily_value_maps_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
