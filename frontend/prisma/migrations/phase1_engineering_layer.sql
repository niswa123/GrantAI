-- GrantAI Phase 1 Migration: Engineering Layer (Idempotent version)
-- Safe to run multiple times. Uses DO blocks to skip existing constraints.
-- Run in: https://supabase.com/dashboard/project/fhvxqaurwuvlqtqtmvwu/sql/new

-- ──────────────────────────────────────────────
-- 1. INTEGRATIONS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "integrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "provider" VARCHAR NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "config" JSONB,
    "status" VARCHAR NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "integrations_company_id_provider_key"
    ON "integrations"("company_id", "provider");

DO $$ BEGIN
    ALTER TABLE "integrations"
        ADD CONSTRAINT "integrations_company_id_fkey"
        FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ──────────────────────────────────────────────
-- 2. ENGINEERING EVENTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "engineering_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
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

CREATE UNIQUE INDEX IF NOT EXISTS "engineering_events_integration_id_source_id_key"
    ON "engineering_events"("integration_id", "source_id");

DO $$ BEGIN
    ALTER TABLE "engineering_events"
        ADD CONSTRAINT "engineering_events_company_id_fkey"
        FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "engineering_events"
        ADD CONSTRAINT "engineering_events_integration_id_fkey"
        FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ──────────────────────────────────────────────
-- 3. ANALYZED LOGS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "analyzed_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "is_rd" BOOLEAN NOT NULL DEFAULT false,
    "confidence_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "complexity_weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "justification" TEXT,
    "calculated_value" DECIMAL NOT NULL DEFAULT 0,
    "model_used" VARCHAR,
    "user_override" BOOLEAN,
    "override_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analyzed_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "analyzed_logs_event_id_key"
    ON "analyzed_logs"("event_id");

DO $$ BEGIN
    ALTER TABLE "analyzed_logs"
        ADD CONSTRAINT "analyzed_logs_event_id_fkey"
        FOREIGN KEY ("event_id") REFERENCES "engineering_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "analyzed_logs"
        ADD CONSTRAINT "analyzed_logs_company_id_fkey"
        FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ──────────────────────────────────────────────
-- 4. DAILY VALUE MAP
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "daily_value_maps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "total_events" INTEGER NOT NULL DEFAULT 0,
    "rd_events" INTEGER NOT NULL DEFAULT 0,
    "total_value" DECIMAL NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "daily_value_maps_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "daily_value_maps_company_id_date_key"
    ON "daily_value_maps"("company_id", "date");

DO $$ BEGIN
    ALTER TABLE "daily_value_maps"
        ADD CONSTRAINT "daily_value_maps_company_id_fkey"
        FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
