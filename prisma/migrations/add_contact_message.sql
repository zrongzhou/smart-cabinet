-- Prisma Migration for ContactMessage model
-- Run this SQL in your PostgreSQL database if you cannot run `npx prisma migrate dev`

CREATE TABLE IF NOT EXISTS "contact_messages" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(255),
  "subject" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "locale" VARCHAR(255) NOT NULL DEFAULT 'en',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "contact_messages_createdAt_idx" ON "contact_messages"("createdAt");
CREATE INDEX IF NOT EXISTS "contact_messages_isRead_idx" ON "contact_messages"("isRead");

-- Update the _prisma_migrations table to mark this migration as applied
-- (Only needed if you want to mark it as applied in Prisma)
