/**
 * V8 Placeholder image generator (ZERO dependencies).
 *
 * Uses Node's built-in zlib to encode real PNG images. The files are written
 * with a `.jpg` extension because the blog code references `.jpg` paths and
 * browsers sniff image format by content (not extension), so a PNG named
 * `.jpg` renders correctly everywhere. This avoids pulling in `sharp`/`canvas`.
 *
 * Idempotent: re-running overwrites the same files. Run with:
 *   node scripts/generate-placeholders.mjs
 */

import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../public/images/blog');

// ---- Brand gradient palettes (top-left color -> bottom-right color) ----
const PALETTES = [
  ['#1e3a8a', '#06b6d4'], // deep blue -> cyan
  ['#0f766e', '#22d3ee'], // teal -> cyan
  ['#7c3aed', '#38bdf8'], // violet -> sky
  ['#b45309', '#f59e0b'], // amber
  ['#0ea5e9', '#6366f1'], // sky -> indigo
  ['#be185d', '#fb7185'], // pink
  ['#15803d', '#4ade80'], // green
  ['#1d4ed8', '#60a5fa'], // blue
];

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ---- Minimal PNG encoder ----
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    let c = (crc ^ buf[i]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, pixels) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Scanlines: each row prefixed with filter byte 0
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  const idat = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function makeGradient(name, width = 800, height = 450) {
  const palette = PALETTES[hashString(name) % PALETTES.length];
  const [r1, g1, b1] = hexToRgb(palette[0]);
  const [r2, g2, b2] = hexToRgb(palette[1]);
  const pixels = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Diagonal gradient factor 0..1
      const t = (x / width) * 0.6 + (y / height) * 0.4;
      const idx = (y * width + x) * 3;
      pixels[idx] = lerp(r1, r2, t);
      pixels[idx + 1] = lerp(g1, g2, t);
      pixels[idx + 2] = lerp(b1, b2, t);
    }
  }
  return encodePng(width, height, pixels);
}

// ---- Target files: V7 covers + every referenced blog image ----
const TARGETS = [
  'vending-machine-trends-2026',
  'cnc-tool-inventory-guide',
  'ai-industry-4-0',
  'cnc-machining-roi',
  'rfid-tool-tracking',
  'smart-cabinet-warehouse',
  'ppe-safety-equipment',
  'digital-transformation',
  'roi-cost-analysis',
  'iot-mes-integration',
  'buying-guide-smart-cabinet',
  'aerospace-fod-prevention',
  'future-smart-factory',
  'best-practice',
  'industry-trends',
  'case-study',
  'technical-guide',
  'use-case',
  'customer-story',
  'general',
];

function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  let count = 0;
  for (const name of TARGETS) {
    const file = path.join(OUT_DIR, `${name}.jpg`);
    if (fs.existsSync(file)) continue; // idempotent: don't overwrite hand-made art
    fs.writeFileSync(file, makeGradient(name));
    count++;
  }
  console.log(`[placeholders] generated ${count} blog placeholder image(s) in ${OUT_DIR}`);
}

main();
