// Dedup pass: for any file ending in .jpg.webp / .jpeg.webp / .png.webp,
// keep only the canonical <stem>.webp (delete the variant if canonical exists,
// otherwise rename variant -> canonical). Run from repo root.
import { promises as fs } from 'fs';
import path from 'path';

const repoRoot = process.argv[2];
const publicDir = path.join(repoRoot, 'public');

async function walk(dir, out = []) {
  let ents;
  try { ents = await fs.readdir(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const e of ents) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', '.next'].includes(e.name)) continue;
      await walk(full, out);
    } else out.push(full);
  }
  return out;
}

const all = await walk(publicDir);
const variants = all.filter(f => /\.(jpg|jpeg|png)\.webp$/i.test(f));
let deleted = 0, renamed = 0;
for (const v of variants) {
  const stem = v.replace(/\.(jpg|jpeg|png)\.webp$/i, '');
  const canon = stem + '.webp';
  if (await fs.access(canon).then(() => true).catch(() => false)) {
    await fs.unlink(v);
    deleted++;
    console.log('DEL variant: ' + path.relative(repoRoot, v));
  } else {
    await fs.rename(v, canon);
    renamed++;
    console.log('REN -> ' + path.relative(repoRoot, canon));
  }
}
console.log(`\ndedup done. deleted=${deleted}, renamed=${renamed}`);
