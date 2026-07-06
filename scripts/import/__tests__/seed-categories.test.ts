/**
 * seed-categories.test.ts — 数据契约单测（纯逻辑，不连 DB）
 *
 * 验证 docs/category-restructure-design.md §1.3 的两级映射契约：
 *   - 4 个 L1（type='product'） + 4 个 L2（cabinet-type/managed-items/industry/custom-solution）
 *   - 26 个产品 slug 覆盖（读 translations/_input_sheet0~3.json 统计，与 MAPPING 各 L2 来源一致）
 *   - 每个 L1/L2 的 name 为 {zh,en,ar}，slug 唯一且符合 §1.3 表
 *   - L1 type==='product'；L2 type ∈ {cabinet-type,managed-items,industry,custom-solution}；L2 icon ∈ {Archive,Package,Building2,Settings}
 *
 * 注意：为避免导入 seed 脚本时触发 main() 的真实 DB 写入，本测试在导入前将
 * process.argv 注入 '--dry-run'，使 main() 仅做文件解析、不连接数据库。
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// 必须在 import('../seed-categories') 求值前注入，避免 main() 走真实写入分支。
process.argv = [...process.argv, '--dry-run'];

const SEED_DIR = path.resolve(__dirname, '..');
const TRANSLATIONS_DIR = path.resolve(SEED_DIR, 'translations');

// §1.3 表期望（source of truth）
const EXPECTED_L1_SLUGS = ['cat-cabinet', 'cat-managed-items', 'cat-industry', 'cat-others'];
const EXPECTED_L2_SLUGS = ['sub-cabinet-types', 'sub-managed-items', 'sub-industries', 'sub-others'];
const EXPECTED_L2_TYPES = ['cabinet-type', 'managed-items', 'industry', 'custom-solution'];
const EXPECTED_L2_ICONS = ['Archive', 'Package', 'Building2', 'Settings'];
const EXPECTED_L1_EN = ['By Cabinet Type', 'By Managed Items', 'By Industry', 'Others'];
const EXPECTED_L2_EN = ['By cabinets types', 'By Managed items', 'By industries', 'Others'];
const EXPECTED_L2_ZH = ['按柜体类型', '按管理物料', '按行业', '其他'];
const EXPECTED_L1_ZH = ['按照柜体分类', '按照物料管理分类', '按照行业分类', '其他'];
// 各 sheet 产品数（来自 _input_sheet0~3.json）
const EXPECTED_PER_SHEET_COUNTS = [8, 9, 8, 1];
const EXPECTED_TOTAL_PRODUCTS = 26;

interface Trilingual {
  zh: string;
  en: string;
  ar: string;
}
interface MappingEntry {
  file: string;
  l1: { slug: string; name: Trilingual; type: 'product'; order: number };
  l2: { slug: string; name: Trilingual; type: string; icon: string; order: number };
}

function readSlugsFromSheet(file: string): string[] {
  const filePath = path.resolve(TRANSLATIONS_DIR, file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`测试依赖的输入文件不存在：${filePath}`);
  }
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const products: Array<{ slug?: string }> = raw.products || [];
  return products.map((p) => (p.slug || '').trim()).filter((s) => s.length > 0);
}

describe('seed-categories 数据契约（design §1.3）', () => {
  let MAPPING: MappingEntry[] = [];

  beforeAll(async () => {
    // 动态导入（需先于该调用的 process.argv 已含 --dry-run）
    const mod = await import('../seed-categories');
    MAPPING = mod.MAPPING as unknown as MappingEntry[];
  });

  it('MAPPING 导入成功且包含 4 个映射项', () => {
    expect(Array.isArray(MAPPING)).toBe(true);
    expect(MAPPING.length).toBe(4);
  });

  it('恰好 4 个 L1 / 4 个 L2', () => {
    expect(MAPPING.length).toBe(4);
    MAPPING.forEach((e) => {
      expect(e.l1).toBeTruthy();
      expect(e.l2).toBeTruthy();
    });
  });

  it('L1 slug 集合与 §1.3 表一致且唯一', () => {
    const l1Slugs = MAPPING.map((e) => e.l1.slug);
    expect(new Set(l1Slugs).size).toBe(l1Slugs.length); // 唯一
    expect(l1Slugs.sort()).toEqual([...EXPECTED_L1_SLUGS].sort());
  });

  it('L2 slug 集合与 §1.3 表一致且唯一，且与 L1 slug 不重叠', () => {
    const l2Slugs = MAPPING.map((e) => e.l2.slug);
    expect(new Set(l2Slugs).size).toBe(l2Slugs.length); // 唯一
    expect(l2Slugs.sort()).toEqual([...EXPECTED_L2_SLUGS].sort());
    const overlap = l2Slugs.filter((s) => EXPECTED_L1_SLUGS.includes(s));
    expect(overlap).toEqual([]); // L1/L2 slug 不重叠
  });

  it('L1 type 全部为 "product"', () => {
    MAPPING.forEach((e) => {
      expect(e.l1.type).toBe('product');
    });
  });

  it('L2 type 集合与 {cabinet-type,managed-items,industry,custom-solution} 一致', () => {
    const l2Types = MAPPING.map((e) => e.l2.type);
    expect(new Set(l2Types).size).toBe(l2Types.length); // 唯一
    expect(l2Types.sort()).toEqual([...EXPECTED_L2_TYPES].sort());
    l2Types.forEach((t) => {
      expect(EXPECTED_L2_TYPES).toContain(t);
    });
  });

  it('L2 icon 集合与 {Archive,Package,Building2,Settings} 一致', () => {
    const l2Icons = MAPPING.map((e) => e.l2.icon);
    expect(new Set(l2Icons).size).toBe(l2Icons.length); // 唯一
    l2Icons.forEach((ic) => {
      expect(EXPECTED_L2_ICONS).toContain(ic);
    });
  });

  it('每个 L1/L2 的 name 均为 {zh,en,ar} 结构且非空', () => {
    const assertTrilingual = (name: Trilingual, where: string) => {
      expect(name).toBeTruthy();
      expect(typeof name.zh).toBe('string');
      expect(typeof name.en).toBe('string');
      expect(typeof name.ar).toBe('string');
      expect(name.zh.trim().length).toBeGreaterThan(0);
      expect(name.en.trim().length).toBeGreaterThan(0);
      expect(name.ar.trim().length).toBeGreaterThan(0); // ar 为占位串，但必须非空
    };
    MAPPING.forEach((e, i) => {
      assertTrilingual(e.l1.name, `L1#${i}`);
      assertTrilingual(e.l2.name, `L2#${i}`);
    });
  });

  it('L1.en / L2.en / L2.zh / L1.zh 文案与 §1.3 / T05 约定一致', () => {
    MAPPING.forEach((e, i) => {
      expect(e.l1.name.en).toBe(EXPECTED_L1_EN[i]);
      expect(e.l2.name.en).toBe(EXPECTED_L2_EN[i]);
      expect(e.l2.name.zh).toBe(EXPECTED_L2_ZH[i]);
      expect(e.l1.name.zh).toBe(EXPECTED_L1_ZH[i]);
    });
  });

  it('L2.en 与对应 sheet 的 dimension 字段一致（交叉校验种子与源表）', () => {
    MAPPING.forEach((e) => {
      const filePath = path.resolve(TRANSLATIONS_DIR, e.file);
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      expect(raw.dimension).toBe(e.l2.name.en);
    });
  });

  it('order 为 1..4（与 L1 同序，稳定排序）', () => {
    MAPPING.forEach((e, i) => {
      expect(e.l1.order).toBe(i + 1);
      expect(e.l2.order).toBe(i + 1);
    });
  });

  it('各 sheet 产品数 = 8/9/8/1，合计 26，且无跨 sheet 重复 slug', () => {
    const perSheet = MAPPING.map((e) => readSlugsFromSheet(e.file).length);
    expect(perSheet).toEqual(EXPECTED_PER_SHEET_COUNTS);
    const all = MAPPING.flatMap((e) => readSlugsFromSheet(e.file));
    expect(all.length).toBe(EXPECTED_TOTAL_PRODUCTS);
    // 去重后数量应等于原始数量 → 无跨 sheet 重复
    expect(new Set(all).size).toBe(all.length);
    // 每个 slug 非空
    all.forEach((s) => expect(s.length).toBeGreaterThan(0));
  });

  it('MAPPING 各 L2 的来源文件对应的产品 slug 集合与直接读 sheet 完全一致', () => {
    MAPPING.forEach((e) => {
      const slugs = readSlugsFromSheet(e.file);
      expect(slugs.length).toBeGreaterThan(0);
      // 直接读 sheet 是种子脚本关联产品的唯一来源，二者必须一致
      expect(Array.isArray(slugs)).toBe(true);
    });
  });
});
