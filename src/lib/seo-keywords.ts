/**
 * seo-keywords.ts — 两级（two-tier）关键词生成工具（V8.9.3）
 *
 * 铁律（用户定义）：
 *  1. 关键词 100% 来自「标题」字段 —— 产品名 = 标题、博客标题、方案标题、页面标题。
 *     绝不使用型号/SKU，绝不手搓主题词种子（旧 THEME_WORDS / COMMON_SEED 已彻底移除）。
 *  2. 全站关键词「以英文为主」：主关键词（提炼词）始终从【英文标题】提炼（英文词元）；
 *     中文/阿拉伯语的关键词（即完整的本地化标题名）只作用于其对应语言页面，不外溢到英文页。
 *
 * 两级结构（每个页面）：
 *  - 主（primary）= 提炼词元（全站统一为英文）。
 *      · 详情页（产品详情 / 博客详情）：从【英文标题 + URL slug】共同提炼（标题与 URL 并集）。
 *      · 其它页面（列表页 / 首页等）：仅从【英文标题】提炼。
 *  - 辅（secondary）= 该页面语言对应的【完整标题名】（en 页用英文全名，zh 页用中文全名，ar 页用阿语全名），
 *    只出现在本语言页面，不外溢。
 *
 * 说明：<meta name="keywords"> 对 Google/Bing 排名权重极低（Google 2009 已弃用），
 * 本模块仅用于保证关键词与标题一致、不含型号、结构清晰，不追求关键词堆砌。
 */

export type Locale = 'en' | 'zh' | 'ar';

/**
 * 仅英文停用词。注意：不要把 smart / cabinet / tool / vending / locker 等
 * 设为停用词——它们正是要被提取的「共有」词。zh/ar 停用词保留以备扩展，
 * 但本模块提炼统一走英文分词，故实际只用到 en。
 */
export const STOPWORDS: Record<Locale, Set<string>> = {
  en: new Set([
    'the', 'a', 'an', 'of', 'for', 'and', 'with', 'to', 'de', 'la', 'les',
    'or', 'in', 'on', 'at', 'by', 'from', 'is', 'are', 'as', 'per', 'via', 'using',
  ]),
  zh: new Set(['的', '与', '和', '及', '或', '用于', '为', '在', '从', '到', '等', '型', '式', '智', '能']),
  ar: new Set(['و', 'في', 'من', 'إلى', 'على', 'مع', 'ل', 'ال', 'أن', 'أو', 'عن', 'كما']),
};

/**
 * 判断一个词/片段是否像型号/SKU（用于硬性排除）。
 * 命中特征：含连字符的字母数字码且有数字（QT-DL80-48、CTGJG-324、IND-008），
 * 或大写字母与数字混合（DL60B、DL64A）。CNC / RFID / 3C 等不含型号特征，保留。
 */
function looksLikeModel(segment: string): boolean {
  const s = (segment || '').trim();
  if (!s) return false;
  const hasDigit = /\d/.test(s);
  if (hasDigit && /[A-Za-z0-9]{2,}-[A-Za-z0-9]/.test(s)) return true; // QT-DL80-48, IND-008
  if (hasDigit && /[A-Z]{2,}/.test(s)) return true; // DL60B, DL64A
  return false;
}

/**
 * 从 URL slug 提炼关键词（与英文标题并列，作为详情页主关键词来源）。
 * 处理：去掉 .html/.htm 后缀；按 - / _ . 切分；过滤停用词、型号、纯数字（年份/ID）、过短片段。
 * 例：'industrial-vending-machine-trends-2026.html' -> industrial, vending, machine, trends
 */
function urlSlugTokens(slug: string): string[] {
  const cleaned = (slug || '').replace(/\.html?$/i, '').trim();
  if (!cleaned) return [];
  return cleaned
    .split(/[\s/_.\-]+/)
    .map((w) => w.trim())
    .filter(
      (w) =>
        w.length >= 2 &&
        !/^\d+$/.test(w) && // 排除纯数字（年份/ID）
        !STOPWORDS.en.has(w.toLowerCase()) &&
        !looksLikeModel(w),
    )
    .map((w) => w.toLowerCase());
}

/** 大小写不敏感的去重，并丢弃空串 */
function dedupe(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of arr) {
    const t = (item || '').trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

/**
 * 按英文分词：/[\s,/_\-]+/ 切，去空、过滤 len<2、过滤英文停用词、转小写、排除型号/SKU。
 * 全站关键词以英文为主 —— 提炼统一走英文，与页面语言无关。
 */
export function tokenizeName(name: string): string[] {
  const cleaned = (name || '').trim();
  if (!cleaned) return [];
  return cleaned
    .split(/[\s,/_\-]+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !STOPWORDS.en.has(w.toLowerCase()) && !looksLikeModel(w))
    .map((w) => w.toLowerCase());
}

/**
 * 从一组【英文】标题中提炼「共有」主关键词（全部英文，无外部种子）。
 * 阈值 minCount ?? max(3, ceil(n*0.2))；取 >= 阈值、按频次降序、最多 max ?? 12。
 */
export function extractCommonKeywords(
  names: string[],
  opts?: { minCount?: number; max?: number },
): string[] {
  const minCount = opts?.minCount ?? Math.max(3, Math.ceil((names?.length || 0) * 0.2));
  const max = opts?.max ?? 12;
  const freq = new Map<string, number>();
  for (const name of names || []) {
    for (const token of tokenizeName(name)) {
      freq.set(token, (freq.get(token) ?? 0) + 1);
    }
  }
  return Array.from(freq.entries())
    .filter(([, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, max);
}

/**
 * 列表页两级关键词：
 *  - 主 = 从【所有英文标题】提炼的共有关键词（英文，全站统一）。
 *  - 辅 = 各【本地化完整标题】（displayNames，最多 maxSecondary，去重去空，去型号）。
 * 英文页 displayNames 即英文全名；中文/阿语页 displayNames 即本地化全名，仅出现在本语言页。
 */
export function buildListPageKeywords(
  englishNames: string[],
  displayNames: string[],
  opts?: { maxPrimary?: number; maxSecondary?: number },
): string[] {
  const maxPrimary = opts?.maxPrimary ?? 12;
  const maxSecondary = opts?.maxSecondary ?? 12;

  const primary = extractCommonKeywords(englishNames, { max: maxPrimary });

  const seenSecondary = new Set<string>();
  const secondary: string[] = [];
  for (const name of displayNames || []) {
    const safe = (name || '')
      .split(/\s+/)
      .filter((w) => !looksLikeModel(w))
      .join(' ')
      .trim();
    if (!safe) continue;
    const key = safe.toLowerCase();
    if (seenSecondary.has(key)) continue;
    seenSecondary.add(key);
    secondary.push(safe);
    if (secondary.length >= maxSecondary) break;
  }

  return dedupe([...primary, ...secondary]);
}

/**
 * 详情页两级关键词（全部来自标题 + URL，无外部种子、无型号）：
 *  - 主 = 从【英文标题】提炼的词元 ∪ 从【URL slug】提炼的词元（英文，全站统一）。
 *  - 辅 = 该页面语言的【完整标题名】（displayName；英文页即英文全名，中文页即中文全名…）。
 * englishName 缺失时回退到 displayName 提炼，保证不空。urlSlug 缺失时仅用标题提炼。
 */
export function buildDetailPageKeywords(
  englishName: string,
  displayName: string,
  urlSlug?: string,
): string[] {
  const titleTokens = tokenizeName((englishName || displayName || '').trim());
  const urlTokens = urlSlug ? urlSlugTokens(urlSlug) : [];
  const primary = dedupe([...titleTokens, ...urlTokens]);
  const safeDisplay = (displayName || '')
    .split(/\s+/)
    .filter((w) => !looksLikeModel(w))
    .join(' ')
    .trim();
  return dedupe([...primary, safeDisplay].filter(Boolean));
}

/**
 * 静态页两级关键词（全部来自页面标题，无外部种子）：
 *  - 主 = 从【英文标题】提炼的词元（英文）。
 *  - 辅 = 该页面语言标题核心（displayTitle 去掉 " | 品牌" 后缀；英文页即英文核心，中文页即中文核心…）。
 * 中文/阿语标题核心只出现在对应语言页。
 */
export function buildStaticPageKeywords(
  englishTitle: string,
  displayTitle: string,
  opts?: { maxPrimary?: number },
): string[] {
  const max = opts?.maxPrimary ?? 12;
  const enCore = ((englishTitle || '').split(/\s*\|\s*/)[0] || '').trim() || (englishTitle || '');
  const primary = tokenizeName(enCore);
  const displayCore =
    ((displayTitle || '').split(/\s*\|\s*/)[0] || '').trim() || (displayTitle || '');
  return dedupe([...primary, displayCore].filter(Boolean)).slice(0, max);
}
