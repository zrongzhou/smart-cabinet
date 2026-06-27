import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

const prisma = new PrismaClient();

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Helper to clean quoted strings (used by both GET and PUT)
const cleanQuotedString = (v: any): any => {
  if (typeof v === 'string') {
    // Handle JSON-encoded string: '"Smart Cabinet"' → 'Smart Cabinet'
    if (v.startsWith('"') && v.endsWith('"') && v.length > 1) {
      try {
        const parsed = JSON.parse(v);
        return typeof parsed === 'string' ? parsed : v;
      } catch {
        // Fallback: just remove outer quotes
        return v.slice(1, -1);
      }
    }
  }
  return v;
};

// GET /api/admin/settings - Fetch all settings (flattened)
export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const settings = await prisma.siteSettings.findMany();
    const result: Record<string, any> = {};
    settings.forEach(s => {
      let v = s.value;

      // Clean quoted strings first
      v = cleanQuotedString(v);

      // If v is a string that looks like JSON, try to parse it (handle double-encoded JSON)
      if (typeof v === 'string' && (v.trim().startsWith('{') || v.trim().startsWith('['))) {
        try { v = JSON.parse(v); } catch {}
      }

      // If v is an object (after parsing), extract a string value
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        if (v.zh && typeof v.zh === 'string' && v.zh !== '') result[s.key] = v.zh;
        else if (v.en && typeof v.en === 'string') result[s.key] = v.en;
        else if (v.ar && typeof v.ar === 'string') result[s.key] = v.ar;
        else result[s.key] = '';  // empty object or all-empty values
      } else if (Array.isArray(v)) {
        // JSON array (e.g., contactEmails) — preserve as array
        result[s.key] = v;
      } else if (typeof v === 'string') {
        result[s.key] = v;
      } else {
        result[s.key] = String(v || '');
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/admin/settings - Update settings (supports single or batch update)
export async function PUT(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    
    // Helper to clean quoted strings (reuse the shared helper)
    const cleanValue = (v: any): any => cleanQuotedString(v);
    
    // Check if it's a single key-value update or batch update
    if (body.key !== undefined && body.value !== undefined) {
      // Single setting update
      const { key, value } = body;
      const cleanedValue = cleanValue(value);
      
      await prisma.siteSettings.upsert({
        where: { key },
        update: { value: cleanedValue as any },
        create: { key, value: cleanedValue as any },
      });
    } else if (typeof body === 'object' && !Array.isArray(body)) {
      // Batch update
      const updates = Object.entries(body).map(([key, value]) => {
        const cleanedValue = cleanValue(value);
        return prisma.siteSettings.upsert({
          where: { key },
          update: { value: cleanedValue as any },
          create: { key, value: cleanedValue as any },
        });
      });
      await Promise.all(updates);
    } else {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
