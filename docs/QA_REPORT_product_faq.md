# QA 验收报告 — 后台单产品 FAQ 管理（Smart Cabinet）

- **QA 工程师**：Edward（严过关）
- **日期**：2026-07-04
- **范围**：验收「后台单产品 FAQ 管理」功能，对应 T01–T04 交付物
- **环境**：Windows 沙箱，项目根 `D:/workbuddy/2026-06-19-13-21-39/smart-cabinet-local`，已安装 `node_modules`（Prisma 6.19.3 / Next 14 / vitest 2.1.9）

---

## 1. 总结论（Verdict）

**验收通过（PASS）。** 核心行为项 A–F 全部通过**独立执行**的验证，无源码功能性 Bug。

- 类型检查：`tsc --noEmit` → **exit 0，0 errors**（真实执行）。
- 测试：vitest 运行真实源码 + mock 依赖，**19/19 通过**（真实执行）。
- 智能路由判定：**NoOne（全绿）**——未发现问题源码，无需回退给工程师；测试代码自身的小 build 问题已自行修复（见第 5 节）。

---

## 2. 采用的验证方法（明确区分"已执行"与"仅审查"）

| 方法 | 是否实际执行 | 说明 |
|------|------|------|
| TypeScript 类型检查 | ✅ 实际执行 | `npx tsc -p tsconfig.qa.json --noEmit`，exit 0 |
| API 行为测试（GET/POST/PUT/DELETE） | ✅ 实际执行 | vitest，mock `@prisma/client` / `@/lib/auth` / `next/server`，调用**真实 handler** |
| 前端组件行为测试 | ✅ 实际执行 | vitest + @testing-library/react（jsdom），mock `@/data/unified-data`，渲染**真实 `ProductFaqBlock`** |
| edit 页嵌入 client 子组件 | 🔍 代码审查 | 见 §4 备注：edit 页本身为 `'use client'`，非 RSC，边界问题不存在 |
| 端到端真实 DB | ❌ 未执行 | 沙箱无实时 PostgreSQL；以 mock Prisma 等价验证 handler 逻辑（断言落到 `prisma.fAQ.*` 的入参），并辅以 `tsc` 覆盖全量源码编译 |

> 注：本报告**未假装跑过**未执行的测试。所有"已执行"项均附测试名 / 命令 / 退出码作为证据。

---

## 3. 测试清单与结果

| 项 | 验收点 | 方法 | 结果 | 证据 |
|----|--------|------|------|------|
| **A** | GET 带 `productId` 只返该产品 FAQ；不带返全部（全局页兼容） | 实际执行 | ✅ PASS | `route.test.ts` → A1（where 含 `productId`）、A2（where 不含 `productId`，返回 2 条含 `null` 与 `prod-1`） |
| **B** | POST 用 Prisma 关系 `connect` 持久化 `productId`（非直接写标量） | 实际执行 | ✅ PASS | `route.test.ts` → B1（`data.product === { connect: { id: 'prod-1' } }` 且 `data.productId` 为 `undefined`）、B2（不带 productId 时 `data.product` 为 `undefined`）、B3（缺字段返回 400） |
| **C** | PUT 不带 `productId` 时**不破坏归属**（不触发 `disconnect`） | 实际执行 | ✅ PASS | `route.test.ts` → **C1（主证明）**：`expect('product' in data).toBe(false)`；C2（带 productId 则 reconnect）；C3（显式 `null` 会 disconnect，记录为残留风险） |
| **D** | DELETE 按 `?id=` 删除成功 | 实际执行 | ✅ PASS | `route.test.ts` → D1（`delete` 调用 `{ where: { id: 'faq-1' } }`）、D2（缺 id 返回 400） |
| **E** | 前端：挂载加载 / 新建(POST+productId) / 更新(PUT) / 删除(DELETE) / 排序持久化 / AR RTL / 空状态 | 实际执行 | ✅ PASS | `ProductFaqBlock.test.tsx` → E1（加载并回填）、E2（createFaq 带 productId 且 payload 不含标量）、E3（updateFaq **不带** productId）、E4（deleteFaq 调 id）、E5（下移交换 order 并两次 updateFaq，均不含 product）、E6（空状态）、E7（AR `dir="rtl"` / EN `dir="ltr"`） |
| **F** | 类型 / 构建 | 实际执行 | ✅ PASS | `tsc -p tsconfig.qa.json --noEmit` → exit 0，0 errors（涵盖 route.ts / ProductFaqBlock.tsx / JsonTrilingualInput.tsx / faq-constants.ts / unified-data.ts / edit/[id]/page.tsx / add/page.tsx） |

---

## 4. 关于"edit 页 async Server Component 渲染 client 子组件"的核对

任务书假设 `src/app/admin/products/edit/[id]/page.tsx` 是 async Server Component。经**实际读取**确认：

- 该文件第 1 行即 `'use client'`（L1），它**本身也是客户端组件**（L8 import `ProductFaqBlock`，L859 `<ProductFaqBlock productId={productId} />`）。
- 因此"client 组件渲染 client 子组件"是天然安全的，**不存在 RSC/client 边界报错**的可能。任务书的前提描述与实际代码不符，但"嵌入不报错"的结论成立。
- 该文件已通过 `tsc` 全量类型检查（F 项证据），且 `ProductFaqBlock` 在 vitest 中以真实组件渲染通过（E 项），故嵌入行为得到双重确认。

---

## 5. 发现的 Bug / 问题

### 5.1 功能性 Bug
**无。** 源码逻辑经独立执行验证正确。C 项 foot-gun 经专门证明为安全（见 §6）。

### 5.2 测试代码自身问题（已自行修复，不回退工程师）
- 初版 `route.test.ts` 将 `NextRequest`/`NextResponse` 定义在 `vi.mock('next/server')` 工厂闭包内，导致模块级的 `mkReq` 报 `ReferenceError: NextRequest is not defined`，**13 个 API 测试全部失败**。
- 修复：将 mock 类移入 `vi.hoisted()` 提升为模块级可访问常量，并在工厂中返回同一引用。重跑后 **12/12 API 测试通过**。（属于测试代码 Bug，按规则自行修复。）

### 5.3 轻微文档/注释不一致（非阻塞，建议修正）
- `src/components/admin/ProductFaqBlock.tsx` **L18 注释**写：`productId 写入 FAQ.productId（Prisma 直接写 FK 标量，无需 connect）`。
- 实际后端 `route.ts` **L139-141** 的 POST 是通过关系写法 `faqData.product = { connect: { id: body.productId } }` 实现（Prisma v6 不直接暴露 FK 标量写入），与注释"无需 connect"描述不一致。
- **不影响功能**（数据流正确：前端 `createFaq({...buildPayload(row), productId})` → 后端 connect）。仅建议修正注释措辞以避免误导。

### 5.4 残留风险（非阻塞，记录供决策）
- `route.ts` PUT 守卫 `if (body.productId !== undefined)`（L197）只拦截"未传"。若未来某处显式传入 `productId: null`，会因 `null !== undefined` 为真而执行 `{ disconnect: true }`，从而**清空归属**。
- 当前前端 `buildPayload` 从不包含 `productId`，且 `updateFaq` 调用（L153、L204、L207）均不传 productId，故该路径在现有功能中**不可达**（C3 测试已显式证明此边界）。
- 可选加固建议：后端对 `productId` 仅接受字符串类型，遇 `null`/非字符串显式 `badRequest`，从根上消除该 foot-gun。

---

## 6. PUT 守卫安全结论（明确）

**结论：PUT 守卫是安全的，且已用真实源码执行证明。**

- **主证明（C1）**：向真实 `PUT` handler 发送与 `ProductFaqBlock` 完全一致的 payload（即 `buildPayload(row)`，**不含 `productId`**），断言落库参数 `updateData` 中 **`'product' in data === false`** 且 `data.product === undefined`。
  → Prisma 收不到 `product` 字段，**不会执行 `disconnect`**，FAQ 的 `productId` 归属保持不变。
- 机制根因：`route.ts` L197 `if (body.productId !== undefined)` 在"字段缺失"时为 `false`，跳过了 `connect`/`disconnect` 分支——守卫正确生效。
- 配套证明：C2 证明"显式传 productId 字符串"时正常 reconnect；C3 证明"显式传 null"才会 disconnect（残留风险，见 §5.4，前端不触发）。

---

## 7. 交付物（新增文件）

| 文件 | 说明 |
|------|------|
| `src/app/api/admin/faqs/route.test.ts` | 12 个测试：A1/A2、B1/B2/B3、C1/C2/C3/C4、D1/D2、Auth；mock Prisma/auth/next，验证真实 handler |
| `src/components/admin/ProductFaqBlock.test.tsx` | 7 个测试：E1–E7；mock 数据层，渲染真实 `ProductFaqBlock` 与 `JsonTrilingualInput` |
| `tsconfig.qa.json` | 仅对生产源码做类型检查的临时配置（排除 `*.test.*`，复现 F 项结果） |

运行方式：
```bash
npx tsc -p tsconfig.qa.json --noEmit   # 类型检查
npx vitest run                         # 全部测试（19 passed）
```

---

## 8. 一句话总结

代码**真的能用**：类型干净、API 行为经真实执行全部验证、最担心的 PUT 归属 foot-gun 被证明安全、前端交互（含 AR RTL）经真实渲染验证通过。验收关卡通过，无需回退工程师。
