/**
 * seed-blog-translations.ts
 * --------------------------
 * 回填博客文章的中/阿正文（zh / ar），保留已有英文（en）原文。
 *
 * 数据来源：scripts/seed/source/blog-translations.json
 *   结构：[{ slug: string, content: { zh: string, ar: string } }, ...]
 *   注意：slug 含 ".html" 后缀，需与 blog_posts.slug 精确匹配。
 *
 * 行为：
 *   - 逐条 update；content 以现有对象展开（...existing），仅覆盖 zh / ar，保留 en 及其它已有字段。
 *   - 每条 try/catch，幂等（重复运行结果一致）；控制台逐条输出结果。
 *
 * 运行：npm run seed:blog-translations
 *   说明：脚本从项目根目录执行（npm script 默认 cwd 为项目根），
 *   故素材路径按 process.cwd() 解析。
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TranslationEntry {
  slug: string;
  content: {
    zh: string;
    ar: string;
    en?: string;
  };
}

/** 读取并校验翻译素材。 */
function loadEntries(): TranslationEntry[] {
  const file = path.join(process.cwd(), 'scripts', 'seed', 'source', 'blog-translations.json');
  if (!fs.existsSync(file)) {
    throw new Error(`未找到翻译素材文件：${file}`);
  }
  const raw = fs.readFileSync(file, 'utf-8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('翻译素材必须是数组');
  }
  return parsed as TranslationEntry[];
}

async function main(): Promise<void> {
  const entries = loadEntries();
  console.log(`[seed:blog-translations] 共 ${entries.length} 篇待回填`);

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of entries) {
    const slug = entry.slug;
    try {
      const existing = await prisma.blogPost.findUnique({
        where: { slug },
        select: { id: true, slug: true, content: true },
      });

      if (!existing) {
        console.log(`[skip] 未找到博客（slug=${slug}）`);
        skipped += 1;
        continue;
      }

      // 以现有 content 展开，仅覆盖 zh / ar，保留 en 及其它已有字段。
      const existingContent: Record<string, unknown> = (existing.content as Record<string, unknown>) ?? {};
      const nextContent = {
        ...existingContent,
        zh: entry.content.zh,
        ar: entry.content.ar,
      };

      await prisma.blogPost.update({
        where: { slug },
        data: { content: nextContent },
      });

      const keptEn = typeof existingContent.en === 'string' && existingContent.en.length > 0;
      console.log(`[ok] 已回填（slug=${slug}）en 保留=${keptEn ? 'Y' : 'N'}`);
      ok += 1;
    } catch (err: any) {
      console.error(`[fail] 回填失败（slug=${slug}）：${err?.message || err}`);
      failed += 1;
    }
  }

  console.log(`[done] ok=${ok}, skipped=${skipped}, failed=${failed}`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error('[fatal]', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
