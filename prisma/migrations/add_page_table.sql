-- Prisma migration SQL for creating the Page table
-- Run this on the production database

-- Create the Page table
CREATE TABLE IF NOT EXISTS "pages" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL,
  "title" JSONB NOT NULL,
  "blocks" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS "pages_slug_key" ON "pages"("slug");

-- Enable row-level security (optional, uncomment if needed)
-- ALTER TABLE "pages" ENABLE ROW LEVEL SECURITY;
