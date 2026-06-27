import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ============ GET: List all custom dimensions ============
export async function GET() {
  try {
    const dims = await prisma.customDimension.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
    });
    return NextResponse.json(dims);
  } catch (error) {
    console.error('[custom-dimensions] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch dimensions' }, { status: 500 });
  }
}

// ============ POST/PUT: Upsert dimension labels (from legacy JSON format) ============
/**
 * Body: {
 *   dimensions: Record<string, { labelZh, labelEn, labelAr, icon }>
 *   // or single: { key, labelZh, labelEn, labelAr, icon }
 * }
 *
 * This API:
 * 1. Upserts into `custom_dimensions` table
 * 2. Also syncs to `site_settings.custom_dimension_labels` as backup
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { dimensions } = body;

    if (!dimensions || typeof dimensions !== 'object') {
      return NextResponse.json({ error: 'Invalid dimensions payload' }, { status: 400 });
    }

    let maxOrder = 0;
    try {
      const existingMax = await prisma.customDimension.aggregate({ _max: { order: true } });
      maxOrder = existingMax._max.order || 0;
    } catch { /* ignore */ }

    const upsertPromises = Object.entries(dimensions).map(async ([key, val], idx) => {
      if (!val || typeof val !== 'object') return null;
      const v = val as any;
      const nameObj = {
        zh: v.labelZh || key,
        en: v.labelEn || key,
        ar: v.labelAr || key,
      };

      return prisma.customDimension.upsert({
        where: { key },
        update: {
          name: nameObj,
          icon: v.icon || null,
          updatedAt: new Date(),
        },
        create: {
          key,
          name: nameObj,
          icon: v.icon || null,
          order: maxOrder + idx + 1,
          status: 'active',
        },
      });
    });

    await Promise.all(upsertPromises.filter(Boolean));

    // Sync to site_settings as backup (for backwards compat)
    try {
      await prisma.siteSettings.upsert({
        where: { key: 'custom_dimension_labels' },
        update: { value: dimensions as any, updatedAt: new Date() },
        create: { key: 'custom_dimension_labels', value: dimensions as any },
      });
    } catch (e) {
      console.warn('[custom-dimensions] Failed to sync to site_settings:', e);
    }

    return NextResponse.json({ success: true, count: Object.keys(dimensions).length });
  } catch (error) {
    console.error('[custom-dimensions] PUT error:', error);
    return NextResponse.json({ error: 'Failed to save dimensions' }, { status: 500 });
  }
}

// ============ DELETE: Remove a dimension by key ============
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
    }

    await prisma.customDimension.deleteMany({ where: { key } });

    // Also remove from site_settings backup
    try {
      const setting = await prisma.siteSettings.findUnique({
        where: { key: 'custom_dimension_labels' },
      });
      if (setting?.value) {
        let value = setting.value;
        if (typeof value === 'string') {
          try { value = JSON.parse(value); } catch { /* keep */ }
        }
        if (typeof value === 'object' && key in value) {
          delete (value as any)[key];
          await prisma.siteSettings.update({
            where: { key: 'custom_dimension_labels' },
            data: { value: value as any, updatedAt: new Date() },
          });
        }
      }
    } catch (e) {
      console.warn('[custom-dimensions] Failed to sync delete to site_settings:', e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[custom-dimensions] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete dimension' }, { status: 500 });
  }
}
