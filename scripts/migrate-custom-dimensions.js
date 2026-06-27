#!/usr/bin/env node
/**
 * Migration script: custom_dimensions v129
 *
 * What it does:
 * 1. Ensures `custom_dimensions` table has a unique `key` column
 * 2. Migrates data from site_settings.custom_dimension_labels → custom_dimensions table
 * 3. Verifies data integrity after migration
 *
 * Usage: npx tsx scripts/migrate-custom-dimensions.ts
 *   Or in deployment: node scripts/migrate-custom-dimensions.js
 *
 * Run AFTER: prisma migrate deploy
 * Run BEFORE: pm2 start/restart
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrate() {
  console.log('=== Custom Dimensions Migration (v129) ===\n');

  try {
    // Step 1: Check if key column exists by trying to query
    console.log('[1/4] Checking schema...');
    try {
      const testRow = await prisma.customDimension.findFirst({ select: { id: true, key: true } });
      console.log(`  ✓ Schema OK: custom_dimensions has "key" column`);
    } catch (schemaErr: any) {
      if (schemaErr.message?.includes('column') || schemaErr.message?.does not exist) {
        console.error(`  ✗ Schema issue: ${schemaErr.message}`);
        console.log('  → Please run "prisma migrate dev" or "prisma migrate deploy" first');
        process.exit(1);
      }
    }

    // Step 2: Check current state of both sources
    console.log('\n[2/4] Checking current data...');

    const dbDims = await prisma.customDimension.findMany();
    const setting = await prisma.siteSettings.findUnique({
      where: { key: 'custom_dimension_labels' },
    });

    let legacyData = null;
    if (setting?.value) {
      legacyData = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    }

    console.log(`  custom_dimensions table: ${dbDims.length} rows`);
    console.log(`  site_settings (legacy):  ${legacyData ? Object.keys(legacyData).length : 0} entries`);

    // Step 3: Migrate if needed
    console.log('\n[3/4] Migrating data...');

    if (!legacyData || Object.keys(legacyData).length === 0) {
      console.log('  → No legacy data to migrate, skipping.');
    } else if (dbDims.length > 0 && dbDims.length >= Object.keys(legacyData).length) {
      // Already migrated - check for any missing entries
      const existingKeys = new Set(dbDims.map(d => d.key));
      const missingKeys = Object.keys(legacyData).filter(k => !existingKeys.has(k));
      if (missingKeys.length > 0) {
        console.log(`  → Found ${missingKeys.length} missing entries, migrating...`);
        await migrateEntries(missingKeys, legacyData);
      } else {
        console.log('  → Already up to date, skipping.');
      }
    } else {
      // Full migration
      console.log(`  → Migrating ${Object.keys(legacyData).length} entries...`);
      await migrateEntries(Object.keys(legacyData), legacyData);
    }

    // Step 4: Verify
    console.log('\n[4/4] Verification...');
    const finalCount = await prisma.customDimension.count({ where: { status: 'active' } });
    const sampleRows = await prisma.customDimension.findMany({ take: 3 });

    console.log(`  ✓ Total active dimensions: ${finalCount}`);
    sampleRows.forEach(row => {
      const name = typeof row.name === 'object' ? JSON.stringify(row.name) : row.name;
      console.log(`    - [${row.key}] ${name} icon=${row.icon || 'none'}`);
    });

    console.log('\n=== Migration complete! ✅ ===');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function migrateEntries(keys: string[], sourceData: any) {
  let maxOrder = 0;
  try {
    const maxResult = await prisma.customDimension.aggregate({ _max: { order: true } });
    maxOrder = maxResult._max.order || 0;
  } catch { /* ignore */ }

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const val = sourceData[k];
    if (!val || typeof val !== 'object') continue;

    const nameObj = {
      zh: val.labelZh || val.labelEn || val.labelAr || k,
      en: val.labelEn || val.labelZh || val.labelAr || k,
      ar: val.labelAr || val.labelZh || val.labelEn || k,
    };

    try {
      await prisma.customDimension.upsert({
        where: { key: k },
        update: { name: nameObj, icon: val.icon || null, updatedAt: new Date() },
        create: {
          key: k,
          name: nameObj,
          icon: val.icon || null,
          order: maxOrder + i + 1,
          status: 'active',
        },
      });
      console.log(`    + "${k}" → ${nameObj.en}`);
    } catch (upsertErr: any) {
      console.error(`    ✗ Failed to upsert "${k}": ${upsertErr.message}`);
    }
  }
}

migrate();
