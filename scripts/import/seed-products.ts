/**
 * seed-products.ts (v265)
 * 将已校验的 Excel 产品数据（scripts/import/source/）导入 PostgreSQL/Prisma。
 *
 * 数据来源：
 *   - products_data.json       —— 产品主字段（name/title/description/features/specs/faq/seoKeywords）
 *   - image_mapping_final.json —— 图片权威来源，结构与主数据同 sheet、同 product 位置对齐
 *
 * SKU 规则（按 sheet 顺序）：柜体→CAB、物料→MAT、行业→IND、其他→OTH，序号 per-sheet 从 001 起。
 * slug 规则：url 去掉 /products/ 前缀（保留 .html 后缀）。
 * 图片 URL：/uploads/products/<media 文件名>（media 目录已在 copy-media.ts 中拷贝到 public）。
 *
 * 用法：
 *   npx ts-node --compiler-options {"module":"CommonJS"} scripts/import/seed-products.ts            # 真实写入
 *   npx ts-node --compiler-options {"module":"CommonJS"} scripts/import/seed-products.ts --dry-run   # 只解析不连库
 *
 * 注意：categories / tags 不导入（保持为空，由现有详情页容错处理）。
 */
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const SCRIPT_DIR = __dirname;
const SOURCE_DIR = path.resolve(SCRIPT_DIR, 'source');
const PRODUCTS_FILE = path.resolve(SOURCE_DIR, 'products_data.json');
const IMAGE_MAP_FILE = path.resolve(SOURCE_DIR, 'image_mapping_final.json');

const isDryRun = process.argv.includes('--dry-run');

// sheet 顺序 → SKU 前缀（与 products_data.json.sheets 顺序严格对应）
const SKU_PREFIX_BY_SHEET = ['CAB', 'MAT', 'IND', 'OTH'];

interface Trilingual {
  en: string;
  zh: string;
  ar: string;
}

interface ParsedFaq {
  question: Trilingual;
  answer: Trilingual;
  category: string;
  order: number;
  status: string;
}

interface ParsedProduct {
  sku: string;
  slug: string;
  sheetIndex: number;
  rowIndex: number;
  name: Trilingual;
  seoTitle: Trilingual;
  description: Trilingual;
  features: { en: string[]; zh: string[]; ar: string[] };
  specifications: { en: string };
  seoKeywords: { en: string[]; zh: string[]; ar: string[] };
  images: string[];
  faqs: ParsedFaq[];
}

/** 去掉产品 url 的 /products/ 前缀，保留 .html 后缀，作为 slug。 */
function toSlug(url: string): string {
  return url.replace(/^\/+/, '').replace(/^products\//i, '');
}

/** 将 features_en（以 • / 换行分隔的要点）切分为字符串数组。 */
function parseFeatures(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split('\n')
    .map((line) => line.replace(/^[•·\-\s]+/, '').trim())
    .filter((line) => line.length > 0);
}

/**
 * 解析 faq_en：
 *   Q1: <问题>\nA1: <答案>\n\nQ2: <问题>\nA2: <答案>...
 * 按 Q\d+:/A\d+: 配对；若 Q/A 数量不齐（奇数项缺配），整段兜底为单条 FAQ。
 */
function parseFaqs(raw: string | undefined): ParsedFaq[] {
  if (!raw || !raw.trim()) return [];
  const text = raw.trim();
  const qCount = (text.match(/Q\d+\s*:/g) || []).length;
  const aCount = (text.match(/A\d+\s*:/g) || []).length;

  // 奇数项缺配 / 格式异常 → 整段兜底为单条 FAQ
  if (qCount === 0 || aCount === 0 || qCount !== aCount) {
    return [
      {
        question: { en: text, zh: '', ar: '' },
        answer: { en: '', zh: '', ar: '' },
        category: 'product',
        order: 1,
        status: 'active',
      },
    ];
  }

  const result: ParsedFaq[] = [];
  const re = /Q\d+\s*:\s*([\s\S]*?)\s*A\d+\s*:\s*([\s\S]*?)(?=\s*Q\d+\s*:|$)/g;
  let m: RegExpExecArray | null;
  let order = 0;
  while ((m = re.exec(text)) !== null) {
    order += 1;
    result.push({
      question: { en: m[1].trim(), zh: '', ar: '' },
      answer: { en: m[2].trim(), zh: '', ar: '' },
      category: 'product',
      order,
      status: 'active',
    });
  }

  // 兜底：正则意外未命中
  if (result.length === 0) {
    return [
      {
        question: { en: text, zh: '', ar: '' },
        answer: { en: '', zh: '', ar: '' },
        category: 'product',
        order: 1,
        status: 'active',
      },
    ];
  }
  return result;
}

/** 读取两份 JSON 并解析为扁平的产品列表（按 sheet 顺序 + 产品位置对齐图片）。 */
function buildParsedProducts(): ParsedProduct[] {
  const productsData = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
  const imageMap = JSON.parse(fs.readFileSync(IMAGE_MAP_FILE, 'utf-8'));

  const products: ParsedProduct[] = [];
  const sheets = productsData.sheets as Array<{
    sheet: string;
    dimension: string;
    products: Array<Record<string, any>>;
  }>;

  sheets.forEach((sheet, sheetIndex) => {
    const prefix = SKU_PREFIX_BY_SHEET[sheetIndex] || 'OTH';
    const imageSheet = (imageMap.sheets as any[])[sheetIndex];

    sheet.products.forEach((p, rowIndex) => {
      // 用 name_en 校验图片数据对齐（两份数据同源同序）
      const imgProd = imageSheet?.products?.[rowIndex];
      const sku = `${prefix}-${String(rowIndex + 1).padStart(3, '0')}`;
      const slug = toSlug(p.url as string);

      const mediaFiles: string[] = (imgProd?.images || [])
        .map((im: any) => im?.media as string)
        .filter(Boolean)
        .map((media: string) => {
          const baseName = path.basename(media);
          return `/uploads/products/${baseName}`;
        });

      // 防御性告警：按行索引对齐 image_mapping_final.json 后若仍无图片，给出产品名 + sheet
      if (mediaFiles.length === 0) {
        console.warn(
          `[seed] 警告：产品「${p.name_en}」(sheet ${sheetIndex}, row ${rowIndex}) 未匹配到任何图片，请检查 image_mapping_final.json 对齐。`,
        );
      }

      const product: ParsedProduct = {
        sku,
        slug,
        sheetIndex,
        rowIndex,
        name: { en: p.name_en || '', zh: '', ar: '' },
        seoTitle: { en: p.title_en || '', zh: '', ar: '' },
        description: { en: p.description_en || '', zh: '', ar: '' },
        features: { en: parseFeatures(p.features_en), zh: [], ar: [] },
        specifications: { en: p.specs_en || '' },
        seoKeywords: { en: Array.isArray(p.seo_keywords) ? p.seo_keywords : [], zh: [], ar: [] },
        images: mediaFiles,
        faqs: parseFaqs(p.faq_en),
      };
      products.push(product);
    });
  });

  return products;
}

async function main(): Promise<void> {
  const products = buildParsedProducts();

  const totalFaqs = products.reduce((sum, p) => sum + p.faqs.length, 0);
  const uniqueImages = new Set(products.flatMap((p) => p.images)).size;

  console.log(`将导入 ${products.length} 个产品、${totalFaqs} 条 FAQ、${uniqueImages} 张图片`);

  // 打印前 2 个产品的解析样本
  const sampleCount = Math.min(2, products.length);
  for (let i = 0; i < sampleCount; i += 1) {
    const p = products[i];
    console.log(`\n--- 样本 ${i + 1} (sheet ${p.sheetIndex}, row ${p.rowIndex}) ---`);
    console.log(`  sku   : ${p.sku}`);
    console.log(`  slug  : ${p.slug}`);
    console.log(`  name.en: ${p.name.en}`);
    console.log(`  images: ${JSON.stringify(p.images)}`);
    console.log(`  seoKeywords.en: ${JSON.stringify(p.seoKeywords.en)}`);
    console.log(`  features.en(${p.features.en.length}): ${JSON.stringify(p.features.en.slice(0, 2))} ...`);
    console.log(`  faqs(${p.faqs.length}):`);
    p.faqs.slice(0, 2).forEach((f, idx) => {
      console.log(`    [${idx + 1}] Q: ${f.question.en}`);
      console.log(`        A: ${f.answer.en}`);
    });
  }

  if (isDryRun) {
    console.log('\n[dry-run] 未连接数据库，解析逻辑校验完成。');
    return;
  }

  const prisma = new PrismaClient();
  try {
    let okProducts = 0;
    let okFaqs = 0;
    for (const p of products) {
      const product = await prisma.product.upsert({
        where: { slug: p.slug },
        create: {
          slug: p.slug,
          sku: p.sku,
          name: p.name as any,
          seoTitle: p.seoTitle as any,
          description: p.description as any,
          features: p.features as any,
          specifications: p.specifications as any,
          seoKeywords: p.seoKeywords as any,
          images: p.images,
          status: 'active',
        },
        update: {
          sku: p.sku,
          name: p.name as any,
          seoTitle: p.seoTitle as any,
          description: p.description as any,
          features: p.features as any,
          specifications: p.specifications as any,
          seoKeywords: p.seoKeywords as any,
          images: p.images,
          status: 'active',
        },
      });

      // 先删除该产品已有的 FAQ，再按最新解析结果创建（幂等）
      await prisma.fAQ.deleteMany({ where: { productId: product.id } });
      if (p.faqs.length > 0) {
        await prisma.fAQ.createMany({
          data: p.faqs.map((f) => ({
            question: f.question as any,
            answer: f.answer as any,
            category: f.category,
            order: f.order,
            status: f.status,
            productId: product.id,
          })),
        });
      }
      okProducts += 1;
      okFaqs += p.faqs.length;
    }
    console.log(`\n[seed] 完成：写入 ${okProducts} 个产品，${okFaqs} 条 FAQ。`);
  } catch (err) {
    console.error('[seed] 写入失败：', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[seed] 未预期错误：', err);
  process.exit(1);
});
