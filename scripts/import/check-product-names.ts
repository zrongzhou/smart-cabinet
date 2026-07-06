import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null, status: 'active' },
  });
  // L2 子分类的 en 名集合
  const l2Cats = categories.filter((c: any) => c.parentId != null);
  const l2Names = new Set(l2Cats.map((c: any) => (c.name as any).en as string));
  const l2BySlug: Record<string, string> = {};
  l2Cats.forEach((c: any) => { l2BySlug[c.slug] = (c.name as any).en; });

  const products = await prisma.product.findMany({
    where: { deletedAt: null, status: 'active' },
  });

  console.log(`\n=== 产品名校验 ===`);
  console.log(`L2 子分类数: ${l2Cats.length}, 产品数: ${products.length}`);

  const warnings = products.filter((p: any) => l2Names.has((p.name as any).en as string));
  console.log(`⚠️  产品英文名恰好等于某 L2 分类名的: ${warnings.length} 个\n`);
  warnings.forEach((p: any) => {
    console.log(`  - id=${p.id}`);
    console.log(`    slug : ${p.slug}`);
    console.log(`    en   : ${(p.name as any).en}`);
    console.log(`    zh   : ${(p.name as any).zh}`);
    console.log(`    ar   : ${(p.name as any).ar}`);
    console.log(`    sku  : ${p.sku}`);
    console.log('');
  });

  // 同时列出所有产品的 en 名，便于核对
  console.log(`=== 全部产品当前 en 名（供核对） ===`);
  products.forEach((p: any) => {
    console.log(`  ${p.slug}  ->  ${(p.name as any).en}`);
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
