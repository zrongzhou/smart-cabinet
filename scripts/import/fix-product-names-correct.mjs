/**
 * fix-product-names-correct.mjs
 *
 * 用「正确的产品名」覆盖数据库 product.name 字段。
 * 数据来源（已与源数据逐条核对，26/26 全覆盖）：
 *   - en : scripts/import/source/products_data.json 的 name_en 字段（= 表格【产品名称标题】）
 *   - zh/ar : scripts/import/translations/zh-ar-patch.json 的 name.{zh,ar}（专业翻译）
 *
 * 旧脚本 fix-product-names.ts 错误地：
 *   1) 用 title_en 截断得到 en（丢掉真实产品名）
 *   2) 硬编码了错误的 zh/ar（如 CAB-001 写成 "CNC刀具售货机"）
 * 本脚本直接写入核对过的正确值，仅修改 name 字段，不触碰其他字段。
 *
 * 运行（在服务器 /var/www/smart-cabinet 下）：
 *   node scripts/import/fix-product-names-correct.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** slug -> { en, zh, ar } 正确产品名（已核对） */
const NAME_MAP = {
  'applications/refrigerated-chemical-storage-cabinet.html': { en: 'Refrigerated Chemical Storage Cabinet for Lab Reagents and Liquid Bottles', zh: '化学液体管理', ar: 'إدارة السوائل الكيميائية' },
  'applications/tool-vending-machine-cnc-tools.html': { en: 'Tool Vending Machine for CNC Cutting Tools, Inserts and End Mills', zh: 'CNC刀具管理', ar: 'إدارة أدوات CNC' },
  'applications/fastener-vending-machine.html': { en: 'Fasteners & Consumables', zh: '紧固件与耗材', ar: 'المثبتات والمستهلكات' },
  'applications/food-pickup-locker.html': { en: 'Food Pickup and Meal Collection', zh: '餐饮取餐与餐食收集', ar: 'استلام الطعام وجمع الوجبات' },
  'applications/office-supply-vending-machine.html': { en: 'Office Supplies', zh: '办公用品', ar: 'اللوازم المكتبية' },
  'applications/ppe-vending-machine.html': { en: 'PPE & Safety Supplies', zh: 'PPE与劳保用品', ar: 'المعدات الوقائية ولوازم السلامة' },
  'applications/secure-document-storage-cabinet.html': { en: 'Secure Document Storage Cabinet for Archives, Work Orders and File Tracking', zh: '文档与档案', ar: 'المستندات والأرشيف' },
  'applications/smart-locker-system.html': { en: 'Employee Personal Storage', zh: '员工个人储物', ar: 'التخزين الشخصي للموظفين' },
  'applications/rfid-tool-tracking-cabinet.html': { en: 'RFID Tool Tracking Cabinet for Gauges, Fixtures and Reusable Assets', zh: '可复用工具与资产', ar: 'الأدوات القابلة لإعادة الاستخدام والأصول' },
  'automated-tool-storage-system.html': { en: 'Automated Tool Storage System for Printing Wheels and Reusable Parts', zh: '微型仓储柜', ar: 'خزائن التخزين المصغرة' },
  'tool-vending-machine-cnc-tools.html': { en: 'Tool Vending Machine for CNC Cutting Tools and Tool Inventory Control', zh: 'CNC刀具自动售货机', ar: 'ماكينات بيع أدوات التصنيع CNC' },
  'modular-industrial-vending-machine.html': { en: 'Modular Industrial Vending Machines', zh: '模块化工业自动售货机', ar: 'ماكينات البيع الصناعية المعيارية' },
  'rfid-asset-tracking-cabinet.html': { en: 'RFID Smart Cabinets', zh: 'RFID智能柜', ar: 'خزائن RFID الذكية' },
  'smart-drawer-tool-cabinet.html': { en: 'Smart Drawer Cabinets', zh: '智能抽屉式工具柜', ar: 'خزائن الأدراج الذكية' },
  'smart-tool-locker-cabinet.html': { en: 'Smart Tool locker Cabinets', zh: '智能工具储物柜', ar: 'خزائن الأدوات الذكية' },
  'solutions/automotive-ev-parts-inventory.html': { en: 'Industrial Vending Machine for Automotive and EV Parts Manufacturing', zh: '汽车与电动汽车零部件制造', ar: 'تصنيع مكونات السيارات والمركبات الكهربائية' },
  'solutions/cnc-machining-tool-management.html': { en: 'CNC Machining and Precision Parts Manufacturing', zh: 'CNC 加工与精密零件制造', ar: 'التشغيل باستخدام الحاسب الآلي وتصنيع القطع الدقيقة' },
  'solutions/custom-industrial-vending-machine.html': { en: 'customized', zh: '定制化', ar: 'مخصص' },
  'solutions/electronics-esd-supplies-inventory.html': { en: 'Industrial Vending Cabinet for Electronics, Semiconductor and ESD Supplies', zh: '电子、半导体、电气与光学制造', ar: 'تصنيع الإلكترونيات وأشباه الموصلات والكهرباء والبصريات' },
  'solutions/materials-manufacturing-inventory.html': { en: 'New Materials, Cable and Functional Materials Manufacturing', zh: '新材料、线缆与功能材料制造', ar: 'تصنيع المواد الجديدة والكابلات والمواد الوظيفية' },
  'solutions/medical-device-inventory-management.html': { en: 'Industrial Vending Machine for Medical Device Manufacturing Supplies', zh: '医疗器械与生命科学设备制造', ar: 'تصنيع الأجهزة الطبية ومعدات علوم الحياة' },
  'solutions/metal-fabrication-tool-management.html': { en: 'Hardware, Metal Fabrication and Aluminum Processing', zh: '五金、金属加工与铝材加工', ar: 'الأجهزة والتشغيل المعدني وتجهيز الألمنيوم' },
  'solutions/mold-shop-tool-management.html': { en: 'Mold, Injection Molding and Precision Tooling', zh: '模具、注塑成型与精密工具', ar: 'القوالب وصب الحقن والمعدات الدقيقة' },
  'solutions/smart-factory-inventory-management.html': { en: 'General Manufacturing and Smart Factory', zh: '通用制造与智能工厂', ar: 'التصنيع العام والمصنع الذكي' },
  'tool-vending-expansion-cabinet.html': { en: 'CNC Tool Vending Machines-sub cabinet', zh: 'CNC刀具自动售货机-副柜', ar: 'ماكينات بيع أدوات CNC - خزانة فرعية' },
  'weight-based-vending-cabinet.html': { en: 'Smart Weighing Cabinets', zh: '智能称重柜', ar: 'خزائن الوزن الذكية' },
};

function norm(v) {
  return JSON.stringify(v);
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, slug: true, name: true },
  });
  console.log(`\n=== 修正产品名（en 取自源 name_en，zh/ar 取自 zh-ar-patch）===\n`);
  console.log(`数据库产品总数：${products.length}\n`);

  let updated = 0;
  let skipped = 0;
  let nomap = 0;

  for (const p of products) {
    const target = NAME_MAP[p.slug];
    if (!target) {
      console.log(`SKIP (no map): ${p.slug}`);
      nomap += 1;
      continue;
    }
    const current = (p.name ?? {});
    const isSame =
      current.en === target.en &&
      current.zh === target.zh &&
      current.ar === target.ar;

    if (isSame) {
      skipped += 1;
      continue;
    }

    console.log(`UPDATED: ${p.slug}`);
    console.log(`   was: en="${current.en}" zh="${current.zh}" ar="${current.ar}"`);
    console.log(`   now: en="${target.en}" zh="${target.zh}" ar="${target.ar}"`);

    await prisma.product.update({
      where: { id: p.id },
      data: { name: { en: target.en, zh: target.zh, ar: target.ar } },
    });
    updated += 1;
  }

  console.log(`\n完成：更新 ${updated} 个，已正确跳过 ${skipped} 个，无映射 ${nomap} 个，共 ${products.length} 个。`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
