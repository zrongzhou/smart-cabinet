// 预解析脚本：把 products_data.json 转为按 sheet 分组的"翻译输入"文件。
// 输出到 scripts/import/translations/_input_sheetN.json
// 每个产品含：slug, name_en, seoTitle_en, description_en, features_en[], specs_en, faqs[{q_en,a_en}]
const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;
const SOURCE_DIR = SCRIPT_DIR;
const OUT_DIR = path.resolve(SCRIPT_DIR, '..', 'translations');

const PRODUCTS_FILE = path.join(SOURCE_DIR, 'products_data.json');
const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));

// 与 seed-products.ts 完全一致的 slug 规则
function toSlug(url) {
  return String(url).replace(/^\/+/, '').replace(/^products\//i, '');
}
function parseFeatures(raw) {
  if (!raw) return [];
  return String(raw)
    .split('\n')
    .map((l) => l.replace(/^[•·\-\s]+/, '').trim())
    .filter((l) => l.length > 0);
}
function parseFaqs(raw) {
  if (!raw || !String(raw).trim()) return [];
  const text = String(raw).trim();
  const qCount = (text.match(/Q\d+\s*:/g) || []).length;
  const aCount = (text.match(/A\d+\s*:/g) || []).length;
  if (qCount === 0 || aCount === 0 || qCount !== aCount) {
    return [{ q_en: text, a_en: '' }];
  }
  const re = /Q\d+\s*:\s*([\s\S]*?)\s*A\d+\s*:\s*([\s\S]*?)(?=\s*Q\d+\s*:|$)/g;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({ q_en: m[1].trim(), a_en: m[2].trim() });
  }
  return out.length ? out : [{ q_en: text, a_en: '' }];
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const SKU_PREFIX = ['CAB', 'MAT', 'IND', 'OTH'];
data.sheets.forEach((sheet, sheetIndex) => {
  const items = sheet.products.map((p, rowIndex) => {
    const slug = toSlug(p.url);
    const sku = `${SKU_PREFIX[sheetIndex] || 'OTH'}-${String(rowIndex + 1).padStart(3, '0')}`;
    return {
      slug,
      sku,
      url: p.url,
      name_en: p.name_en || '',
      seoTitle_en: p.title_en || '',
      description_en: p.description_en || '',
      features_en: parseFeatures(p.features_en),
      specs_en: p.specs_en || '',
      seoKeywords_en: Array.isArray(p.seo_keywords) ? p.seo_keywords : [],
      faqs: parseFaqs(p.faq_en),
    };
  });
  const outFile = path.join(OUT_DIR, `_input_sheet${sheetIndex}.json`);
  fs.writeFileSync(outFile, JSON.stringify({ sheet: sheet.sheet, dimension: sheet.dimension, products: items }, null, 2), 'utf-8');
  const faqTotal = items.reduce((s, x) => s + x.faqs.length, 0);
  const featTotal = items.reduce((s, x) => s + x.features_en.length, 0);
  console.log(`sheet${sheetIndex} [${sheet.sheet}] -> ${items.length} 产品, ${featTotal} features, ${faqTotal} faqs -> ${path.basename(outFile)}`);
});
console.log('预解析完成。');
