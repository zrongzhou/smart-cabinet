-- V8 Commerce migration: cart on users, payment fields on orders, payments table.
-- Generated to match prisma/schema.prisma (provider = postgresql).
-- Apply with: npx prisma migrate deploy   (requires a reachable DATABASE_URL)

-- 1) User.cart (JSON)
ALTER TABLE "users" ADD COLUMN "cart" JSONB;

-- 2) Order payment fields
ALTER TABLE "orders" ADD COLUMN "paymentMethod" TEXT;
ALTER TABLE "orders" ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid';
ALTER TABLE "orders" ADD COLUMN "transactionId" TEXT;
ALTER TABLE "orders" ADD COLUMN "paidAt" TIMESTAMP(3);

-- 3) Payments table
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'created',
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "transactionId" TEXT,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payments_method_transactionId_key" ON "payments" ("method", "transactionId");
CREATE INDEX "payments_orderId_idx" ON "payments" ("orderId");

ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
