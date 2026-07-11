#!/usr/bin/env node
/**
 * import-product-updates.mjs — 用 Prisma Client 把 Excel 更新清单写入数据库。
 *
 * 数据源：scripts/product-updates.json（由 scripts/extract-product-updates.py
 *         从 Excel「产品标题+URL.xlsx / Product Title URL」解析生成）。
 *
 * 更新规则（与需求一致）：
 *   - 按 SKU 匹配产品（先精确匹配，未命中再大小写不敏感匹配）。
 *   - title 非空  -> 更新 name.en（保留 name.zh / name.ar）。
 *   - slug  非空  -> normalizeSlug 规范化后更新（与 getProductHref 生成的链接一致）；
 *                   若新 slug 与库中其它产品冲突则跳过 slug 更新并告警。
 *   - keywords 非空 -> 更新 seoKeywords.en（逗号分隔字符串；保留 seoKeywords.zh / .ar）。
 *
 * 运行方式（无需联网安装依赖，plain node 即可）：
 *   node scripts/import-product-updates.mjs
 *
 * 试跑（不写库，仅打印将要执行的变更）：
 *   DRY_RUN=1 node scripts/import-product-updates.mjs
 *
 * 说明：slug 规范化逻辑与 src/lib/slug.ts 的 normalizeSlug 保持一致，
 *       product-updates.json 中的 slug 已在解析阶段规范化，这里再规范化一次以兜底。
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPDATES_PATH = join(__dirname, 'product-updates.json');

const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

// ---------------------------------------------------------------------------
// slug 规范化（移植自 src/lib/slug.ts，保持一致）
// ---------------------------------------------------------------------------
function normalizeLeaf(leaf) {
  return (leaf || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.\-]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function normalizeSlug(raw) {
  const value = (raw || '').trim();
  if (!value) return '';
  const lastSlash = value.lastIndexOf('/');
  if (lastSlash >= 0) {
    const dir = value.slice(0, lastSlash + 1);
    const leaf = value.slice(lastSlash + 1);
    return `${dir}${normalizeLeaf(leaf)}`;
  }
  return normalizeLeaf(value);
}

function asStr(v) {
  if (v == null) return '';
  if (Array.isArray(v)) return v.filter((x) => x != null).map(String).join(', ');
  return String(v);
}

async function main() {
  const updates = JSON.parse(readFileSync(UPDATES_PATH, 'utf-8'));
  const prisma = new PrismaClient();

  let ok = 0;
  let skipped = 0;
  let notFound = 0;
  let errors = 0;

  console.log(`[import] 读取 ${updates.length} 条更新（DRY_RUN=${DRY_RUN}）`);

  for (const entry of updates) {
    const sku = (entry.sku || '').trim();
    if (!sku) {
      skipped++;
      continue;
    }
    try {
      // 1) 按 SKU 定位产品
      let product = await prisma.product.findFirst({ where: { sku } });
      if (!product) {
        product = await prisma.product.findFirst({
          where: { sku: { equals: sku, mode: 'insensitive' } },
        });
      }
      if (!product) {
        console.warn(`  ! SKU ${sku}: 在数据库中未找到，跳过`);
        notFound++;
        continue;
      }

      const data = {};

      // 2) 标题 -> name.en（保留 zh/ar）
      if (entry.title) {
        const name = product.name;
        if (name && typeof name === 'object') {
          data.name = { ...name, en: entry.title };
        } else {
          data.name = { en: entry.title, zh: asStr(name), ar: asStr(name) };
        }
      }

      // 3) slug -> 规范化后更新（冲突则跳过）
      if (entry.slug) {
        const ns = normalizeSlug(entry.slug);
        if (ns && ns !== product.slug) {
          const conflict = await prisma.product.findFirst({
            where: { slug: ns, NOT: { id: product.id } },
          });
          if (conflict) {
            console.warn(`  ! SKU ${sku}: 新 slug '${ns}' 与产品 ${conflict.id} 冲突，跳过 slug 更新`);
          } else {
            data.slug = ns;
          }
        }
      }

      // 4) keywords -> seoKeywords.en（保留 zh/ar）
      if (entry.keywords) {
        const kw = product.seoKeywords;
        let zh = '';
        let ar = '';
        if (kw && typeof kw === 'object') {
          zh = asStr(kw.zh);
          ar = asStr(kw.ar);
        } else if (typeof kw === 'string') {
          zh = kw;
        }
        data.seoKeywords = { en: entry.keywords, zh, ar };
      }

      if (Object.keys(data).length === 0) {
        console.log(`  - SKU ${sku}: 无变化，跳过`);
        skipped++;
        continue;
      }

      if (DRY_RUN) {
        console.log(`  ~ SKU ${sku}: DRY_RUN 将更新 ->`, JSON.stringify(data));
        ok++;
        continue;
      }

      await prisma.product.update({ where: { id: product.id }, data });
      console.log(`  ✓ SKU ${sku}: 已更新 [${Object.keys(data).join(', ')}]`);
      ok++;
    } catch (err) {
      errors++;
      console.error(`  ✗ SKU ${sku}: 更新失败 -> ${err.message}`);
    }
  }

  await prisma.$disconnect();

  console.log('\n[import] 完成统计:');
  console.log(`  成功/计划: ${ok}`);
  console.log(`  跳过(无变化/空SKU): ${skipped}`);
  console.log(`  未找到SKU: ${notFound}`);
  console.log(`  错误: ${errors}`);
  if (errors > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error('[import] 致命错误:', err);
  process.exit(1);
});
