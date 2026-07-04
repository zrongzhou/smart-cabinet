/**
 * copy-media.ts
 * 将导入源目录中的图片按文件名去重后，拷贝到 Next 的静态目录 public/uploads/products/。
 * 仅使用 Node 内置 fs/path，不引入任何外部依赖。
 *
 * 用法：
 *   npx ts-node --compiler-options {"module":"CommonJS"} scripts/import/copy-media.ts          # 实际拷贝
 *   npx ts-node --compiler-options {"module":"CommonJS"} scripts/import/copy-media.ts --dry-run # 仅列出来源文件
 *
 * 说明：媒体源目录固定指向 scripts/import/source/media，不依赖任何外部路径。
 */
import * as fs from 'fs';
import * as path from 'path';

// __dirname 在 ts-node(CommonJS) 下指向本脚本所在目录 scripts/import
const SCRIPT_DIR = __dirname;
const SOURCE_MEDIA_DIR = path.resolve(SCRIPT_DIR, 'source', 'media');
const DEST_MEDIA_DIR = path.resolve(SCRIPT_DIR, '..', '..', 'public', 'uploads', 'products');

const isDryRun = process.argv.includes('--dry-run');

function main(): void {
  if (!fs.existsSync(SOURCE_MEDIA_DIR)) {
    console.error(`[copy-media] 源媒体目录不存在: ${SOURCE_MEDIA_DIR}`);
    process.exit(1);
  }

  // 遍历源目录，按文件名去重（相同文件名只保留第一个）
  const seen = new Set<string>();
  const files = fs.readdirSync(SOURCE_MEDIA_DIR).filter((name) => {
    const full = path.join(SOURCE_MEDIA_DIR, name);
    return fs.statSync(full).isFile();
  });

  const uniqueFiles: string[] = [];
  for (const name of files) {
    if (seen.has(name)) {
      // 同名文件已处理，跳过（去重）
      continue;
    }
    seen.add(name);
    uniqueFiles.push(name);
  }

  if (isDryRun) {
    console.log(`[copy-media] --dry-run 模式，将拷贝 ${uniqueFiles.length} 个唯一文件：`);
    for (const name of uniqueFiles) {
      console.log(`  - ${name}`);
    }
    console.log(`[copy-media] 共 ${uniqueFiles.length} 个唯一文件（来自 ${files.length} 个源条目）`);
    return;
  }

  // 实际拷贝
  if (!fs.existsSync(DEST_MEDIA_DIR)) {
    fs.mkdirSync(DEST_MEDIA_DIR, { recursive: true });
  }

  let copied = 0;
  for (const name of uniqueFiles) {
    const src = path.join(SOURCE_MEDIA_DIR, name);
    const dst = path.join(DEST_MEDIA_DIR, name);
    fs.copyFileSync(src, dst);
    copied += 1;
  }

  console.log(`已拷贝 ${copied} 个唯一文件 -> ${DEST_MEDIA_DIR}`);
}

main();
