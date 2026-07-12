# 关键词手动覆盖优先级系统 —— 架构设计文档

> 作者：高见远（software-architect） · 项目：smart-cabinet
> 范围：**仅产品（Product）+ 博客（BlogPost）** 的 `seoKeywords` 手动覆盖优先级；
> 行业页 / 落地页 / 管理项暂不动。`resolvePageKeywords` 设计成可复用。
> 所有结论均基于**实际读取源码**核实，非假设。

---

## 0. 一句话结论

- `Product.seoKeywords` 字段**已落库**（迁移 `20260701120000_v265_product_seo_faq` 已加列），产品详情页**已有 manual>auto 优先级逻辑且基本正确**，但存在一条**会误导后续开发的注释**（声称"无视后台 seoKeywords"，与实际代码相反）。
- `BlogPost.seoKeywords` 字段**在 schema 中声明，但从未建迁移列** —— 当前博客 API 靠"missing column 重试时剥掉该字段"的兜底静默丢弃写入，**博客手动关键词实际上存不进去**。**必须新增迁移**。
- 后台产品表单只有**一个**关键词框，保存时把同一值复制到 `en/zh/ar`；后台博客表单也是**一个**文本框，存成**扁平字符串**（与产品的 `{en,zh,ar}` 对象形态不一致）。两者都不符合"逐语言手动覆盖"需求。
- 博客详情页 `generateMetadata` **完全忽略** `seoKeywords`（只用自动生成），且其 DB 查询 `select` 根本没取 `seoKeywords`。

---

## 1. 现状核实报告（逐文件）

### 1.1 数据层（Prisma）

| 文件 / 位置 | 现状 | 结论 |
|---|---|---|
| `prisma/schema.prisma:29` `Product.seoKeywords Json?` | 注释 `{ zh, en, ar } 逗号分隔的关键词数组` | 字段存在 |
| `prisma/migrations/20260701120000_v265_product_seo_faq/migration.sql:4` | `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "seoKeywords" JSONB;` | **产品列已建** ✅ |
| `prisma/schema.prisma:103` `BlogPost.seoKeywords Json?` | 注释 `SEO 关键词（逗号分隔字符串，由编辑器传入）` | 字段声明存在 |
| 任意 `prisma/migrations/*` | **无任何迁移为 `blog_posts` 添加 `seoKeywords`** | **博客列缺失** ❌（需新迁移） |

> 核对：对 `prisma/migrations` 全量 `grep "seo_keywords"` 无结果；仅 `products` 表被 `v265` 迁移加列。博客 API 中 `isMissingColumnError` + `writeBlogResilient` 剥字段重试（`blogs/route.ts:65-91, 410-485`）正是为掩盖该列不存在。

### 1.2 自动生成引擎（`src/lib/seo-keywords.ts`）

- `buildDetailPageKeywords(en, display, slug)` / `buildListPageKeywords` / `buildStaticPageKeywords` 仅自动生成，**无 manual 参数**。
- 铁律已实现：100% 来自标题、硬排除型号/SKU、全站英文为主（英文页提炼英文词元，zh/ar 仅作二级本地化全名）。
- 该文件**零改动**即可被新助手复用（助手只负责"选 manual 还是 auto"）。

### 1.3 产品详情页（`src/app/[locale]/products/[...slug]/ProductDetailView.tsx`）

`buildProductMetadata`（约 138–155 行）现状：

```ts
138  // 关键词：强制走自动两级关键词系统（无视后台 seoKeywords，确保 ZH/AR 页显示本地化完整标题）。  ← ⚠️ 误导注释
139  // 详情页：主 = 从【英文产品名 + URL slug】共同提炼词元，二级 = 本语言完整产品名。
140  // 全站关键词以英文为主：提炼统一走英文；中文/阿语完整名仅作二级、只出现在本语言页。
141  const productNameForKw = translate(productAny.name, locale);
142  const productNameEn = translate(productAny.name, 'en');
143  const urlSlug = (canonicalPath || '').split('/').pop() || '';
144  const autoKeywords = buildDetailPageKeywords(productNameEn || '', productNameForKw || '', urlSlug);
145
146  // SEO 关键词策略（Task C）：优先使用后台为该语言配置的 seoKeywords（非空字符串/数组），
147  // 否则 fallback 到自动两级关键词系统。seo-keywords.ts 引擎契约保持零改动。
148  const seoKeywordsRaw = productAny.seoKeywords?.[locale];
149  const seoKeywordsStr = Array.isArray(seoKeywordsRaw)
150    ? seoKeywordsRaw.filter((x: any) => x != null).map((x: any) => String(x)).join(', ')
151    : typeof seoKeywordsRaw === 'string'
152      ? seoKeywordsRaw
153      : '';
154  const keywords = seoKeywordsStr.trim() ? seoKeywordsStr : autoKeywords.join(', ');
```

**核实结论（Task C 块是否真的正确生效）：**

| 检查项 | 结果 |
|---|---|
| 是否真的读后台 manual | ✅ 是（`seoKeywords?.[locale]` 按语言取） |
| 三语分别判定 | ✅ 是（逐语言取 `?.[locale]`） |
| manual 非空直接用、不回退 | ✅ 是（`seoKeywordsStr.trim() ? ... : auto`） |
| manual 原样使用（不过滤 STOPWORDS/型号） | ✅ 是（数组 join 或字符串原样） |
| manual 与 auto 是替换还是合并 | ✅ **替换**（非空即整语言用 manual） |
| null/空回退 auto | ✅ 是 |
| 兼容数组 / 字符串两种存储形态 | ✅ 是 |

➡️ **逻辑本身正确且符合需求**。`buildProductMetadata` 入参 `product` 由 `ProductDetailView` 传入完整 `dbProduct`（无 `select` 裁剪），`seoKeywords` 字段在内存对象中可用。

**但有两个真实问题：**

1. **⚠️ 误导注释（文档 bug，高危）**：第 138–140 行注释声称"强制走自动系统，无视后台 seoKeywords"，与实际代码（146–154 行）**完全相反**。后续开发者极可能"按注释修代码"而把 manual 逻辑删掉。必须重写该注释。
2. **形态脆弱**：第 148 行只处理 `seoKeywords?.[locale]` 为字符串/数组；若存储为**扁平字符串/数组（非逐语言对象）**则 `?.[locale]` 为 `undefined`，直接回退 auto —— 对博客（扁平字符串）不友好。统一助手会兜底。

> 另：`applications/[...slug]`、`solutions/[...slug]` 也复用 `buildProductMetadata`，本次不改动其逻辑，仅替换其内部实现为统一助手即可一并受益。

### 1.4 博客详情页（`src/app/[locale]/blog/[slug]/page.tsx`）

`generateMetadata`（60–96 行）现状：

```ts
68  const blog = await prisma.blogPost.findFirst({
69    where: { slug: { in: [fullSlug, rawSlug] }, deletedAt: null },
70    select: { title: true, excerpt: true, publishedAt: true, image: true },  // ❌ 没取 seoKeywords
71  });
...
80  const keywords = buildDetailPageKeywords(enTitle, displayTitle, rawSlug);  // ❌ 只用自动，无 manual
```

**核实结论：**

| 检查项 | 结果 |
|---|---|
| 读取 `seoKeywords` | ❌ DB 查询 `select` 未包含 `seoKeywords` |
| 应用 manual 优先级 | ❌ 完全缺失，仅自动 |
| 当前线上行为 | 所有语言均显示自动关键词（即使库里有值也读不到） |

➡️ 博客页**必须补齐**：① `select` 加 `seoKeywords: true`；② 调用统一助手。

### 1.5 后台管理 UI（仅 `src/app/admin/**`，不动 `xiaozhouBackend`）

| 文件 | 现状 | 问题 |
|---|---|---|
| `admin/products/add/page.tsx:43,74-77,272-275,649-660` | 单字段 `form.seoKeywords`；保存 `{en: X, zh: X, ar: X}`（同值复制）；UI 一个输入框 | 非逐语言；且 prefill 读 `.en` 会丢 zh/ar |
| `admin/products/edit/[id]/page.tsx:170,239-245,382-390,536-540,1049-1050` | 同上；prefill 仅取 `product.seoKeywords.en`（382–390 行 `sk.en`） | **若库里 zh/ar 不同，编辑保存会被覆盖成 en 值**（数据丢失 bug） |
| `admin/blog/add/page.tsx:44,98,352-353` | 单字段 `formData.seoKeywords`（textarea）；保存 `seoKeywords: string` | 扁平字符串，非 `{en,zh,ar}` |
| `admin/blog/edit/[id]/page.tsx:48,102,149,411-412` | 同上；prefill `post.seoKeywords`（扁平串） | 同上 |

> 备注：产品 admin 的 `generateSeoKeywords()`（edit 183 行 / add）会**注入硬编码主题词**（`'smart cabinet'/'tool management'/'storage solution'`），违反铁律"100% 来自标题、无手搓种子"。该按钮只是便利填充，页面自动生成走 `seo-keywords.ts`（正确）。建议改造该按钮改为调用 `buildDetailPageKeywords`，或至少移除硬编码词（见风险 §8）。

### 1.6 API（持久化与返回）

| 文件 / 位置 | 现状 | 结论 |
|---|---|---|
| `api/admin/products/route.ts:175` `POST` | `seoKeywords: body.seoKeywords ?? null`（body 已是 `{en,zh,ar}` 对象） | 产品列存在 → **能持久化** ✅ 但需归一化 |
| `api/admin/products/route.ts:302` `PUT` | `if (body.seoKeywords !== undefined) updateData.seoKeywords = body.seoKeywords` | 同上，需归一化 |
| `api/admin/products/route.ts:34-41` `GET ?id=` | `findFirst({include:{categories,tags}})` 返回完整对象 | **含 seoKeywords** ✅（prefill 可用） |
| `api/admin/blogs/route.ts:411` `POST` | `seoKeywords: body.seoKeywords !== undefined ? body.seoKeywords : (staticSeed.seoKeywords ?? null)` | body 为扁平串；**存成扁平串**；列不存在时静默丢弃 ❌ |
| `api/admin/blogs/route.ts:469` `PUT` | `if (body.seoKeywords !== undefined) updateData.seoKeywords = body.seoKeywords` | 同上 ❌ |
| `api/admin/blogs/route.ts:145-179` `GET ?id=` | `findUnique({include:{tags}})` 返回完整 `blog` | **含 seoKeywords**（扁平串）✅；静态兜底返回 `seoKeywords:null`（41 行） |
| `api/admin/blogs/route.ts:65-91` `writeBlogResilient` | 缺列则剥 `seoKeywords` 重试 | 掩盖缺列；迁移后不再触发，可保留作保险 |

**核心不一致**：产品存 `{en,zh,ar}` 对象、博客存扁平字符串。统一后博客也存 `{en,zh,ar}` 对象，API 需归一化。

---

## 2. 统一优先级机制设计

### 2.1 新建助手 `src/lib/seo-keywords-resolve.ts`

> 与 `seo-keywords.ts` 同目录，职责分离：
> - `seo-keywords.ts` = **生成** auto 关键词（零改动）。
> - `seo-keywords-resolve.ts` = **裁决** manual vs auto（本次新增）。

```ts
// src/lib/seo-keywords-resolve.ts
import type { Locale } from './seo-keywords';

export type Locale = 'en' | 'zh' | 'ar';

/** 规范形态：三语逗号分隔字符串（可空） */
export interface TrilingualKeywords {
  en: string;
  zh: string;
  ar: string;
}

/**
 * 把任意来源（逗号串 / 数组 / 字符串）拆成去空、大小写不敏感去重的 token 数组。
 * 注意：手动值【不做】STOPWORDS / 型号过滤 —— 手工覆盖的意义就是绕过铁律。
 */
export function toKeywordTokens(value: unknown): string[] {
  if (value == null) return [];
  const items: string[] = Array.isArray(value)
    ? value.map((v) => String(v))
    : typeof value === 'string'
      ? value.split(',')
      : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const t = (raw ?? '').toString().trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

/**
 * 把 API / DB 收到的任意形态归一化为规范 { en, zh, ar }（字符串，可空）。
 *  - 对象 {en,zh,ar} → 逐字段转字符串
 *  - 遗留扁平字符串 / 数组（旧博客）→ 视为【英文】手动值，zh/ar 留空（回退 auto）
 *  - null / undefined → 返回 null（调用方保留原值或不写）
 */
export function normalizeSeoKeywords(input: unknown): TrilingualKeywords | null {
  if (input == null) return null;
  if (typeof input === 'object' && !Array.isArray(input)) {
    const o = input as Record<string, unknown>;
    const str = (v: unknown) => (v == null ? '' : typeof v === 'string' ? v : String(v));
    return { en: str(o.en), zh: str(o.zh), ar: str(o.ar) };
  }
  // 遗留扁平值：当作 en 手动值
  return { en: toKeywordTokens(input).join(', '), zh: '', ar: '' };
}

/**
 * 解析某页面某语言的终版关键词。
 *
 * 语义（与需求铁律一致）：
 *  - manual 该语言非空 → 整语言【替换】为 manual（原样，不过滤）；
 *  - manual 该语言缺失/空 → 回退 auto（auto 已过滤型号/停用词）；
 *  - manual 与 auto 是【替换】而非【并集】，避免手工词被自动词稀释；
 *  - 逐语言独立判定（有的语言用 manual，无的用 auto）。
 *
 * @returns 关键词数组（供 Next.js Metadata.keywords 使用，调用方 .join(', ') 即可）
 */
export function resolvePageKeywords(opts: {
  manual?: unknown;          // 存储的 seoKeywords：{en,zh,ar} | string | string[] | null
  auto: string[];            // buildDetailPageKeywords / buildListPageKeywords / buildStaticPageKeywords 的输出
  locale: Locale;
}): string[] {
  const norm = normalizeSeoKeywords(opts.manual);
  const manualForLocale = norm ? toKeywordTokens(norm[opts.locale]) : [];
  if (manualForLocale.length > 0) return manualForLocale; // 替换语义
  return opts.auto;                                // 回退自动
}
```

### 2.2 语义决策表

| 存储形态 | locale=en | locale=zh | locale=ar |
|---|---|---|---|
| `{en:"a",zh:"",ar:""}` | manual `a` | auto | auto |
| `{en:"a",zh:"b",ar:"c"}` | manual `a` | manual `b` | manual `c` |
| `"x, y"`（遗留扁平串，旧博客） | manual `x, y` | auto | auto |
| `null` / `{}` / `{en:"",zh:"",ar:""}` | auto | auto | auto |

---

## 3. 页面接入改动

### 3.1 产品详情页 `ProductDetailView.tsx`

**改动点**：`buildProductMetadata` 内 138–155 行整体替换为（并删除 138–141 的误导注释）：

```ts
import { buildDetailPageKeywords, buildHreflang } from '@/lib/seo-keywords';
import { resolvePageKeywords } from '@/lib/seo-keywords-resolve'; // 新增
...
const productNameForKw = translate(productAny.name, locale);
const productNameEn = translate(productAny.name, 'en');
const urlSlug = (canonicalPath || '').split('/').pop() || '';
const autoKeywords = buildDetailPageKeywords(productNameEn || '', productNameForKw || '', urlSlug);

// 关键词优先级（铁律）：某语言后台手动设置了 seoKeywords → 整语言替换；否则回退自动生成。
const keywords = resolvePageKeywords({
  manual: productAny.seoKeywords,
  auto: autoKeywords,
  locale,
}).join(', ');
```

> 前提：`buildProductMetadata` 收到的 `product` 已含 `seoKeywords`（当前 `ProductDetailView` 传完整 `dbProduct`，满足）。

### 3.2 博客详情页 `blog/[slug]/page.tsx`

**改动点 A** —— `generateMetadata` 的 DB 查询 `select` 增加 `seoKeywords`（约 70 行）：

```ts
const blog = await prisma.blogPost.findFirst({
  where: { slug: { in: [fullSlug, rawSlug] }, deletedAt: null },
  select: { title: true, excerpt: true, publishedAt: true, image: true, seoKeywords: true }, // ← 加 seoKeywords
});
```

**改动点 B** —— 约 80 行替换为：

```ts
import { resolvePageKeywords } from '@/lib/seo-keywords-resolve'; // 顶部新增
...
const autoKeywords = buildDetailPageKeywords(enTitle, displayTitle, rawSlug);
const keywords = resolvePageKeywords({
  manual: (blog as any)?.seoKeywords,
  auto: autoKeywords,
  locale: loc,
}).join(', ');
```

> 注意：`generateMetadata` 还有静态兜底分支（`staticBlogs`），兜底数据无 `seoKeywords` → `resolvePageKeywords` 收到 `undefined` → 回退 auto，行为正确。

---

## 4. 后台管理 UI 改动

### 4.1 产品 add / edit（统一改造）

**表单状态**：把单字段 `seoKeywords` 改为三字段
```ts
seoKeywordsEn: '', seoKeywordsZh: '', seoKeywordsAr: '',
```
**Prefill（edit）**：读取逐语言，避免当前"只取 `.en` 丢 zh/ar"的 bug：
```ts
const sk = product.seoKeywords;
seoKeywordsEn: typeof sk === 'string' ? sk : (sk?.en ?? '') ,
seoKeywordsZh: sk?.zh ?? '' ,
seoKeywordsAr: sk?.ar ?? '' ,
```
**提交（POST/PUT payload）**：
```ts
seoKeywords: { en: form.seoKeywordsEn, zh: form.seoKeywordsZh, ar: form.seoKeywordsAr },
```
**UI**：原单个输入框改为三个 `<input>`（en / zh / ar，逗号分隔提示），可保留"根据标题生成"按钮（建议改为调用 `buildDetailPageKeywords` 填充当前语言框，或分别填充三语）。

涉及文件：
- `src/app/admin/products/add/page.tsx`
- `src/app/admin/products/edit/[id]/page.tsx`

### 4.2 博客 add / edit（统一改造）

同上三字段 `{seoKeywordsEn, seoKeywordsZh, seoKeywordsAr}`，prefill 读 `post.seoKeywords.en/zh/ar`，提交发 `{en,zh,ar}` 对象（替换当前的扁平串）。

涉及文件：
- `src/app/admin/blog/add/page.tsx`
- `src/app/admin/blog/edit/[id]/page.tsx`

### 4.3 API 期望数据形状（新增归一化）

两个 API 路由在落库前调用 `normalizeSeoKeywords`，统一成规范 `{en,zh,ar}`：

**`api/admin/products/route.ts`**
```ts
// POST（175 行附近）
import { normalizeSeoKeywords } from '@/lib/seo-keywords-resolve';
seoKeywords: normalizeSeoKeywords(body.seoKeywords), // null 时不写
// PUT（302 行附近）
if (body.seoKeywords !== undefined) updateData.seoKeywords = normalizeSeoKeywords(body.seoKeywords);
```

**`api/admin/blogs/route.ts`**
```ts
// POST（411 行附近）—— 注意 staticSeed.seoKeywords 是扁平串，归一化后入 en
seoKeywords: normalizeSeoKeywords(
  body.seoKeywords !== undefined ? body.seoKeywords : staticSeed.seoKeywords
),
// PUT（469 行附近）
if (body.seoKeywords !== undefined) updateData.seoKeywords = normalizeSeoKeywords(body.seoKeywords);
```
保留 `writeBlogResilient` 缺列兜底（迁移上线前仍可写成功，只是剥字段；上线后不再触发）。

**API 入参契约（前端 → 后端）**：接受以下任一形态，路由归一化：
1. 规范对象 `{ "en": "a,b", "zh": "…", "ar": "…" }`（**推荐，admin 新表单发送**）
2. 遗留扁平字符串 `"a,b"` → 归一化为 `{en:"a,b",zh:"",ar:""}`
3. 遗留扁平数组 `["a","b"]` → 同上
4. 缺省 / `null` → 不写该字段（保留库中原值）

**API 出参契约（GET ?id=）**：直接返回库内规范对象 `{en,zh,ar}`（已是 `Json`）。前端 prefill 按 `en/zh/ar` 读取。

---

## 5. 一次性种子脚本设计

> 用户稍后提供"关键词表格"（数据源待定）。脚本须**通用、可配置路径、幂等**。

**文件**：`scripts/seed-keywords.mjs`（用 `node` 直接跑，避免 ts 编译链；或 `scripts/seed-keywords.ts` + `tsx`）。推荐 `.mjs` 降低执行门槛。

**输入表格格式（可配置）**：支持 CSV 与 JSON 两种，`--file` 指定路径，`--format` 指定类型。

CSV 示例（`scripts/seed-keywords.sample.csv`）：
```csv
entity,slug,keywords_en,keywords_zh,keywords_ar
product,industrial-vending-machine,"smart cabinet, vending machine","智能柜, 自动售货机","خزانة ذكية, ماكينة بيع"
blog,future-of-intelligent-tool-storage,"tool storage, cnc","工具存储, 数控","تخزين الأدوات, سي إن سي"
```

JSON 示例：
```json
[
  { "entity": "product", "slug": "industrial-vending-machine",
    "keywords_en": "smart cabinet, vending machine",
    "keywords_zh": "智能柜, 自动售货机", "keywords_ar": "خزانة ذكية, ماكينة بيع" }
]
```

**行为**：
- 按 `entity` 路由到 `products` / `blog_posts` 表，用 `slug` 定位行。
- 写 `seoKeywords = { en, zh, ar }`（逗号串）。
- `--mode merge`（默认）：仅填充该语言**为空**的键，不覆盖后台已有手动值。
- `--mode overwrite`：整语言覆盖。
- 仅 `update` `seoKeywords` 一列，不触碰其它字段（幂等，可重复跑）。
- 跳过软删除（`deletedAt != null`）行；找不到 slug 的行打印警告并跳过。

**CLI**：
```bash
node scripts/seed-keywords.mjs --file ./scripts/seed-keywords.csv --format csv --mode merge
# 或读环境变量 SEED_FILE
```

**伪代码骨架**：
```js
import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync'; // 或手写轻量解析
import { normalizeSeoKeywords } from '../src/lib/seo-keywords-resolve.ts'; // 若用 tsx

const prisma = new PrismaClient();
const { file, format, mode = 'merge' } = parseArgs();
const rows = format === 'json' ? JSON.parse(read(file)) : parse(read(file));

for (const r of rows) {
  const table = r.entity === 'blog' ? prisma.blogPost : prisma.product;
  const existing = await table.findFirst({ where: { slug: r.slug, deletedAt: null } });
  if (!existing) { warn(`skip: ${r.entity}/${r.slug} not found`); continue; }
  const incoming = normalizeSeoKeywords({ en: r.keywords_en, zh: r.keywords_zh, ar: r.keywords_ar });
  const prev = normalizeSeoKeywords(existing.seoKeywords) ?? { en:'',zh:'',ar:'' };
  const next = mode === 'overwrite' ? incoming
    : { en: incoming.en || prev.en, zh: incoming.zh || prev.zh, ar: incoming.ar || prev.ar };
  await table.update({ where: { id: existing.id }, data: { seoKeywords: next } });
  log(`upserted ${r.entity}/${r.slug}`);
}
```

> 若用 `.mjs` 不便 import `seo-keywords-resolve.ts`，可在脚本内**内联**一份 `normalizeSeoKeywords`（保持与库一致即可），避免引入 ts 运行时。

---

## 6. 有序任务列表（由工程师实现）

> 全部由 **工程师（Engineer）** 实现；架构师（本文作者）负责评审。

| # | 任务 | 关键文件 | 依赖 | 优先级 | 顺序 |
|---|---|---|---|---|---|
| T1 | **补博客迁移**：新增 `prisma/migrations/<ts>_add_blog_seo_keywords/migration.sql`（`ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "seoKeywords" JSONB;`），并 `prisma migrate deploy` 到目标库；顺带 `psql` 校验 `products.seoKeywords` 列已存在 | `prisma/migrations/.../migration.sql` | 无 | P0 | 1 |
| T2 | **建统一助手**：实现 `src/lib/seo-keywords-resolve.ts`（`resolvePageKeywords` / `normalizeSeoKeywords` / `toKeywordTokens`）+ 单测 | `src/lib/seo-keywords-resolve.ts`, `src/__tests__/seo-keywords-resolve.test.ts` | 无 | P0 | 2 |
| T3 | **页面接入**：`ProductDetailView` 删误导注释并改调助手；`blog/[slug]/page.tsx` 的 `select` 加 `seoKeywords` 并改调助手 | `src/app/[locale]/products/[...slug]/ProductDetailView.tsx`, `src/app/[locale]/blog/[slug]/page.tsx` | T2 | P0 | 3 |
| T4 | **API 归一化**：products/blogs 两个路由落库前 `normalizeSeoKeywords`；GET 已返回 seoKeywords（确认无需改） | `src/app/api/admin/products/route.ts`, `src/app/api/admin/blogs/route.ts` | T1（博客列）, T2 | P1 | 4 |
| T5 | **后台 UI 三语框**：products add/edit + blogs add/edit 由单框改 en/zh/ar 三框，prefill 读逐语言，提交发 `{en,zh,ar}` | `admin/products/add/page.tsx`, `admin/products/edit/[id]/page.tsx`, `admin/blog/add/page.tsx`, `admin/blog/edit/[id]/page.tsx` | T4 | P1 | 5 |
| T6 | **种子脚本**：`scripts/seed-keywords.mjs`（CSV/JSON 可配、merge/overwrite、按 slug upsert） | `scripts/seed-keywords.mjs`, `scripts/seed-keywords.sample.csv` | T1, T2 | P2 | 6 |

依赖图：`T1 → T4 → T5`；`T2 → T3 →`(独立) ；`T2 → T4`；`T1,T2 → T6`。T3 仅依赖 T2。

---

## 7. 接口 / 数据契约

### 7.1 `seoKeywords` 库内 Json 形状（规范，产品 & 博客统一）
```json
{ "en": "comma,separated", "zh": "逗号,分隔", "ar": "فاصلة,مفصولة" }
```
每个值为**逗号分隔字符串**（可空字符串）。不接受嵌套数组持久化（数组在写入前由 `normalizeSeoKeywords` 转成逗号串）。

### 7.2 API 入参（`POST`/`PUT /api/admin/products` 与 `/api/admin/blogs`）
```json
{ "seoKeywords": { "en": "a,b", "zh": "…", "ar": "…" } }
```
接受等价形态：扁平字符串 / 扁平数组（详见 §4.3），路由侧归一化。

### 7.3 API 出参（`GET ?id=`）
```json
{ "id": "…", "slug": "…", "seoKeywords": { "en": "a,b", "zh": "…", "ar": "…" }, "...": "…" }
```

### 7.4 种子脚本输入（CSV schema）
| 列 | 类型 | 说明 |
|---|---|---|
| `entity` | `product` \| `blog` | 路由到哪张表 |
| `slug` | string | 定位行（唯一） |
| `keywords_en` | string（逗号分隔） | 英文手动值 |
| `keywords_zh` | string（逗号分隔） | 中文手动值 |
| `keywords_ar` | string（逗号分隔） | 阿文手动值 |

JSON 形态为等价对象数组。

### 7.5 `resolvePageKeywords` 函数契约
```
resolvePageKeywords({ manual: unknown, auto: string[], locale: 'en'|'zh'|'ar' }) -> string[]
```
返回数组（调用方 `.join(', ')` 得到 `<meta name="keywords">` 内容）。

---

## 8. 待明确事项 / 风险

1. **🔴 博客列迁移必须做（P0）**：当前博客手动关键词**存不进库**（缺列 + 静默剥字段）。T1 不可跳过。需确认目标库可 `migrate deploy`（或手动 `ALTER TABLE`）。
2. **表格格式待定**：用户稍后给"关键词表格"。脚本已设计为 CSV/JSON 双格式 + 可配路径；请用户确认列名是否就是 `entity/slug/keywords_en/keywords_zh/keywords_ar`，或需映射。
3. **历史手动值迁移校验**：现有产品库里 `seoKeywords` 可能已是 `{en:X,zh:X,ar:X}`（同值复制）或扁平串。新 admin 改为逐语言后，旧"同值复制"数据会变成三语相同——是否符合预期？建议种子脚本用 `--mode merge` 仅补空语言，避免覆盖。
4. **遗留扁平串语义**：旧博客扁平串被 `normalizeSeoKeywords` 视为 `en` 手动值（zh/ar 回退 auto）。若用户希望旧扁平串作用于**全语言**，需改助手为"扁平→全语言"（但会在 zh/ar 页面显示英文词，不推荐）。
5. **admin `generateSeoKeywords` 硬编码主题词**违反铁律：建议按钮改为调用 `buildDetailPageKeywords` 或移除硬编码词（非阻塞，建议 T5 一并处理）。
6. **`resolvePageKeywords` 复用范围**：本文只接产品 + 博客详情页。行业/落地页/管理项不动；但助手本身已通用，后续接入零成本。
7. **测试**：建议 T2 补单测覆盖（对象/扁平串/空/逐语言混合）；T3 后做一次三语产品 + 博客页 `<meta keywords>` 实测，确认 manual 覆盖、auto 回退均生效。
8. **`xiaozhouBackend` 不动**：其 products/blog 表单也有 seoKeywords，但属旧重复后台，按协调人要求本次不碰；其写入形态（同为同值复制 / 扁平串）不影响新逻辑，但长期应废弃。
