import { PrismaClient } from '@prisma/client';

// 受保护：v265 两级分类体系（4 L1 + 4 L2），绝不可删。
const PROTECTED_SLUGS = [
  'cat-cabinet', 'cat-managed-items', 'cat-industry', 'cat-others',
  'sub-cabinet-types', 'sub-managed-items', 'sub-industries', 'sub-others',
];

async function main() {
  const prisma = new PrismaClient();
  const commit = process.argv.includes('--commit');

  const cats = await prisma.category.findMany({
    include: { products: true, children: true },
  });

  // 孤儿判定：无关联产品 + 无子分类 + 不在受保护 slug 列表
  const orphans = cats.filter(
    (c) =>
      c.products.length === 0 &&
      c.children.length === 0 &&
      !PROTECTED_SLUGS.includes(c.slug),
  );

  console.log(`[cleanup] total categories: ${cats.length}`);
  console.log(
    `[cleanup] orphans to delete (0 products, 0 children, not protected): ${orphans.length}`,
  );
  orphans.forEach((c) =>
    console.log(`  - ${c.slug} | type=${c.type} | parentId=${c.parentId}`),
  );

  if (!commit) {
    console.log('[cleanup] DRY RUN — pass --commit to actually delete.');
    await prisma.$disconnect();
    return;
  }

  let n = 0;
  for (const c of orphans) {
    await prisma.category.delete({ where: { id: c.id } });
    n++;
  }
  console.log(`[cleanup] DELETED ${n} orphan categories.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
