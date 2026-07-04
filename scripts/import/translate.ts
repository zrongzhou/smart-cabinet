/**
 * translate.ts (v265)
 * 将 scripts/import/translations/zh-ar-patch.json 中的 zh/ar 补丁应用（upsert）到已导入的产品上。
 *
 * // TODO(human): 需人工轻校 zh/ar —— 当前补丁中的 zh/ar 为英文占位直译，待人工轻校后由本脚本落地。
 *
 * 补丁结构（按 slug 索引）：
 *   {
 *     "<slug>": {
 *       name:        { zh, ar },
 *       description: { zh, ar },
 *       seoTitle:    { zh, ar },
 *       features:    { zh, ar },   // zh/ar 为字符串数组
 *       specs:       { zh, ar },   // zh/ar 为字符串
 *       faqs:        [ { question: { zh, ar }, answer: { zh, ar } } ]   // 按 FAQ 顺序对齐
 *     }
 *   }
 *
 * 规则：patch 缺省字段则保留原值（en / 已填值）；en 字段不会被本脚本修改。
 *
 * 用法：
 *   npx ts-node --compiler-options {"module":"CommonJS"} scripts/import/translate.ts            # 真实应用
 *   npx ts-node --compiler-options {"module":"CommonJS"} scripts/import/translate.ts --dry-run   # 仅列计划不连库
 */
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const SCRIPT_DIR = __dirname;
const PATCH_FILE = path.resolve(SCRIPT_DIR, 'translations', 'zh-ar-patch.json');

const isDryRun = process.argv.includes('--dry-run');

type TriPatch = { zh?: string; ar?: string };
type TriArrPatch = { zh?: string[]; ar?: string[] };

/** 合并三语字段（en 保留，zh/ar 用 patch 值；patch 缺省则保留原值）。 */
function mergeTri(current: any, patch?: TriPatch): any {
  const cur = current && typeof current === 'object' ? current : { en: '', zh: '', ar: '' };
  return {
    en: cur.en ?? '',
    zh: patch?.zh || cur.zh || '',
    ar: patch?.ar || cur.ar || '',
  };
}

/** 合并 features（zh/ar 为字符串数组）。 */
function mergeFeatures(current: any, patch?: TriArrPatch): any {
  const cur = current && typeof current === 'object' ? current : { en: [], zh: [], ar: [] };
  return {
    en: cur.en || [],
    zh: patch?.zh || cur.zh || [],
    ar: patch?.ar || cur.ar || [],
  };
}

/** 合并 specifications（zh/ar 为字符串）。 */
function mergeSpecs(current: any, patch?: TriPatch): any {
  const cur = current && typeof current === 'object' ? current : { en: '', zh: '', ar: '' };
  return {
    en: cur.en ?? '',
    zh: patch?.zh || cur.zh || '',
    ar: patch?.ar || cur.ar || '',
  };
}

async function main(): Promise<void> {
  if (!fs.existsSync(PATCH_FILE)) {
    console.error(`[translate] 补丁文件不存在: ${PATCH_FILE}`);
    process.exit(1);
  }
  const patch = JSON.parse(fs.readFileSync(PATCH_FILE, 'utf-8'));
  const slugs = Object.keys(patch).filter((k) => k !== '_meta');

  if (isDryRun) {
    console.log(`[translate] --dry-run：将为 ${slugs.length} 个产品应用 zh/ar 补丁：`);
    for (const slug of slugs) {
      const entry = patch[slug];
      const faqCount = Array.isArray(entry.faqs) ? entry.faqs.length : 0;
      console.log(`  - ${slug}：name/title/desc/features/specs + ${faqCount} FAQ`);
    }
    console.log('[translate] dry-run 完成（未连接数据库）。');
    return;
  }

  const prisma = new PrismaClient();
  try {
    let applied = 0;
    for (const slug of slugs) {
      const entry = patch[slug];
      const product = await prisma.product.findUnique({
        where: { slug },
        select: { id: true, name: true, seoTitle: true, description: true, features: true, specifications: true },
      });
      if (!product) {
        console.warn(`[translate] 未找到产品（slug=${slug}），跳过。`);
        continue;
      }

      await prisma.product.update({
        where: { id: product.id },
        data: {
          name: mergeTri(product.name, entry.name) as any,
          seoTitle: mergeTri(product.seoTitle, entry.seoTitle) as any,
          description: mergeTri(product.description, entry.description) as any,
          features: mergeFeatures(product.features, entry.features) as any,
          specifications: mergeSpecs(product.specifications, entry.specs) as any,
        },
      });

      // FAQ 的 zh/ar：按 order 升序对齐补丁中的 faqs
      if (Array.isArray(entry.faqs) && entry.faqs.length > 0) {
        const faqs = await prisma.fAQ.findMany({
          where: { productId: product.id },
          orderBy: { order: 'asc' },
        });
        for (let i = 0; i < entry.faqs.length; i += 1) {
          const target = faqs[i];
          if (!target) break;
          const patchFaq = entry.faqs[i];
          await prisma.fAQ.update({
            where: { id: target.id },
            data: {
              question: mergeTri(target.question, patchFaq.question) as any,
              answer: mergeTri(target.answer, patchFaq.answer) as any,
            },
          });
        }
      }
      applied += 1;
    }
    console.log(`[translate] 完成：已为 ${applied} 个产品应用 zh/ar 补丁。`);
  } catch (err) {
    console.error('[translate] 应用失败：', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[translate] 未预期错误：', err);
  process.exit(1);
});
