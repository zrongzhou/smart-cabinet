/**
 * seed-product-specs.ts (V8.6)
 * 将文档规格参数表（scripts/import/source/product_specs.json，源自《26 篇产品规格.docx》）
 * 写入 PostgreSQL/Prisma 的 Product.specs 列。
 *
 * 设计原则（最小改动 / 非破坏性）：
 *   - 只更新 Product.specs 与 Product.specifications 两个字段（specifications 由 specs 派生，保持单一数据源），
 *     绝不触碰 name/description/translations/faq 等其它列，因此可安全重复执行，不会覆盖既有翻译或多语言内容。
 *   - 匹配方式：用 spec.appUrl 套用与 seed-products.ts 完全一致的 toSlug 逻辑得到 DB slug，
 *     再按 product.slug 精确匹配；若未命中，则回退按 product.name(en) === spec.appTitle 匹配。
 *
 * 数据形态：specs 存为结构化数组 [{ param: string, value: string }]，便于详情页 <table> 渲染。
 * 兼容文档里偶发的表头伪行（["Item","Specification"]）自动剔除。
 *
 * 用法：
 *   npx ts-node --compiler-options {"module":"CommonJS"} scripts/import/seed-product-specs.ts            # 真实写入
 *   npx ts-node --compiler-options {"module":"CommonJS"} scripts/import/seed-product-specs.ts --dry-run   # 仅解析+匹配校验，不连库
 * 说明：每次执行会同步写 Product.specs（结构化数组）与 Product.specifications（由 specs 派生的扁平对象
 *      {参数名: 值}），二者始终保持一致，重跑即可修复/刷新 specifications，避免旧套版数据被重新引入。
 *
 * 前置：本库由 `prisma db push` 建立（无 migrations 表）。执行本脚本前请确保已执行
 *   npx prisma db push   # 为 Product 增加 specs 列（可空，不破坏现有数据）
 */
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const SCRIPT_DIR = __dirname;
const SOURCE_DIR = path.resolve(SCRIPT_DIR, 'source');
const SPECS_FILE = path.resolve(SOURCE_DIR, 'product_specs.json');

const isDryRun = process.argv.includes('--dry-run');

/** 与 seed-products.ts 完全一致的 slug 规则：去掉前导 /，再去掉 /products/ 前缀，保留 .html。 */
function toSlug(url: string): string {
  return url.replace(/^\/+/, '').replace(/^products\//i, '');
}

interface SpecRow {
  param: string;
  value: string;
}

/** 将文档二维数组 [[param, value], ...] 归一为 [{ param, value }]，并剔除表头伪行。 */
function normalizeSpecs(raw: unknown): SpecRow[] {
  if (!Array.isArray(raw)) return [];
  const rows: SpecRow[] = [];
  for (const item of raw) {
    if (Array.isArray(item) && item.length >= 2) {
      const param = String(item[0] ?? '').trim();
      const value = String(item[1] ?? '').trim();
      if (!param && !value) continue;
      // 剔除文档里偶发的表头伪行（如 ["Item","Specification"]）
      if (param.toLowerCase() === 'item' && value.toLowerCase() === 'specification') continue;
      rows.push({ param, value });
    } else if (item && typeof item === 'object' && 'param' in item && 'value' in item) {
      const param = String((item as any).param ?? '').trim();
      const value = String((item as any).value ?? '').trim();
      if (!param && !value) continue;
      rows.push({ param, value });
    }
  }
  return rows;
}

interface SpecSource {
  docName: string;
  appTitle: string;
  appUrl: string;
  appSlug: string;
  specs: unknown;
}

async function main(): Promise<void> {
  if (!fs.existsSync(SPECS_FILE)) {
    console.error(`[seed-specs] 找不到规格数据文件：${SPECS_FILE}`);
    process.exitCode = 1;
    return;
  }

  const raw = JSON.parse(fs.readFileSync(SPECS_FILE, 'utf-8')) as SpecSource[];
  console.log(`[seed-specs] 读取到 ${raw.length} 条产品规格`);

  // 预解析：每条规格 -> 候选 slug + 归一化 rows
  const parsed = raw.map((s) => {
    const candidateSlug = toSlug(s.appUrl);
    const rows = normalizeSpecs(s.specs);
    return {
      appTitle: s.appTitle || s.docName || '',
      candidateSlug,
      rows,
      rowCount: rows.length,
    };
  });

  if (isDryRun) {
    console.log('\n[dry-run] 仅校验解析与匹配，不连接数据库。');
    for (const p of parsed) {
      console.log(`  · ${p.appTitle}  -> slug="${p.candidateSlug}"  specs=${p.rowCount} 行`);
    }
    console.log(`[dry-run] 完成。共 ${parsed.length} 条，规格行合计 ${parsed.reduce((s, p) => s + p.rowCount, 0)} 行。`);
    return;
  }

  const prisma = new PrismaClient();
  let matched = 0;
  let written = 0;
  let skipped = 0;
  const unmatched: string[] = [];

  try {
    for (const p of parsed) {
      if (p.rowCount === 0) {
        skipped += 1;
        continue;
      }
      // 1) 按 slug 精确匹配
      let product = await prisma.product.findFirst({ where: { slug: p.candidateSlug } });
      // 2) 回退：按 name(en) === appTitle 匹配
      if (!product) {
        const byTitle = await prisma.product.findFirst({
          where: { name: { path: ['en'], equals: p.appTitle } },
        });
        product = byTitle;
      }

      if (!product) {
        unmatched.push(`${p.appTitle} (slug=${p.candidateSlug})`);
        skipped += 1;
        continue;
      }

      await prisma.product.update({
        where: { id: product.id },
        data: {
          specs: p.rows as any,
          // specifications 由 specs 派生：把 [{param,value}] 转成扁平对象 {参数名: 值}，与 specs 保持一致
          specifications: p.rows.reduce<Record<string, string>>((acc, row) => {
            acc[row.param] = row.value;
            return acc;
          }, {}),
        },
      });
      matched += 1;
      written += 1;
    }

    console.log(`\n[seed-specs] 完成：匹配 ${matched} 个产品，写入 specs ${written} 条，跳过 ${skipped} 条。`);
    if (unmatched.length > 0) {
      console.warn('[seed-specs] 以下产品未匹配到 DB 记录（请检查 appUrl/slug 或 name.en）：');
      unmatched.forEach((u) => console.warn(`   - ${u}`));
    }
  } catch (err) {
    console.error('[seed-specs] 写入失败：', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[seed-specs] 未预期错误：', err);
  process.exit(1);
});
