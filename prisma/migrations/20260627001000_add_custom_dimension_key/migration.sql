-- Migration: Add 'key' field to custom_dimensions table (v129)
-- Purpose: Store dimension type identifier (e.g., "robots") for category type labels

BEGIN;

-- Add unique key column for dimension type identification
ALTER TABLE "custom_dimensions"
  ADD COLUMN "key" TEXT NOT NULL DEFAULT '';

-- Populate key from existing data if possible (use id-based fallback)
UPDATE "custom_dimensions" SET "key" = "dim_" || "id" WHERE "key" = '' OR "key" IS NULL;

-- Add unique constraint
ALTER TABLE "custom_dimensions"
  ADD CONSTRAINT "custom_dimensions_key_unique" UNIQUE ("key");

-- Drop deprecated unit column (was for physical dimensions, not category types)
ALTER TABLE "custom_dimensions" DROP COLUMN IF EXISTS "unit";

-- Ensure index on key exists for fast lookups
CREATE INDEX IF NOT EXISTS "custom_dimensions_key_idx" ON "custom_dimensions"("key");

COMMIT;
