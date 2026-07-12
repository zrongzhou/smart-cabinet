-- V8.11: 博客级 FAQ 字段 (faq)
-- 手写迁移，部署时通过 `prisma migrate deploy` 应用，无需本地数据库连接。
-- 存储结构：[{ question: { zh, en, ar }, answer: { zh, en, ar } }]

ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "faq" JSONB;
