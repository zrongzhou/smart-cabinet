# PRD-V8：smart-cabinet 智能物料柜官网与电商平台 V8 更新

| 项 | 内容 |
| --- | --- |
| 项目 | smart-cabinet（智能物料柜制造商官网 + 电商平台）|
| 技术栈 | Next.js（App Router）、React、Tailwind CSS、Prisma ORM、MySQL/SQLite |
| 多语言 | en / zh / ar（i18n，生效消息文件 `src/messages/{en,zh,ar}.json`，各 454 键）|
| 后台 | `admin` 与 `xiaozhouBackend`（后者为前者克隆）|
| 文档版本 | V8 |
| 日期 | 2026-07（基于本地代码现状调研）|
| 编写人 | 产品经理 Alice |

---

## 0. 现状调研摘要（基于实际代码阅读）

> 编写前已阅读关键代码，以下为影响需求优先级的核心事实，非凭空假设。

1. **博客双数据源缺陷（对应需求 4）**：前端博客列表页 `src/app/[locale]/blog/page.tsx` 仅调用 `fetchBlogs({published:true})` 读取**数据库**；而 V7 新增的两篇博客（`industrial-vending-machine-trends-2026`、`cnc-tool-inventory-management-guide`）只存在于静态文件 `src/data/blogs.ts`（共 16 条）中，**未写入数据库**。博客详情页 `[slug]/page.tsx` 虽做了"静态+DB 合并"，但列表页读不到 → 用户无法在列表中发现这两篇。**根因：静态源与 DB 双轨，列表页未合并。**
2. **电商功能半成品（对应需求 5）**：`User` 模型已含 `favorites/orders`，`Favorite`、`Order`、`OrderItem` 表已存在；前端有 `components/account/FavoritesList.tsx`（收藏）与 `OrdersList.tsx`（订单列表）；API 有 `/api/user/favorites`、`/api/orders`。但**购物车（cart）全局不存在**（全仓 grep "cart" 无结果），**无结算/支付流程**，Order 模型**缺支付字段**（paymentMethod、paymentStatus、transactionId）。
3. **后台用户管理缺失（对应需求 6）**：API 已有 `/api/admin/users`、`/api/admin/users/[id]`，但 `admin` 与 `xiaozhouBackend` 路由中**均无 users 页面**（grep `*user*` 无命中）。`User.role` 仅 "user"/"admin"，`isActive` 已支持。
4. **支付系统完全缺失（对应需求 7）**：全仓无 Stripe/PayPal/WeChat/Alipay 集成代码，仅有 `api/admin/settings/test-wechat`（通知测试，非支付）。
5. **服务管理模块不存在（对应需求 8）**：`admin`/`xiaozhouBackend` 中无 ssl/restart/nginx/service 相关页面或 API（`nginx-conf.d-smart-cabinet.conf`、`deploy-v*.sh` 仅为部署配置文件，非后台可操作功能）。
6. **后台 UI 已有设计系统但缺模块入口（对应需求 9）**：`admin/layout.tsx` 已定义较完整的卡片/表格/按钮设计变量（`.admin-card` 等），但导航只有 仪表盘/产品/分类/博客/FAQ/媒体/编辑/设置/消息，**无 用户/订单/支付/服务 入口**。
7. **i18n 双消息源风险（对应需求 10）**：除生效的 `src/messages/`（454 键）外，根目录 `messages/`（132 键）为**孤儿目录**，源码无引用；两处键数不一致，存在维护者改错文件、翻译不同步隐患。admin 后台文案硬编码中文（如 navLinks "仪表盘"），ar 的 RTL 适配需专项校验。
8. **后台鉴权偏弱（安全，对应需求 10）**：`admin/layout.tsx` 用 `localStorage.admin_authenticated` 做前端路由保护，非服务端鉴权守卫；需核对 API 层是否强制校验 admin_token，避免越权。
9. **About 页面三个视觉问题（对应需求 1/2/3）**已定位代码：
   - 公司/工厂图区域 `about/page.tsx` 约 L562 用 `minHeight:'460px'`，且全页为超长单文件 client 组件、大量装饰渐变、`text-4xl/5xl` 强行大标题 → 图片偏小、留白多、字号不自然。
   - 翻书动画 `ValuesBookFlip`（约 L177）实为"单卡翻转"，`ValuesPageCard` 仅 `min-h-[420px]` 白卡 + 图标+标题+一段描述，无书脊/双页/翻页阴影 → 不像真书、内容空。
   - 客户墙 `about/page.tsx` L1202–1271 为 36 个**纯文字 logo**（注释明写 "Since we don't have actual logo images, render styled text logos"），灰色方框 + 灰字 → 缺乏信赖感。

---

## 1. 产品目标概述

**V8 目标（一句话）**：补齐电商交易闭环（收藏/购物车/结算/支付/订单）、补齐后台用户与运维管理能力、修复博客可见性等严重缺陷，并对 About 三大视觉板块与后台 UI 做现代化与质感升级，使站点从"展示型官网"演进为"可信赖、可交易、可运维"的国际化电商平台。

---

## 2. 用户故事（按模块分组）

### 模块 A：内容展示与品牌（About / 翻书 / 客户墙）
- 作为**访客**，我希望 About 页面图片更大、排版自然、不再大片留白，以便快速建立对厂商实力的信任。
- 作为**访客**，我希望价值观以"真实翻书"形式呈现且每页内容充实，以便直观感受企业文化。
- 作为**访客/采购**，我希望客户区用真实 logo 或质感卡片展示合作客户，以便确认"大厂都在用"。

### 模块 B：博客
- 作为**访客**，我希望在博客列表看到全部已发布文章（含 V7 两篇新文），以便获取最新行业内容。
- 作为**内容运营**，我希望博客以数据库为唯一来源统一发布，避免"写了却看不见"。

### 模块 C：电商交易（收藏/购物车/结算/支付/订单）
- 作为**注册用户**，我希望把商品加入购物车并一键结算，以便完成线上采购。
- 作为**注册用户**，我希望用 Stripe/PayPal（海外）或微信/支付宝（国内）付款，以便顺畅下单。
- 作为**注册用户**，我希望在"我的账户"查看订单状态与历史，以便跟踪物流与售后。
- 作为**运营/客服**，我希望在后台查看并处理订单（改状态、发货），以便履约。

### 模块 D：后台管理（用户 / 服务 / UI）
- 作为**系统管理员**，我希望在后台管理用户（列表、角色、启用/停用），以便分配权限与控制账号。
- 作为**运维管理员**，我希望在后台重启服务、配置域名/SSL/端口、一键恢复，以便自助运维。
- 作为**管理员**，我希望所有后台页面风格统一、卡片化、紧凑美观，以便高效操作。

### 模块 E：质量与合规
- 作为**站点 owner**，我希望排查并修复功能缺陷、安全隐患与 i18n 翻译错误，以便站点稳定合规。

---

## 3. 需求池（P0 / P1 / P2）

> 优先级：P0=必须（核心功能/严重 Bug）；P1=应该（重要体验/能力）；P2=可以（锦上添花）。
> 编号 V8-0xx 跨模块连续。

### P0 — 必须完成

| 编号 | 标题 | 描述 | 涉及文件/模块 |
| --- | --- | --- | --- |
| V8-001 | 修复 V7 两篇博客前端不可见 | 根因：列表页只读 DB，新文仅在 `src/data/blogs.ts`。方案二选一（建议 B）：A) 将两篇博客迁移入 DB 并置 `status='published'`；B) 列表页与详情页一致地合并 静态+DB 数据源。同步补充两篇的封面图 `/images/blog/vending-machine-trends-2026.jpg`、`cnc-tool-inventory-guide.jpg`（当前 SLUG_TO_IMAGE 已映射但图未必存在）。 | `src/app/[locale]/blog/page.tsx`、`src/data/blogs.ts`、`src/app/api/blogs/route.ts`、`public/images/blog/` |
| V8-002 | 购物车（Cart）前端+状态 | 新建购物车上下文/状态（localStorage 或用户级），商品详情页与列表支持"加入购物车"，全局购物车浮窗/角标。为后续结算与支付的前置依赖。 | 新增 `src/components/cart/*`、`src/context/CartContext.tsx`、`ProductDetailClient.tsx`、Navbar 购物车入口 |
| V8-003 | 结算流程（Checkout） | 基于购物车生成 `Order`：填写收货信息（shippingAddress）、选择支付方式、创建待支付订单（调用已有 `/api/orders`）。 | `src/app/[locale]/checkout/*`、`src/app/api/orders/route.ts`、Prisma `Order` |
| V8-004 | 海外支付集成（Stripe + PayPal） | 重点：实现 Stripe Checkout / PayPal 下单与 Webhook 回调，更新订单 `paymentStatus=paid`、`transactionId`。需先扩展 Order 模型加 `paymentMethod/paymentStatus/transactionId/paidAt`。 | 新增 `src/app/api/payments/stripe/*`、`src/app/api/payments/paypal/*`、Prisma `Order` 字段迁移 |
| V8-005 | 后台用户管理（列表/角色/状态） | 新增 admin & xiaozhouBackend 的 `/users` 页面：用户列表、搜索、角色编辑（user/admin，可扩展 editor/manager）、启用/停用（isActive）、删除。复用已有 `/api/admin/users`。 | 新增 `src/app/admin/users/*`、`src/app/xiaozhouBackend/users/*`、`src/app/api/admin/users/*`（复用） |
| V8-006 | i18n 缺陷与翻译校验（en/zh/ar） | ① 全量校验 `src/messages/{en,zh,ar}.json` 三语键一致性与翻译准确性（重点 ar RTL 与中文语境）；② 修复后台硬编码中文文案（如 `admin/layout.tsx` navLinks）；③ 确认前端页面无"语言不对应/残键显示原文 key"。 | `src/messages/*.json`、`src/app/admin/**`、`src/app/[locale]/**` |
| V8-007 | 安全与权限复核 | ① 核查 admin 路由保护：当前 `admin/layout.tsx` 依赖 `localStorage.admin_authenticated`（可被伪造绕过），需改为服务端鉴权守卫或校验 `admin_token`；② 核查 `/api/admin/*` 是否强制 admin 权限；③ 排查 XSS/注入（富文本、base64 图片处理）。 | `src/app/admin/layout.tsx`、`src/lib/auth/*`、`src/app/api/admin/**` |

### P1 — 应该完成

| 编号 | 标题 | 描述 | 涉及文件/模块 |
| --- | --- | --- | --- |
| V8-008 | About 页面排版优化 | 增大公司/工厂图高度（现 `minHeight:460px` → 建议 ≥610px，即 +1/3）；用响应式 `clamp()` 取代强行 `text-4xl/5xl` 大标题；用内容区块/微交互/数据动效填补留白，避免空旷。 | `src/app/[locale]/about/page.tsx`（约 L540–600 图片区、全局标题） |
| V8-009 | 翻书动画真实化改造 | 将 `ValuesBookFlip` 由"单卡翻转"升级为"双页书本"：书脊/中缝、翻页 3D `rotateY`+阴影渐变、页面内容更充实（图标+标题+描述+示例/数据）。保持 5s 自动翻页与手动控制。 | `src/app/[locale]/about/page.tsx`（`ValuesBookFlip` L177、`ValuesPageCard` L134） |
| V8-010 | Main Clients 客户展示升级 | 用真实 logo 图片（灰度→悬停彩色）替换纯文字；或升级为质感卡片（客户名+行业+合作年限+信赖标语）。支持 ar RTL。 | `src/app/[locale]/about/page.tsx`（L1202–1271）、`public/images/clients/` |
| V8-011 | 后台 UI 现代化统一 | 对所有 admin/xiaozhouBackend 页面套用既有 `.admin-card`/表格/按钮设计系统，统一间距、圆角、卡片化，去除零散内联样式，提升紧凑度与一致性。 | `src/app/admin/**`、`src/app/xiaozhouBackend/**`、`src/components/admin/**` |
| V8-012 | 国内支付（微信支付/支付宝） | 在 V8-004 支付框架下补齐国内通道，按用户地区/币种路由到对应支付。 | 新增 `src/app/api/payments/wechat/*`、`src/app/api/payments/alipay/*` |
| V8-013 | 后台订单管理 | 新增 admin & xiaozhouBackend 的 `/orders` 页面：订单列表（状态筛选）、详情、改状态（pending→processing→shipped→delivered/cancelled）、备注。 | 新增 `src/app/admin/orders/*`、`src/app/xiaozhouBackend/orders/*`、`src/app/api/admin/orders/*` |
| V8-014 | 博客数据源统一（消除双轨） | 以数据库为唯一来源：将 `src/data/blogs.ts` 16 条迁移入 DB（seed 脚本），删除列表/详情的双源合并逻辑，避免"写了看不见"类问题复发。 | `src/data/blogs.ts`、`prisma/seed*`、`src/app/[locale]/blog/**` |
| V8-015 | 后台服务管理模块 | 新增 admin 的"服务管理"页：重启相关服务、站点域名配置、SSL 证书更新、监听端口设置、一键恢复正常配置。实现方式见待确认 Q2。 | 新增 `src/app/admin/services/*`、`src/app/api/admin/services/*`、运维脚本 |

### P2 — 可以完成

| 编号 | 标题 | 描述 | 涉及文件/模块 |
| --- | --- | --- | --- |
| V8-016 | 合并/清理双消息源 | 删除孤儿目录根 `messages/`（132 键）或明确其用途并同步，避免维护混乱。 | 根 `messages/*`、`src/messages/*` |
| V8-017 | 客户 logo 资源扩充 | 持续补充更多真实客户 logo 与推荐语，增强信赖区。 | `public/images/clients/`、`about/page.tsx` |
| V8-018 | 后台仪表盘增强 | 在现有 dashboard 增加销售/订单/用户趋势图表与待办（未处理订单、未读消息）。 | `src/app/admin/page.tsx`、`/api/admin/stats` |
| V8-019 | 全站 RTL（ar）专项走查 | 对 ar 语言做布局、图标方向、表单对齐的专项视觉校验与修复。 | 全站 + `src/messages/ar.json` |
| V8-020 | 订单邮件/通知联动 | 下单/支付/发货触发通知（复用 `src/lib/notifications.ts`）。 | `src/lib/notifications.ts`、`orders` 流程 |

---

## 4. UI 改进建议（针对三个视觉问题）

### 4.1 About 页面排版（需求 1）
- **图片高度**：公司/工厂展示图 `minHeight:'460px'`（L562）提升至 ≥610px（约 +1/3），改用 `aspect-[4/3]` 或 `min-h-[600px]` 并保证 `object-cover` 不变形。
- **字号自然化**：移除为排版强行放大的 `text-4xl/5xl` 标题，改用 `clamp(1.75rem, 3vw, 2.75rem)` 流式字号；正文 `text-base/leading-relaxed`。
- **填补留白**：在空洞区段加入数据动效（如"800+ 客户""15 年制造"计数条）、客户证言轮播、或行业认证徽章墙，减少纯装饰渐变。

### 4.2 翻书动画（需求 2）
- **真实书本结构**：采用"左页固定 + 右页翻动"双页布局，中间加入书脊阴影与中缝高光；翻页用 `transform: rotateY()` + `transform-origin:left` + 渐变阴影模拟纸张厚度。
- **内容充实**：每页除图标/标题/描述外，增加一句"客户价值"或"关键数据"，让翻页有信息增量；封面页展示书名与目录。
- **交互保真**：保留 5s 自动翻页，增加"上一页/下一页/页码"控件与圆角纸张质感，避免"空白摆动"。

### 4.3 Main Clients 客户墙（需求 3）
- **真实 logo**：提供客户 logo 图（`public/images/clients/*.svg|png`），默认灰度、悬停恢复彩色并轻微放大，体现"被信赖"。
- **质感卡片（备选）**：若暂无 logo，改用卡片：客户名 + 行业标签 + "合作 N 年" + 短证言，配统一品牌底色与悬停浮起。
- **信赖背书**：区标题下加一行信任数据（"服务 800+ 制造企业，含 30+ 世界 500 强"），强化转化。

---

## 5. 待确认问题（需技术决策）

- **Q1 支付选型与合规**：海外以 Stripe + PayPal 为主是否足够？是否需新增 Apple Pay / Klarna / 本地化收单？国内微信/支付宝用哪类商户（普通商户 vs 服务商模式）？测试环境密钥与 Webhook 域名如何配置？
- **Q2 后台服务管理实现方式**：A) 纯前端 + 受控运维脚本（Node 子进程调用 `pm2`/systemd、`certbot`、nginx reload，需服务端执行权限与白名单）；B) 独立运维服务/SSH 代理；C) 仅做"配置可视化 + 一键执行预设脚本"。考虑到安全与可行性，建议 C 或 A（受限命令白名单），需确认部署环境与权限。
- **Q3 购物车持久化**：未登录用户用 localStorage 暂存、登录后合并到用户级；还是要求登录后方可加购？影响 V8-002/003 实现。
- **Q4 角色模型扩展**：是否需在 user/admin 之外新增 editor（仅内容）、manager（订单+用户）等细粒度角色？影响 V8-005 权限设计。
- **Q5 博客双源处置**：V8-001 临时修可见性后，是否立即执行 V8-014 全量迁移到 DB（推荐），还是保留静态源作为 fallback？
- **Q6 i18n 单一来源**：根 `messages/` 孤儿目录是否废弃？统一以 `src/messages/` 为准并补充缺失键？
- **Q7 资产到位**：客户 logo 图、V7 两篇博客封面图是否由客户提供，还是先用占位/程序生成？

---

## 附：V8 工作范围速览

| 模块 | 核心交付 | 优先级分布 |
| --- | --- | --- |
| 博客修复 | V8-001（可见性）、V8-014（数据源统一） | P0 + P1 |
| 电商闭环 | V8-002 购物车、V8-003 结算、V8-004 海外支付、V8-012 国内支付、V8-013 订单后台 | P0 + P1 |
| 后台管理 | V8-005 用户、V8-015 服务、V8-011 UI 现代化 | P0 + P1 |
| 品牌视觉 | V8-008 About、V8-009 翻书、V8-010 客户墙 | P1 |
| 质量合规 | V8-006 i18n、V8-007 安全、V8-016/019/020 | P0 + P1 + P2 |
