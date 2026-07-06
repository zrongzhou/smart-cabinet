/**
 * fix-product-names.ts
 *
 * 将每个产品(product)的 name 字段修正为「官方产品名」：
 *   - en 严格取自源数据 products_data.json 的 title_en 字段提取的短名称
 *     （取第一个 " - " 或 " for " 之前的部分），即真正的产品名，而非分类名。
 *   - zh / ar 为基于官方英文名的专业行业翻译（工业智能柜用语）。
 *
 * 官方英文来源：scripts/import/source/products_data.json
 *   （每个 sheet 的 products[].title_en，按 url 反推 slug）
 *
 * 重要约束：
 *   1. 仅更新 product.name 字段，不触碰其他字段或表。
 *   2. en 必须严格等于下方 OFFICIAL_NAMES 中定义的「产品名」（源自 title_en）。
 *   3. 数据库存储的 slug 由 seed-products.ts 的 toSlug() 生成，
 *      可能带 URL 前缀(products/、applications/、solutions/)与 .html 后缀，
 *      因此这里用 normalizeSlug() 统一规约为裸 slug 再匹配 OFFICIAL_NAMES。
 *
 * 运行：
 *   npx ts-node --compiler-options {"module":"CommonJS"} scripts/import/fix-product-names.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** slug(裸) -> { en, zh, ar } 官方产品名映射（基于 title_en 提取的短名称） */
const OFFICIAL_NAMES: Record<string, { en: string; zh: string; ar: string }> = {
  // ---------- 柜体分类 (products/) ----------
  'cnc-tool-vending-machines': {
    en: 'CNC Tool Vending Machine',
    zh: 'CNC刀具售货机',
    ar: 'آلة بيع أدوات CNC',
  },
  'tool-vending-expansion-cabinet': {
    en: 'CNC Tool Vending Auxiliary Cabinet',
    zh: 'CNC刀具售货机扩展柜',
    ar: 'خزانة مساعدة لآلة بيع أدوات CNC',
  },
  'smart-tool-locker-cabinet': {
    en: 'Industrial Tool Locker Cabinet',
    zh: '工业工具储物柜',
    ar: 'خزانة أدوات صناعية',
  },
  'modular-industrial-vending-machine': {
    en: 'Modular Industrial Vending Machine',
    zh: '模块化工业自动售货机',
    ar: 'آلة بيع صناعية معيارية',
  },
  'smart-drawer-tool-cabinet': {
    en: 'Smart Drawer Tool Cabinet',
    zh: '智能抽屉工具柜',
    ar: 'خزانة أدراج ذكية',
  },
  'weight-based-vending-cabinet': {
    en: 'Weight-based Vending Cabinet',
    zh: '智能称重售货机',
    ar: 'وزن بيع الآلات',
  },
  'automated-storage-cabinet': {
    en: 'Automated Micro Warehouse Cabinet',
    zh: '自动化微型仓储柜',
    ar: 'مستودع صغير آلي',
  },
  'rfid-asset-tracking-cabinet': {
    en: 'RFID Smart Cabinet',
    zh: 'RFID智能资产柜',
    ar: 'خزانة ذكية RFID',
  },

  // ---------- 物料管理 (applications/) ----------
  'cnc-tool-vending-machine': {
    en: 'CNC Tool Vending Machine',
    zh: 'CNC刀具管理售货机',
    ar: 'آلة إدارة أدوات CNC',
  },
  'ppe-vending-machine': {
    en: 'PPE Vending Machine',
    zh: 'PPE安全防护用品售货机',
    ar: 'آلة بيع معدات السلامة',
  },
  'fastener-vending-machine': {
    en: 'Fastener Vending Cabinet',
    zh: '紧固件耗材售货机',
    ar: 'خزانة بيع المسامير',
  },
  'smart-file-cabinet': {
    en: 'Smart File Cabinet',
    zh: '智能档案文件柜',
    ar: 'خزانة ملفات ذكية',
  },
  'smart-locker-system': {
    en: 'Smart Locker System',
    zh: '员工智能储物柜',
    ar: 'نظام خزائن ذكي',
  },
  'tool-tracking-system': {
    en: 'Tool Tracking System',
    zh: '工具跟踪管理系统',
    ar: 'نظام تتبع الأدوات',
  },
  'office-supply-vending-machine': {
    en: 'Office Supply Vending Machine',
    zh: '办公用品自动售货机',
    ar: 'آلة بيع المستلزمات المكتبية',
  },
  'food-pickup-locker': {
    en: 'Smart Food Pickup Locker',
    zh: '智能餐饮取餐柜',
    ar: 'خزانة استلام الطعام',
  },
  'chemical-storage-cabinet': {
    en: 'Refrigerated Chemical Storage Cabinet',
    zh: '化学品冷藏存储柜',
    ar: 'خزانة تخزين كيميائية',
  },

  // ---------- 行业方案 (solutions/) ----------
  'cnc-machining-tool-management': {
    en: 'CNC Machining Tool Management Solution',
    zh: 'CNC加工精密制造解决方案',
    ar: 'حل تصنيع CNC',
  },
  'smart-factory-inventory-management': {
    en: 'Smart Factory Inventory Management Solution',
    zh: '智能工厂库存管理解决方案',
    ar: 'حل إدارة مخزون المصنع الذكي',
  },
  'metal-fabrication-tool-management': {
    en: 'Metal Fabrication Tool Management Solution',
    zh: '五金金属加工管理解决方案',
    ar: 'حل تصنيع المعادن',
  },
  'mold-shop-tool-management': {
    en: 'Mold & Injection Molding Tool Management Solution',
    zh: '模具注塑精密工装解决方案',
    ar: 'حل القوالب والحقن',
  },
  'electronics-manufacturing-inventory': {
    en: 'Electronics Manufacturing Smart Cabinet Solution',
    zh: '电子半导体电气光学制造解决方案',
    ar: 'حل تصنيع الإلكترونيات',
  },
  'automotive-manufacturing-inventory': {
    en: 'Automotive & EV Manufacturing Solution',
    zh: '汽车与电动汽车零部件制造解决方案',
    ar: 'حل تصنيع السيارات الكهربائية',
  },
  'medical-device-manufacturing-supplies': {
    en: 'Medical Device Manufacturing Smart Cabinet Solution',
    zh: '医疗器械与生命科学设备解决方案',
    ar: 'حل تصنيع الأجهزة الطبية',
  },
  'materials-manufacturing-inventory': {
    en: 'New Materials & Cable Manufacturing Solution',
    zh: '新材料线缆功能材料制造解决方案',
    ar: 'حل تصنيع المواد الجديدة',
  },

  // ---------- 其他 (solutions/) ----------
  'custom-industrial-vending-machine': {
    en: 'Custom Industrial Vending Machine Solutions',
    zh: '定制化工业智能柜解决方案',
    ar: 'حل آلات البيع الصناعية المخصصة',
  },
};

/**
 * 将数据库存储的 slug 规约为裸 slug，以匹配 OFFICIAL_NAMES 的 key。
 * 示例：
 *   "cnc-tool-vending-machines.html"          -> "cnc-tool-vending-machines"
 *   "applications/cnc-tool-vending-machine.html" -> "cnc-tool-vending-machine"
 *   "solutions/cnc-machining-tool-management.html" -> "cnc-machining-tool-management"
 */
function normalizeSlug(slug: string): string {
  return slug
    .replace(/\.html?$/i, '')
    .replace(/^(products|applications|solutions)\//i, '');
}

/** product.name 字段的三语结构 */
type TrilingualName = { en?: string; zh?: string; ar?: string };

async function main(): Promise<void> {
  console.error(
    '\n[DEPRECATED] fix-product-names.ts 已废弃：它曾错误地用 title_en 截断得到 en，' +
      '并硬编码了错误的 zh/ar（如 CAB-001 写成 "CNC刀具售货机"）。\n' +
      '正确数据源：products_data.json 的 name_en（en）+ zh-ar-patch.json 的 name.{zh,ar}（zh/ar）。\n' +
      '请改用 fix-product-names-correct.mjs（已与源数据逐条核对，26/26 全覆盖）。\n' +
      '本脚本直接退出，不会修改任何数据。\n',
  );
  process.exit(0);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
