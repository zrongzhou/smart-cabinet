-- v265: 产品 SEO 关键词 + 产品级 FAQ 关联
-- 手写迁移，部署时通过 `prisma migrate deploy` 应用，无需本地数据库连接。

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "seoKeywords" JSONB;

ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "productId" TEXT;

CREATE INDEX IF NOT EXISTS "faqs_productId_idx" ON "faqs"("productId");

ALTER TABLE "faqs" ADD CONSTRAINT "faqs_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE;
