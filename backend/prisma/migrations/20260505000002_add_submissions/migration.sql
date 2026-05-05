-- CreateEnum for submission status
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'UNDER_REVIEW');

-- CreateEnum for submission format
CREATE TYPE "SubmissionFormat" AS ENUM ('PDF', 'XML', 'JSON', 'CSV', 'GOVERNMENT_PORTAL');

-- CreateTable for submissions
CREATE TABLE "submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "claim_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "country" VARCHAR NOT NULL,
    "format" "SubmissionFormat" NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "reference_number" VARCHAR,
    "submitted_at" TIMESTAMP(3),
    "submitted_by" UUID,
    "file_path" TEXT,
    "file_url" TEXT,
    "metadata" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "submissions_claim_id_idx" ON "submissions"("claim_id");
CREATE INDEX "submissions_company_id_idx" ON "submissions"("company_id");
CREATE INDEX "submissions_status_idx" ON "submissions"("status");
CREATE INDEX "submissions_country_idx" ON "submissions"("country");

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
