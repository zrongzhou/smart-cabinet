// Generic image optimizer for the qtechvending / smart-cabinet Next.js sites.
// Usage: node scripts/optimize-images.mjs <repoRoot>
// - Converts raster PNG/JPG in public/ -> WebP (q90, conservative width caps, never upscale)
// - Recompresses existing WebP >500KB with q85 only if it saves >15% and keeps dimensions
// - Rewrites all source references (src + scripts + config) from .png/.jpg to the new .webp path
// - Collision-aware: if a same-basename .webp already exists, output <name>.<ext>.webp
// - Deletes originals ONLY after verifying no dangling references remain
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const repoRoot = process.argv[2];
if (!repoRoot) { console.error('usage: node optimize-images.mjs <repoRoot>'); process.exit(1); }

const RASTER_EXT = new Set(['.png', '.jpg', '.jpeg']);
const WEBP_EXT = '.webp';

function widthCapFor(rel) {
  const r = rel.toLowerCase();
  if (r.includes('/hero/') || r.includes('/factory/') || r.includes('company-building')) return 2400;
  if (r.includes('/categories/') || r.includes('/solutions/')) return 1600;
  return 1920;
}

async function walk(dir, out = []) {
  let ents;
  try { ents = await fs.readdir(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const e of ents) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', '.next', '.workbuddy'].includes(e.name)) continue;
      await walk(full, out);
    } else out.push(full);
  }
  return out;
}

const publicDir = path.join(repoRoot, 'public');
const allFiles = await walk(publicDir);

// Map oldRef (e.g. /images/x.png) -> newRef (/images/x.webp or /images/x.png.webp)
const mapping = []; // {oldFile, newFile, oldRef, newRef, reason}

async function decideTarget(srcFile) {
  const ext = path.extname(srcFile).toLowerCase();
  const baseNoExt = srcFile.slice(0, -ext.length);
  let target = baseNoExt + WEBP_EXT;
  if (target !== srcFile && (await exists(target))) {
    // collision: keep original extension in the webp name
    target = srcFile + WEBP_EXT;
  }
  return target;
}
async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }

// Convert one raster file to webp, working around Windows MAX_PATH (sharp's
// native libvips cannot open very long paths). We copy through a short temp path.
async function safeConvert(srcFile, target, cap) {
  const tmpIn = path.join(process.env.TEMP || '.', 'opt_in_' + Date.now() + '_' + Math.random().toString(36).slice(2) + path.extname(srcFile));
  const tmpOut = tmpIn + '.webp';
  await fs.copyFile(srcFile, tmpIn);
  try {
    const meta = await sharp(tmpIn).metadata();
    const resize = meta.width && meta.width > cap ? { width: cap } : undefined;
    await sharp(tmpIn)
      .rotate()
      .webp({ quality: 90, effort: 4 })
      .resize(resize || {})
      .toFile(tmpOut);
  } catch (e) {
    // Inspect raw content: SVG-as-.jpg should be rasterized; HTML junk is skipped.
    const buf = await fs.readFile(srcFile).catch(() => Buffer.alloc(0));
    const head = buf.slice(0, 256).toString('utf8').toLowerCase().replace(/^\s+/, '');
    const rel = path.relative(repoRoot, srcFile).replace(/\\/g, '/');
    if ((head.includes('<svg') || head.startsWith('<?xml')) && !head.startsWith('<!doctype')) {
      try {
        const metas = await sharp(buf).metadata().catch(() => null);
        const resize = metas && metas.width && metas.width > cap ? { width: cap } : undefined;
        await sharp(buf).webp({ quality: 90, effort: 4 }).resize(resize || {}).toFile(target);
        await fs.unlink(tmpIn).catch(() => {});
        return 'svg-content';
      } catch (e2) {
        console.log(`    SKIP svg-unreadable: ${rel}`);
        await fs.unlink(tmpIn).catch(() => {});
        return 'skip-unsupported';
      }
    }
    console.log(`    SKIP unsupported/junk: ${rel}`);
    await fs.unlink(tmpIn).catch(() => {});
    return 'skip-unsupported';
  }
  await fs.copyFile(tmpOut, target); // copy (cross-device safe); Node handles long dest path
  await fs.unlink(tmpOut).catch(() => {});
  await fs.unlink(tmpIn).catch(() => {});
}

// ---- Step 1: convert raster -> webp ----
const rasterFiles = allFiles.filter(f => RASTER_EXT.has(path.extname(f).toLowerCase()));
const convertedOriginals = [];
console.log(`\n[1] Found ${rasterFiles.length} raster (png/jpg) files to convert.`);
let converted = 0, convertSkipped = 0;
for (const f of rasterFiles) {
  const rel = path.relative(repoRoot, f).replace(/\\/g, '/');
  const cap = widthCapFor(rel);
  const target = await decideTarget(f);
  const status = await safeConvert(f, target, cap);
  if (status === 'skip-unsupported') {
    console.log(`    SKIP (unsupported/junk): ${rel}`);
    convertSkipped++;
    continue;
  }
  convertedOriginals.push(f);
  const oldRef = '/' + rel;
  const newRef = '/' + path.relative(repoRoot, target).replace(/\\/g, '/');
  mapping.push({ oldFile: f, newFile: target, oldRef, newRef, reason: status === 'svg-content' ? 'svg->webp' : 'raster->webp' });
  converted++;
  if (converted % 10 === 0) console.log(`    converted ${converted}/${rasterFiles.length}`);
}
console.log(`    done. converted=${converted}`);

// ---- Step 2: recompress existing big webp (q85) if saves >15% ----
const webpFiles = allFiles.filter(f => path.extname(f).toLowerCase() === WEBP_EXT);
console.log(`\n[2] Recompressing existing WebP >500KB with q85 (only if >15% smaller, same dims)...`);
let recompressed = 0;
for (const f of webpFiles) {
  const size = (await fs.stat(f)).size;
  if (size <= 500 * 1024) continue;
  const meta = await sharp(f).metadata();
  const tmp = f + '.q85.tmp';
  await sharp(f).webp({ quality: 85, effort: 4 }).toFile(tmp);
  const newSize = (await fs.stat(tmp)).size;
  const saving = (size - newSize) / size;
  if (saving > 0.15) {
    await fs.rename(tmp, f); // replace with q85 version
    recompressed++;
    console.log(`    recompressed ${path.relative(repoRoot, f)} : ${(size/1024).toFixed(0)}KB -> ${(newSize/1024).toFixed(0)}KB (-${(saving*100).toFixed(1)}%)`);
  } else {
    await fs.unlink(tmp);
    console.log(`    kept ${path.relative(repoRoot, f)} : q85 only -${(saving*100).toFixed(1)}% (skip)`);
  }
}
console.log(`    recompressed=${recompressed}`);

// ---- Step 3+4: rewrite source references (file-existence based), verify, delete ----
const SRC_DIRS = [path.join(repoRoot, 'src'), path.join(repoRoot, 'scripts')];
const ROOT_CONFIG = ['.env.example', 'next.config.mjs', 'next.config.js', 'tailwind.config.ts'];
const SCAN_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.md', '.mdx', '.css', '.yml', '.yaml']);
const scanTargets = [];
for (const d of SRC_DIRS) {
  if (await exists(d)) for (const f of await walk(d)) {
    if (SCAN_EXT.has(path.extname(f).toLowerCase())) scanTargets.push(f);
  }
}
for (const c of ROOT_CONFIG) {
  const p = path.join(repoRoot, c);
  if (await exists(p)) scanTargets.push(p);
}

const RASTER_RE = /\/(images|uploads)\/[^"')\s]+\.(png|jpe?g)/g;
async function webpFor(oldRef) {
  const a = oldRef.replace(/\.(png|jpe?g)$/i, '.webp');
  if (await exists(path.join(publicDir, a))) return a;
  const b = oldRef + '.webp';
  if (await exists(path.join(publicDir, b))) return b;
  return null;
}

console.log(`\n[3] Rewriting references across ${scanTargets.length} source/config files...`);
let refEdits = 0, replacements = 0;
for (const f of scanTargets) {
  let txt = await fs.readFile(f, 'utf8');
  const matches = [...txt.matchAll(RASTER_RE)];
  let changed = false;
  for (const mm of matches) {
    const oldRef = mm[0];
    const nr = await webpFor(oldRef);
    if (nr && nr !== oldRef) { txt = txt.split(oldRef).join(nr); changed = true; replacements++; }
  }
  if (changed) { await fs.writeFile(f, txt); refEdits++; }
}
console.log(`    files edited=${refEdits}, replacements=${replacements}`);

// Verification: any raster ref left that has no webp => would 404
console.log(`\n[4] Verifying no dangling references...`);
let dangling = [];
for (const f of scanTargets) {
  const txt = await fs.readFile(f, 'utf8');
  for (const mm of txt.matchAll(RASTER_RE)) {
    const oldRef = mm[0];
    if (!(await webpFor(oldRef))) dangling.push({ file: path.relative(repoRoot, f), oldRef });
  }
}
if (dangling.length) {
  console.log('    !! DANGLING REFERENCES (no webp exists):');
  for (const d of dangling) console.log(`      ${d.file}: ${d.oldRef}`);
} else {
  console.log('    no dangling raster references in source/config.');
}
// delete originals that were converted and have no dangling ref
let deleted = 0;
for (const orig of convertedOriginals) {
  const oldRef = '/' + path.relative(publicDir, orig);
  if (!dangling.some(d => d.oldRef === oldRef) && await exists(orig)) {
    await fs.unlink(orig); deleted++;
  }
}
console.log(`    originals deleted=${deleted}`);

// ---- Summary ----
console.log(`\n==== SUMMARY ====`);
console.log(`converted raster: ${converted}`);
console.log(`recompressed webp: ${recompressed}`);
console.log(`source files edited: ${refEdits}`);
console.log(`originals deleted: ${deleted}`);
console.log(`dangling refs remaining: ${dangling.length}`);
console.log('\nMapping (oldRef -> newRef):');
for (const m of mapping) console.log(`  ${m.oldRef} -> ${m.newRef}`);
