import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper: Clean string value (remove surrounding quotes)
function cleanStringValue(val: any): string {
  if (typeof val !== 'string') return String(val || '');
  let cleaned = val.trim();
  while (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

// 防止静态生成时连接数据库
export const dynamic = 'force-dynamic';

/**
 * GET /api/settings
 * 获取网站设置（公开接口）
 * 将数据库中的 i18n 对象 {zh,en,ar} 平铺为字符串（优先取 en，其次 zh，其次 ar）
 */
export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.siteSettings.findMany();
    
    // 转换为 key-value 对象
    const result: Record<string, any> = {};
    settings.forEach(s => {
      let v: any = s.value;

      // Clean string values to remove surrounding quotes
      if (typeof v === 'string') {
        v = cleanStringValue(v);
        // If the cleaned value looks like a JSON array (e.g., contactEmails stored as JSON)
        if (v.trim().startsWith('[')) {
          try { v = JSON.parse(v); } catch { /* keep as string */ }
        }
      } else if (v && typeof v === 'object' && !Array.isArray(v)) {
        // i18n 对象：平铺为字符串（优先 en），同时清洗每个语言字段
        const obj = v as Record<string, any>;
        Object.keys(obj).forEach(k => {
          if (typeof obj[k] === 'string') {
            obj[k] = cleanStringValue(obj[k]);
          }
        });
        v = obj;
      }

      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const obj = v as Record<string, any>;
        result[s.key] = String(obj.en ?? obj.zh ?? obj.ar ?? '');
      } else if (Array.isArray(v)) {
        // Preserve arrays (e.g., contactEmails)
        result[s.key] = v;
      } else {
        result[s.key] = String(v ?? '');
      }
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
