/**
 * rebuild-categories.ts
 * 按用户指定的 4 大类 + 24 叶子分类重建分类体系，并把 26 个产品重新归属。
 * 运行：npx ts-node --compiler-options {"module":"CommonJS"} scripts/import/rebuild-categories.ts
 * 幂等：先清空所有 categories，再重建。
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 4 大类(L1) + 24 叶子(L2)，每个叶子带产品 slug 列表
const STRUCTURE = [
  {
    l1: { slug: 'cat-cabinet', en: 'By cabinets types', zh: '按柜体类型', ar: 'حسب أنواع الخزائن' },
    leaves: [
      { slug: 'sub-cnc-tool-vending-machines', en: 'CNC Tool Vending Machines', zh: 'CNC 刀具自动售货机', ar: 'ماكينات توزيع أدوات CNC', products: ['tool-vending-machine-cnc-tools.html'] },
      { slug: 'sub-cnc-tool-vending-sub-cabinet', en: 'CNC Tool Vending Machines-sub cabinet', zh: 'CNC 刀具自动售货机-副柜', ar: 'ماكينات توزيع أدوات CNC - خزانة فرعية', products: ['tool-vending-expansion-cabinet.html'] },
      { slug: 'sub-smart-tool-locker-cabinets', en: 'Smart Tool locker Cabinets', zh: '智能刀具柜', ar: 'خزائن الأدوات الذكية', products: ['smart-tool-locker-cabinet.html'] },
      { slug: 'sub-modular-industrial-vending-machines', en: 'Modular Industrial Vending Machines', zh: '模块化工业自动售货机', ar: 'ماكينات التوزيع الصناعية المعيارية', products: ['modular-industrial-vending-machine.html'] },
      { slug: 'sub-smart-drawer-cabinets', en: 'Smart Drawer Cabinets', zh: '智能抽屉柜', ar: 'خزائن الأدراج الذكية', products: ['smart-drawer-tool-cabinet.html'] },
      { slug: 'sub-smart-weighing-cabinets', en: 'Smart Weighing Cabinets', zh: '智能称重柜', ar: 'خزائن الوزن الذكية', products: ['weight-based-vending-cabinet.html'] },
      { slug: 'sub-micro-warehousing-cabinets', en: 'Micro Warehousing Cabinets', zh: '微型仓储柜', ar: 'خزائن التخزين المصغرة', products: ['automated-tool-storage-system.html'] },
      { slug: 'sub-rfid-smart-cabinets', en: 'RFID Smart Cabinets', zh: 'RFID 智能柜', ar: 'خزائن RFID الذكية', products: ['rfid-asset-tracking-cabinet.html'] },
    ],
  },
  {
    l1: { slug: 'cat-managed-items', en: 'By Managed items', zh: '按管理物料', ar: 'حسب المواد المُدارة' },
    leaves: [
      { slug: 'sub-cnc-tool-management-ppe', en: 'CNC Tool Management / PPE & Safety Supplies', zh: 'CNC 刀具管理 / 劳保安全防护用品', ar: 'إدارة أدوات CNC / مستلزمات السلامة PPE', products: ['applications/tool-vending-machine-cnc-tools.html', 'applications/ppe-vending-machine.html'] },
      { slug: 'sub-fasteners-documents', en: 'Fasteners & Consumables / Documents & Archives', zh: '紧固件耗材 / 文档档案', ar: 'المثبتات والمستهلكات / الوثائق والأرشيف', products: ['applications/fastener-vending-machine.html', 'applications/secure-document-storage-cabinet.html'] },
      { slug: 'sub-employee-personal-storage', en: 'Employee Personal Storage', zh: '员工个人储物', ar: 'تخزين الموظفين الشخصي', products: ['applications/smart-locker-system.html'] },
      { slug: 'sub-reusable-tools-assets', en: 'Reusable Tools & Assets', zh: '可复用工具与资产', ar: 'الأدوات والأصول القابلة لإعادة الاستخدام', products: ['applications/rfid-tool-tracking-cabinet.html'] },
      { slug: 'sub-office-supplies', en: 'Office Supplies', zh: '办公用品', ar: 'مستلزمات المكتب', products: ['applications/office-supply-vending-machine.html'] },
      { slug: 'sub-food-pickup-meal-collection', en: 'Food Pickup and Meal Collection', zh: '取餐与餐食收集', ar: 'استلام الوجبات وجمع الوجبات', products: ['applications/food-pickup-locker.html'] },
      { slug: 'sub-chemical-liquid-management', en: 'Chemical Liquid Management', zh: '化学品液体管理', ar: 'إدارة السوائل الكيميائية', products: ['applications/refrigerated-chemical-storage-cabinet.html'] },
    ],
  },
  {
    l1: { slug: 'cat-industry', en: 'By industries', zh: '按行业', ar: 'حسب الصناعات' },
    leaves: [
      { slug: 'sub-cnc-machining', en: 'CNC Machining and Precision Parts Manufacturing', zh: 'CNC 加工与精密零件制造', ar: 'التشغيل CNC وتصنيع القطع الدقيقة', products: ['solutions/cnc-machining-tool-management.html'] },
      { slug: 'sub-general-manufacturing', en: 'General Manufacturing and Smart Factory', zh: '通用制造与智能工厂', ar: 'التصنيع العام والمصنع الذكي', products: ['solutions/smart-factory-inventory-management.html'] },
      { slug: 'sub-metal-fabrication', en: 'Hardware, Metal Fabrication and Aluminum Processing', zh: '五金、金属加工与铝材处理', ar: 'الأجهزة والتصنيع المعدني ومعالجة الألمنيوم', products: ['solutions/metal-fabrication-tool-management.html'] },
      { slug: 'sub-mold-tooling', en: 'Mold, Injection Molding and Precision Tooling', zh: '模具、注塑与精密工具', ar: 'القوالب والحقن وأدوات الدقة', products: ['solutions/mold-shop-tool-management.html'] },
      { slug: 'sub-electronics-manufacturing', en: 'Electronics, Semiconductor, Electrical and Optical Manufacturing', zh: '电子、半导体、电气与光学制造', ar: 'الإلكترونيات وأشباه الموصلات والكهرباء والبصريات', products: ['solutions/electronics-esd-supplies-inventory.html'] },
      { slug: 'sub-automotive-manufacturing', en: 'Automotive and EV Components Manufacturing', zh: '汽车与电动汽车零部件制造', ar: 'تصنيع مكونات السيارات والمركبات الكهربائية', products: ['solutions/automotive-ev-parts-inventory.html'] },
      { slug: 'sub-medical-device', en: 'Medical Device and Life Science Equipment Manufacturing', zh: '医疗器械与生命科学设备制造', ar: 'تصنيع الأجهزة الطبية ومعدات علوم الحياة', products: ['solutions/medical-device-inventory-management.html'] },
      { slug: 'sub-new-materials', en: 'New Materials, Cable and Functional Materials Manufacturing', zh: '新材料、线缆与功能材料制造', ar: 'المواد الجديدة والكابلات والمواد الوظيفية', products: ['solutions/materials-manufacturing-inventory.html'] },
    ],
  },
  {
    l1: { slug: 'cat-others', en: 'Others', zh: '其他', ar: 'أخرى' },
    leaves: [
      { slug: 'sub-customized', en: 'customized', zh: '定制方案', ar: 'حلول مخصصة', products: ['solutions/custom-industrial-vending-machine.html'] },
    ],
  },
];

// L1 type 固定
const L1_TYPE = 'product';
// L2 type 按维度
const L2_TYPE_MAP: Record<string, string> = {
  'cat-cabinet': 'cabinet-type',
  'cat-managed-items': 'managed-items',
  'cat-industry': 'industry',
  'cat-others': 'custom-solution',
};

async function main() {
  console.log('1) Deleting existing categories (cascade clears join table)...');
  const del = await prisma.category.deleteMany({});
  console.log(`   deleted ${del.count} categories`);

  console.log('2) Creating 4 L1 + 24 L2 categories...');
  let leafCount = 0;
  for (const group of STRUCTURE) {
    const l1 = await prisma.category.create({
      data: {
        slug: group.l1.slug,
        name: { en: group.l1.en, zh: group.l1.zh, ar: group.l1.ar },
        type: L1_TYPE,
      },
    });
    console.log(`   L1 created: ${group.l1.slug}`);
    for (const leaf of group.leaves) {
      await prisma.category.create({
        data: {
          slug: leaf.slug,
          name: { en: leaf.en, zh: leaf.zh, ar: leaf.ar },
          type: L2_TYPE_MAP[group.l1.slug],
          parentId: l1.id,
        },
      });
      leafCount++;
    }
  }
  console.log(`   created ${leafCount} L2 leaves`);

  console.log('3) Assigning products to their leaf categories...');
  let assigned = 0;
  let missing = 0;
  for (const group of STRUCTURE) {
    for (const leaf of group.leaves) {
      const leafRec = await prisma.category.findUnique({ where: { slug: leaf.slug } });
      if (!leafRec) { console.error(`   !! leaf not found: ${leaf.slug}`); continue; }
      for (const slug of leaf.products) {
        const prod = await prisma.product.findUnique({ where: { slug } });
        if (!prod) { console.warn(`   !! product not found: ${slug}`); missing++; continue; }
        await prisma.product.update({
          where: { slug },
          data: { categories: { connect: { id: leafRec.id } } },
        });
        assigned++;
      }
    }
  }
  console.log(`   assigned ${assigned} product-category links, ${missing} missing products`);

  // 统计校验
  const all = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });
  console.log('\n4) Verification:');
  for (const c of all) {
    if (c.parentId === null) {
      const nm = (c.name as any) || {};
      console.log(`   [L1] ${c.slug} (${nm.en})`);
      for (const child of all.filter((x) => x.parentId === c.id)) {
        const cm = (child.name as any) || {};
        console.log(`        - ${child.slug} (${cm.en}) : ${child._count.products} products`);
      }
    }
  }
  const totalProducts = await prisma.product.count();
  const linked = await prisma.product.count({ where: { categories: { some: {} } } });
  console.log(`\nTotal products: ${totalProducts}, linked to a category: ${linked}`);

  // 5) Data-integrity warning: detect products whose English name was (incorrectly)
  // set to an L2 sub-category name. This script only rebuilds the Category table and
  // the _CategoryToProduct join table — it never touches product.name — so any such
  // mismatch is pre-existing data corruption (likely from an earlier import/migration).
  // We do NOT auto-fix; we only print a WARNING list for human review.
  console.log('\n5) Data-integrity check (product name vs L2 sub-category name):');
  const l2Cats = await prisma.category.findMany({ where: { parentId: { not: null } } });
  const l2EnByName = new Map<string, string>();
  for (const c of l2Cats) {
    const nm = (c.name as any) || {};
    const en = (nm.en || '').trim().toLowerCase();
    if (en) l2EnByName.set(en, c.slug);
  }
  const allProducts = await prisma.product.findMany({ include: { categories: true } });
  const warnings: { id: string; slug: string; name: string; matchedCategory: string }[] = [];
  for (const p of allProducts) {
    const nm = (p.name as any) || {};
    const en = (nm.en || '').trim().toLowerCase();
    if (en && l2EnByName.has(en)) {
      warnings.push({ id: p.id, slug: p.slug, name: nm.en || '', matchedCategory: l2EnByName.get(en) || '' });
    }
  }
  if (warnings.length === 0) {
    console.log('   OK — no product name equals any L2 sub-category name.');
  } else {
    console.warn(`   ⚠ WARNING: ${warnings.length} product(s) have an English name identical to an L2 sub-category name:`);
    for (const w of warnings) {
      console.warn(`     - product id=${w.id} slug=${w.slug} name="${w.name}" matched L2 category="${w.matchedCategory}"`);
    }
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
