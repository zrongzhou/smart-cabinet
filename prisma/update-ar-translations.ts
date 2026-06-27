/**
 * Update Arabic translations for all categories
 * Run with: npx ts-node --compiler-options {"module":"CommonJS"} prisma/update-ar-translations.ts
 * Or add to package.json scripts: "update-ar": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/update-ar-translations.ts"
 */

import { PrismaClient, Prisma } from '@prisma/client';
import categoriesData from '../src/data/categories';

const prisma = new PrismaClient();

interface JsonName {
  en: string;
  zh: string;
  ar: string;
}

interface JsonDescription {
  en: string;
  zh: string;
  ar: string;
}

function isJsonName(obj: any): obj is JsonName {
  return obj && typeof obj === 'object' && 'en' in obj && 'zh' in obj;
}

function isJsonDescription(obj: any): obj is JsonDescription {
  return obj && typeof obj === 'object';
}

async function main() {
  console.log('🔄 Starting Arabic translation update...');

  // Get all categories from database
  const dbCategories = await prisma.category.findMany();
  console.log(`📊 Found ${dbCategories.length} categories in database`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const dbCat of dbCategories) {
    // Find matching category in our data (by slug or English name)
    const match = categoriesData.find(
      (c) =>
        c.slug === dbCat.slug ||
        (isJsonName(c.name) && isJsonName(dbCat.name) && c.name.en === (dbCat.name as any).en)
    );

    if (!match) {
      console.log(`⚠️  No match found for category: ${dbCat.slug}`);
      skippedCount++;
      continue;
    }

    // Get current name and description from DB
    const currentName = dbCat.name as any as JsonName;
    const currentDesc = dbCat.description as any as JsonDescription | null;

    // Check if Arabic translation already exists and is not empty
    const arNameInDb = currentName?.ar || '';
    const arDescInDb = currentDesc?.ar || '';

    const arNameInSource = match.name.ar || '';
    const arDescInSource = match.description?.ar || '';

    let needsUpdate = false;
    const updatedName: JsonName = { ...currentName };
    const updatedDesc: JsonDescription | null = currentDesc ? { ...currentDesc } : null;

    // Update Arabic name if missing or empty in DB but present in source
    if (arNameInSource && !arNameInDb) {
      updatedName.ar = arNameInSource;
      needsUpdate = true;
      console.log(`  ✏️  Updating Arabic name for: ${match.slug}`);
    }

    // Update Arabic description if missing or empty in DB but present in source
    if (arDescInSource && !arDescInDb) {
      if (updatedDesc) {
        updatedDesc.ar = arDescInSource;
        needsUpdate = true;
        console.log(`  ✏️  Updating Arabic description for: ${match.slug}`);
      }
    }

    if (needsUpdate) {
      await prisma.category.update({
        where: { id: dbCat.id },
        data: {
          name: updatedName as any,
          description: updatedDesc as any,
        },
      });
      updatedCount++;
      console.log(`  ✅ Updated category: ${match.slug}`);
    } else {
      console.log(`  ⏭️  Skipping (already has Arabic): ${match.slug}`);
      skippedCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  ✅ Updated: ${updatedCount}`);
  console.log(`  ⏭️  Skipped: ${skippedCount}`);
  console.log(`  📝 Total: ${dbCategories.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error updating Arabic translations:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
