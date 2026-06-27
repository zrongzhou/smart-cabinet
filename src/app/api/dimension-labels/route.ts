import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/dimension-labels
 * Returns custom dimension labels from `custom_dimensions` table (v129+)
 * Falls back to `site_settings.custom_dimension_labels` for backwards compatibility
 * Output format: { "robots": { labelZh: "机器人", labelEn: "Robotics", ... }, ... }
 */
export async function GET() {
  try {
    // Primary source: custom_dimensions table (v129)
    const dims = await prisma.customDimension.findMany({
      where: { status: 'active' },
      orderBy: { order: 'asc' }
    });

    if (dims && dims.length > 0) {
      // Convert DB rows to the legacy JSON format for frontend compatibility
      const result: Record<string, any> = {};
      dims.forEach(dim => {
        let nameObj: Record<string, any> = {};
        const rawName = dim.name;
        // Handle stringified JSON (defensive)
        if (typeof rawName === 'string') {
          try { nameObj = JSON.parse(rawName); } catch { nameObj = {}; }
        } else if (rawName && typeof rawName === 'object' && !Array.isArray(rawName)) {
          nameObj = rawName as Record<string, any>;
        }

        result[dim.key] = {
          labelZh: (nameObj.zh as string) || '',
          labelEn: (nameObj.en as string) || '',
          labelAr: (nameObj.ar as string) || '',
          icon: dim.icon || '',
        };
      });
      return NextResponse.json(result);
    }

    // Fallback: read from site_settings (legacy data not yet migrated)
    const setting = await prisma.siteSettings.findUnique({
      where: { key: 'custom_dimension_labels' },
    });

    if (!setting?.value) {
      return NextResponse.json({});
    }

    let value = setting.value;
    if (typeof value === 'string') {
      try { value = JSON.parse(value); } catch { /* keep as-is */ }
    }

    return NextResponse.json(value);
  } catch (error) {
    console.error('Error fetching dimension labels:', error);
    return NextResponse.json({}, { status: 500 });
  }
  // NOTE: Do NOT call prisma.$disconnect() here — Next.js reuses Prisma connections
  // across requests, and disconnecting causes "Engine is not yet connected" errors
}
