/**
 * seed-keywords.ts — 批量回填 seoKeywords（产品 + 博客）。
 *
 * 数据来源：同目录下的 keyword-seeds.json（含 products[26]、blogs[10]）。
 *
 * 行为：
 *  - 产品：按 sku 在 Product 表匹配；命中 → 写入 { en: keywords_en, zh: [], ar: [] }；
 *    未命中 → 打印 `UNMATCHED sku <sku>`。
 *  - 博客：slug 兼容带/不带 .html；命中 → 写入逗号分隔串 keywords_en.join(', ')；
 *    未命中 → 打印 `UNMATCHED blog <slug>`。
 *  - 每个 update 包 try/catch，缺失行不抛错；幂等（重跑 = no-op）。
 *  - 末尾打印匹配统计 + products_data.json 是否同步。
 *
 * --also-source（默认 ON）：同时回填 scripts/import/source/products_data.json。
 *   products_data.json 无 sku 字段，按 seed 的 path（含前缀，如 products/...、applications/...）
 *   与 url 末尾 `/<path>.html` 精确匹配，避免同 slug 不同 path 的产品互相覆盖（如 MAT-001 vs CAB-001）。
 *   这样 DB 与源数据保持同步，重跑导入不会回滚本次关键词。
 *
 * 运行：npm run seed:keywords   （等价于 npx tsx scripts/seed/seed-keywords.ts）
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_PATH = join(__dirname, 'keyword-seeds.json');
const SOURCE_PATH = join(__dirname, '..', 'import', 'source', 'products_data.json');

/** --also-source 默认 ON；可用 --no-also-source 显式关闭 */
function parseAlsoSource(argv: string[]): boolean {
  let alsoSource = true;
  for (const a of argv) {
    if (a === '--no-also-source') alsoSource = false;
    else if (a === '--also-source') alsoSource = true;
  }
  return alsoSource;
}

// deriveSlugFromUrl removed: the --also-source sync now matches products_data.json by
// exact `path` (prefix included), avoiding same-slug collisions (MAT-001 vs CAB-001).

interface SeedProduct {
  sku: string;
  slug: string;
  path: string;
  keywords_en: string[];
}
interface SeedBlog {
  slug: string;
  title: string;
  keywords_en: string[];
}

async function main(): Promise<void> {
  const alsoSource = parseAlsoSource(process.argv.slice(2));
  const raw = JSON.parse(readFileSync(SEED_PATH, 'utf-8')) as {
    products: SeedProduct[];
    blogs: SeedBlog[];
  };
  const products = raw.products || [];
  const blogs = raw.blogs || [];

  const unmatchedProducts: string[] = [];
  const unmatchedBlogs: string[] = [];
  let matchedProducts = 0;
  let matchedBlogs = 0;

  // ===== 1) DB 写入（连接失败时整段跳过，不影响 products_data.json 同步） =====
  let prisma: PrismaClient | null = null;
  let dbAvailable = false;
  try {
    prisma = new PrismaClient();
    // 健康探测：不可达会在此抛错
    await prisma.$queryRaw`SELECT 1`;
    dbAvailable = true;
  } catch (e) {
    console.error('[DB] 无法连接数据库，跳过 DB 写入：', (e as Error).message);
  }

  if (prisma && dbAvailable) {
    // --- 产品：按 sku 匹配 ---
    for (const p of products) {
      try {
        const found = await prisma.product.findUnique({ where: { sku: p.sku } });
        if (found) {
          await prisma.product.update({
            where: { sku: p.sku },
            data: { seoKeywords: { en: p.keywords_en, zh: [], ar: [] } },
          });
          matchedProducts++;
        } else {
          unmatchedProducts.push(p.sku);
          console.log('UNMATCHED sku', p.sku);
        }
      } catch (e) {
        // 单个产品更新失败不影响其余；缺失行也绝不抛出
        console.error('[DB] 更新产品失败 sku', p.sku, (e as Error).message);
      }
    }

    // --- 博客：slug 兼容带/不带 .html ---
    for (const b of blogs) {
      const slugBase = b.slug.replace(/\.html$/i, '');
      try {
        const found = await prisma.blogPost.findFirst({
          where: { slug: { in: [b.slug, slugBase] }, deletedAt: null },
          select: { id: true },
        });
        if (found) {
          await prisma.blogPost.update({
            where: { id: found.id },
            data: { seoKeywords: b.keywords_en.join(', ') },
          });
          matchedBlogs++;
        } else {
          unmatchedBlogs.push(b.slug);
          console.log('UNMATCHED blog', b.slug);
        }
      } catch (e) {
        console.error('[DB] 更新博客失败', b.slug, (e as Error).message);
      }
    }

    try {
      await prisma.$disconnect();
    } catch {
      /* 忽略断开异常 */
    }
  }

  // ===== 2) products_data.json 同步（本地文件，独立进行） =====
  let sourceSynced = false;
  if (alsoSource) {
    try {
      // Build path -> keywords_en (path already unique per seed, prefix included)
      const pathToKw = new Map<string, string[]>();
      for (const p of products) pathToKw.set(p.path, p.keywords_en);

      const source = JSON.parse(readFileSync(SOURCE_PATH, 'utf-8'));
      const sheets = Array.isArray(source.sheets) ? source.sheets : [];
      let patched = 0;
      const unmatchedSeeds: string[] = [];
      for (const p of products) {
        let matched = false;
        for (const sheet of sheets) {
          const rows = Array.isArray(sheet.products) ? sheet.products : [];
          for (const row of rows) {
            // path includes prefix, e.g. "products/..." or "applications/...";
            // url ends with "/<path>.html" -> unambiguous match
            if (row.url && row.url.includes('/' + p.path + '.html')) {
              row.seo_keywords = p.keywords_en;
              patched++;
              matched = true;
            }
          }
        }
        if (!matched) {
          unmatchedSeeds.push(p.sku + ' ' + p.path);
          console.log('UNMATCHED source path', p.path, '(sku', p.sku + ')');
        }
      }
      console.log(`[SOURCE] 路径匹配 ${patched} 条; 未匹配种子: [${unmatchedSeeds.join(', ')}]`);
      writeFileSync(SOURCE_PATH, JSON.stringify(source, null, 2));
      sourceSynced = true;
    } catch (e) {
      sourceSynced = false;
      console.error('[SOURCE] 同步 products_data.json 失败：', (e as Error).message);
    }
  } else {
    console.log('[SOURCE] --also-source 已关闭，跳过 products_data.json 同步。');
  }

  // ===== 3) 统计输出 =====
  const unmatched = [...unmatchedProducts, ...unmatchedBlogs];
  console.log(
    `Matched products ${matchedProducts}/${products.length}, blogs ${matchedBlogs}/${blogs.length}; unmatched: [${unmatched.join(', ')}]`,
  );
  console.log(`products_data.json synced: ${sourceSynced}`);
}

main().catch((e) => {
  console.error('seed-keywords 运行异常：', e);
  process.exit(1);
});
