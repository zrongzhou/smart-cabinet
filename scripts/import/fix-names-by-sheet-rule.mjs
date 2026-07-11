// 按表格规则修正产品名：
// - CAB 表(sheet0)：name_en 已是产品名，不动。
// - MAT/IND/OTH 表：name_en 是分类名，产品名在 title_en。改用 title_en 作 en。
// - zh/ar：为 title_en 的翻译（best-effort，待用户从表格核对）
// 仅改 name 字段。OTH-001 已单独修过，这里幂等重设保持一致。
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();
const SRC = 'scripts/import/source/products_data.json';
const data = JSON.parse(fs.readFileSync(SRC, 'utf-8'));

function toSlug(url) {
  return String(url).replace(/^\/+/, '').replace(/^products\//i, '');
}

// slug -> {zh, ar} 翻译映射（基于 title_en）
const ZH_AR = {
  'applications/tool-vending-machine-cnc-tools.html': { zh: '用于切削刀具、刀片、立铣刀和丝锥的 CNC 刀具自动售货机', ar: 'ماكينة بيع أدوات CNC للأدوات القاطعة والقاطعات ومرازل الأطراف والصولبات' },
  'applications/ppe-vending-machine.html': { zh: '用于工业安全用品与员工发放的 PPE 自动售货机', ar: 'ماكينة بيع معدات الوقاية الشخصية للإمدادات الصناعية وتوزيع الموظفين' },
  'applications/fastener-vending-machine.html': { zh: '用于螺丝、螺母、螺栓及 MRO 耗材的紧固件自动售货柜', ar: 'خزانة بيع مسامير للبراغي والصواميل والبراغي والمستهلكات التشغيلية' },
  'applications/secure-document-storage-cabinet.html': { zh: '用于文档管理、档案存储与文件追踪的智能文件柜', ar: 'خزانة ملفات ذكية لإدارة المستندات وتخزين الأرشيف وتتبع الملفات' },
  'applications/smart-locker-system.html': { zh: '用于员工储物柜、办公室与职场存储的智能储物柜系统', ar: 'نظام خزائن ذكية للخزائن الموظفين والمكاتب وتخزين مكان العمل' },
  'applications/rfid-tool-tracking-cabinet.html': { zh: '用于可循环工具、量具、夹具与资产管控的刀具追踪系统', ar: 'نظام تتبع الأدوات للأدوات القابلة لإعادة الاستخدام والمقاييس والتركيبات ومراقبة الأصول' },
  'applications/office-supply-vending-machine.html': { zh: '用于文具、IT 用品与职场耗材的办公用品自动售货机', ar: 'ماكينة بيع مستلزمات المكتب للقرطاسية وإمدادات تكنولوجيا المعلومات والمستهلكات المكتبية' },
  'applications/food-pickup-locker.html': { zh: '用于外卖、取餐与办公楼的智能取餐柜', ar: 'خزانة استلام طعام ذكية للطلبات الخارجية وجمع الوجبات والمباني المكتبية' },
  'applications/refrigerated-chemical-storage-cabinet.html': { zh: '用于实验室试剂、液体瓶与样本的冷藏化学品存储柜', ar: 'خزانة تخزين كيميائية مبردة لكواشف المختبر والزجاجات السائلة والعينات' },
  'solutions/cnc-machining-tool-management.html': { zh: '面向 CNC 加工与精密零件制造的刀具自动售货机方案', ar: 'حل ماكينة بيع أدوات CNC لتشغيل CNC وتصنيع القطع الدقيقة' },
  'solutions/smart-factory-inventory-management.html': { zh: '面向智能工厂库存管理的工业自动售货机方案', ar: 'حل ماكينة بيع صناعية لإدارة مخزون المصنع الذكي' },
  'solutions/metal-fabrication-tool-management.html': { zh: '用于金属加工工具、紧固件与 PPE 的工业自动售货柜', ar: 'خزانة بيع صناعية لأدوات تشكيل المعادن والمثبتات ومعدات الوقاية' },
  'solutions/mold-shop-tool-management.html': { zh: '用于模具车间、注塑成型与备件的智能刀具柜方案', ar: 'حل خزانة أدوات ذكية لورش القوالب والحقن وقطع الغيار' },
  'solutions/electronics-esd-supplies-inventory.html': { zh: '用于电子、半导体与 ESD 用品管理的智能柜方案', ar: 'حل خزانة ذكية لإدارة الإلكترونيات وأشباه الموصلات وإمدادات ESD' },
  'solutions/automotive-ev-parts-inventory.html': { zh: '面向汽车与电动汽车零部件制造的工业自动售货机方案', ar: 'حل ماكينة بيع صناعية لتصنيع مكونات السيارات والسيارات الكهربائية' },
  'solutions/medical-device-inventory-management.html': { zh: '用于医疗器械制造用品与 PPE 的智能柜方案', ar: 'حل خزانة ذكية لمستلزمات تصنيع الأجهزة الطبية ومعدات الوقاية' },
  'solutions/materials-manufacturing-inventory.html': { zh: '用于新材料、线缆与功能材料制造的智能柜方案', ar: 'حل خزانة ذكية لتصنيع المواد الجديدة والكابلات والمواد الوظيفية' },
  'solutions/custom-industrial-vending-machine.html': { zh: '定制化工业自动售货机与智能柜解决方案', ar: 'حلول الخزائن الذكية وماكينات البيع الصناعية المخصصة' },
};

let updated = 0, skipped = 0;
for (let i = 1; i < data.sheets.length; i++) { // 跳过 sheet0 (CAB)
  for (const p of data.sheets[i].products) {
    const slug = toSlug(p.url);
    const en = (p.title_en || '').trim();
    const tr = ZH_AR[slug];
    if (!en || !tr) {
      console.log(`SKIP (missing data): ${slug}`);
      skipped++;
      continue;
    }
    const product = await prisma.product.findFirst({ where: { slug } });
    if (!product) {
      console.log(`SKIP (not in DB): ${slug}`);
      skipped++;
      continue;
    }
    const name = { en, zh: tr.zh, ar: tr.ar };
    const cur = product.name || {};
    const same = cur.en === name.en && cur.zh === name.zh && cur.ar === name.ar;
    if (same) {
      console.log(`OK (already): ${slug} -> ${en}`);
      continue;
    }
    await prisma.product.update({ where: { id: product.id }, data: { name } });
    console.log(`UPDATED: ${slug} -> en="${en}"`);
    updated++;
  }
}
console.log(`\n完成：更新 ${updated} 个，跳过 ${skipped} 个（CAB 表未动）。`);
await prisma.$disconnect();
