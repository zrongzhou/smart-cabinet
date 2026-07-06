/**
 * seed-categories.ts (v265 · Smart Cabinet 两级分类体系重构)
 *
 * 为 v265 导入的 26 个真实产品补齐「一级分类(L1) + 子分类(L2)」两级体系：
 *   - 读 scripts/import/translations/_input_sheet0~3.json
 *   - upsert 4 个 L1（type='product', parentId=null）+ 4 个 L2（按维度 type, parentId→L1）
 *   - 按 products[].slug 将每个产品 connect 到对应的 L2（产品仅连 L2）
 *   - 幂等：slug 唯一 upsert + connect 前先校验是否已关联，已关联则跳过
 *
 * 依赖：零新依赖，沿用 seed-products.ts 同款方式（ts-node + PrismaClient 直连）。
 * 设计源：docs/category-restructure-design.md §1.3（MAPPING 为本文件 source of truth）。
 *
 * 用法：
 *   npx ts-node --compiler-options {"module":"CommonJS"} scripts/import/seed-categories.ts            # 真实写入
 *   npx ts-node --compiler-options {"module":"CommonJS"} scripts/import/seed-categories.ts --dry-run   # 只解析、不连库
 *
 * 注意：无需改 schema，无迁移。重复运行幂等。
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const SCRIPT_DIR = __dirname;
const TRANSLATIONS_DIR = path.resolve(SCRIPT_DIR, 'translations');

const isDryRun = process.argv.includes('--dry-run');

// ============================================================
// 两级映射（design source of truth）
// 与 docs/category-restructure-design.md §1.3 表严格对应。
// L1.en 用 "By Cabinet Type" / "By Managed Items" / "By Industry" / "Others"
// L2.en 用 Excel dimension 值；L2.zh 用「按柜体类型/按管理物料/按行业/其他」
// L2.ar / L1.ar 为占位串，后续由专业翻译补全。
//   TODO:ar-translation — 阿拉伯语名称为临时占位，需母语翻译替换。
// ============================================================
interface Trilingual {
  zh: string;
  en: string;
  ar: string;
}

interface L1Config {
  slug: string;
  name: Trilingual;
  type: 'product';
  order: number;
}

interface L2Config {
  slug: string;
  name: Trilingual;
  /** 维度 type：cabinet-type / managed-items / industry / custom-solution */
  type: string;
  /** 对齐现有 dimensionDefaultIcons：Archive / Package / Building2 / Settings */
  icon: string;
  order: number;
}

interface MappingEntry {
  /** 对应的 sheet 输入文件 */
  file: string;
  l1: L1Config;
  l2: L2Config;
}

// NOTE: `export` 仅用于让 vitest 数据契约测试可导入 MAPPING 做静态校验，
// 不改变任何运行逻辑（main() 流程、upsert/connect 行为均不变）。
export const MAPPING: MappingEntry[] = [
  {
    file: '_input_sheet0.json',
    l1: {
      slug: 'cat-cabinet',
      name: { zh: '按照柜体分类', en: 'By Cabinet Type', ar: 'حسب نوع الخزانة' }, // TODO:ar-translation
      type: 'product',
      order: 1,
    },
    l2: {
      slug: 'sub-cabinet-types',
      name: { zh: '按柜体类型', en: 'By cabinets types', ar: 'حسب نوع الخزانة' }, // TODO:ar-translation
      type: 'cabinet-type',
      icon: 'Archive',
      order: 1,
    },
  },
  {
    file: '_input_sheet1.json',
    l1: {
      slug: 'cat-managed-items',
      name: { zh: '按照物料管理分类', en: 'By Managed Items', ar: 'حسب العناصر المُدارة' }, // TODO:ar-translation
      type: 'product',
      order: 2,
    },
    l2: {
      slug: 'sub-managed-items',
      name: { zh: '按管理物料', en: 'By Managed items', ar: 'حسب المواد المُدارة' }, // TODO:ar-translation
      type: 'managed-items',
      icon: 'Package',
      order: 2,
    },
  },
  {
    file: '_input_sheet2.json',
    l1: {
      slug: 'cat-industry',
      name: { zh: '按照行业分类', en: 'By Industry', ar: 'حسب الصناعة' }, // TODO:ar-translation
      type: 'product',
      order: 3,
    },
    l2: {
      slug: 'sub-industries',
      name: { zh: '按行业', en: 'By industries', ar: 'حسب الصناعة' }, // TODO:ar-translation
      type: 'industry',
      icon: 'Building2',
      order: 3,
    },
  },
  {
    file: '_input_sheet3.json',
    l1: {
      slug: 'cat-others',
      name: { zh: '其他', en: 'Others', ar: 'أخرى' }, // TODO:ar-translation
      type: 'product',
      order: 4,
    },
    l2: {
      slug: 'sub-others',
      name: { zh: '其他', en: 'Others', ar: 'أخرى' }, // TODO:ar-translation
      type: 'custom-solution',
      icon: 'Settings',
      order: 4,
    },
  },
];

/** 读取单个 sheet json，返回其中产品的 slug 列表（与 DB 中 product.slug 对齐）。 */
function readProductSlugs(file: string): string[] {
  const filePath = path.resolve(TRANSLATIONS_DIR, file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`[seed-categories] 输入文件不存在：${filePath}`);
  }
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const products: Array<{ slug?: string }> = raw.products || [];
  return products
    .map((p) => (p.slug || '').trim())
    .filter((slug) => slug.length > 0);
}

async function main(): Promise<void> {
  // 解析所有 sheet 的产品 slug，并统计目标数量
  const slugPlan: { entry: MappingEntry; slugs: string[] }[] = MAPPING.map((entry) => ({
    entry,
    slugs: readProductSlugs(entry.file),
  }));

  const totalL1 = MAPPING.length;
  const totalL2 = MAPPING.length;
  const totalAssociations = slugPlan.reduce((sum, p) => sum + p.slugs.length, 0);

  console.log(
    `[seed-categories] 计划： ${totalL1} L1 / ${totalL2} L2 / ${totalAssociations} 关联（来自 ${MAPPING.length} 个 sheet）`,
  );

  // dry-run：仅解析计数并打印，不连接数据库
  if (isDryRun) {
    slugPlan.forEach((p) => {
      console.log(
        `  · ${p.entry.file}: L1=${p.entry.l1.slug} L2=${p.entry.l2.slug} (${p.entry.l2.type}) → ${p.slugs.length} 产品`,
      );
    });
    console.log(`\n[dry-run] 解析完成，未连接数据库。预期写入 ${totalL1} L1 / ${totalL2} L2 / ${totalAssociations} 关联`);
    return;
  }

  const prisma = new PrismaClient();
  let okL1 = 0;
  let okL2 = 0;
  let linkedCount = 0;
  let missingCount = 0;

  try {
    for (const plan of slugPlan) {
      const { l1, l2 } = plan.entry;

      // ① upsert L1（type='product', parentId=null）
      const l1Row = await prisma.category.upsert({
        where: { slug: l1.slug },
        create: {
          slug: l1.slug,
          name: l1.name as any,
          type: l1.type,
          order: l1.order,
          status: 'active',
        },
        update: {
          name: l1.name as any,
          type: l1.type,
          order: l1.order,
          status: 'active',
        },
      });
      okL1 += 1;

      // ② upsert L2（type=维度, parentId→L1）
      const l2Row = await prisma.category.upsert({
        where: { slug: l2.slug },
        create: {
          slug: l2.slug,
          name: l2.name as any,
          type: l2.type,
          icon: l2.icon,
          order: l2.order,
          status: 'active',
          parent: { connect: { id: l1Row.id } },
        },
        update: {
          name: l2.name as any,
          type: l2.type,
          icon: l2.icon,
          order: l2.order,
          status: 'active',
          parent: { connect: { id: l1Row.id } },
        },
      });
      okL2 += 1;

      console.log(
        `[seed-categories] 已建立 L1(${l1.slug}) → L2(${l2.slug}, ${l2.type})`,
      );

      // ③ 按 slug 将产品 connect 到 L2（幂等：已关联则跳过）
      for (const slug of plan.slugs) {
        const product = await prisma.product.findUnique({
          where: { slug },
          select: { id: true, sku: true, categories: { select: { id: true } } },
        });

        if (!product) {
          // 缺失产品 slug 时不中断，仅告警
          console.warn(
            `[seed-categories] 警告：产品 slug="${slug}" 在数据库中不存在，跳过关联（请确认 seed-products 已先运行）。`,
          );
          missingCount += 1;
          continue;
        }

        const alreadyLinked = product.categories.some((c) => c.id === l2Row.id);
        if (!alreadyLinked) {
          await prisma.product.update({
            where: { id: product.id },
            data: { categories: { connect: { id: l2Row.id } } },
          });
        }
        linkedCount += 1;
      }
    }

    console.log(
      `\n[seed-categories] 完成：写入 ${okL1} L1 / ${okL2} L2 / ${linkedCount} 关联` +
        (missingCount > 0 ? `（${missingCount} 个产品 slug 缺失，已跳过）` : ''),
    );
  } catch (err) {
    console.error('[seed-categories] 写入失败：', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[seed-categories] 未预期错误：', err);
  process.exit(1);
});
