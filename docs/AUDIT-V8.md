# V8 全站审计报告（AUDIT-V8）

> 审计时间：2026-07-07 | 审计范围：V8 全量更新（T0–T7）落地后的系统状态
> 审计方式：主线程协调者驱动核查（i18n 校验脚本 + 静态代码核查 + 构建产物复核）
> 前置状态：`npm run build` 已全绿（BUILD_ID `tq3vHXAiVqU-xDEZcMi2z`），65 个文件改动

## 一、核查项与结果

| # | 核查项 | 方法 | 结果 |
|---|--------|------|------|
| A1 | i18n 三语键一致性 | `node scripts/validate-i18n.mjs` | ✅ public 组 478 键×3 语言一致；admin 组 47 键×3 语言一致；无 `value==key` 残键 |
| A2 | 前台硬编码中文 visible 文案 | Grep `[\x{4e00}-\x{9fff}]` in `src/app/[locale]` | ✅ 仅命中三语切换写法（`locale==='zh'?'中文':...`）与 JSON-LD `alternateName`（SEO 结构化数据，含中文公司名合理），无英文/阿语站硬编码中文 |
| A3 | ar（阿拉伯语）RTL 适配 | Grep `left-`/`right-` in `src/components/about` | ⚠️ 翻页按钮已 `isRTL` 翻转；半页容器 `left-0 right-1/2` 在 RTL 下未镜像（见 P2-1） |
| A4 | 后台写操作鉴权覆盖 | Grep `requireAdmin`/`verifyAuth` in `src/app/api/admin/**` | ✅ 全部写操作路由（含新建 `/api/admin/orders`、`/api/admin/services`）均守卫；`login` 按设计不守卫 |
| A5 | 命令注入安全（服务管理） | Grep `exec(` in `src/lib/services` | ✅ 全模块仅用 `execFile(cmd,[args])`，无 shell 拼接 |
| A6 | 后台路由完整性 | `ls src/app/admin` & `src/app/xiaozhouBackend` | ✅ 两套后台均含 blog/categories/faqs/media/editor/settings/tags/users/orders/services 全套 page |
| A7 | 购物车/结算链路 | 文件存在性核查 | ✅ `CartContext.tsx`、`[locale]/checkout/page.tsx`、`api/user/cart/route.ts`、`CartButton`、`CartDrawer`、`ProductDetailClient` 引用链完整 |
| A8 | 支付集成 | 文件核查 | ✅ `stripe`+`@paypal/checkout-server-sdk` 真实 SDK；微信/支付宝 mock 框架（`getProvider` 工厂，缺密钥自动降级） |
| A9 | 登录 Token 链路 | 读 `admin/login` & `xiaozhouBackend/login` | ✅ 两登录页写入真实 JWT（`data.token`），`requireAdmin` 守卫可通过（主理人已修伪值 bug） |

## 二、发现清单（按等级）

### P0（阻断）—— 0 项
无阻断级缺陷。

### P1（应修）—— 0 项
无 P1 级缺陷。

### P2（观察/非阻断）
- **P2-1** `ValuesBook.tsx` 半页容器（`left-0 right-1/2` 左半页、`right-0 left-1/2` 右半页）在 ar（RTL）下未按镜像布局，书页左右视觉可能与 LTR 相反。翻页按钮位置已正确 RTL 翻转，仅中缝半页容器未镜像。影响：ar 站翻书视觉略不自然，不影响功能。暂记观察，不强行改以避免破坏翻页动画。
- **P2-2** `Order.adminNote` 字段已加入 Prisma schema，但需上线前执行一次 `prisma migrate`（本地无 DB，不影响构建）。
- **P2-3** 服务管理 `nginx -s reload` / `certbot renew` / 写 nginx conf 需部署侧为 app 用户配置**仅白名单命令**的受限 sudo，否则运行时返回 500/权限错误（代码层已正确发命令并清晰报错）。

## 三、修复记录
本轮审计未对源码做修改（无 P0/P1 需修）。T8 之前已在其他阶段完成的修复：
- 主理人修复：两个后台登录页写入真实 JWT（原为伪值 `'authenticated-'+Date.now()`）
- T7 修复：`src/messages/admin.*` 三语补齐、删孤儿根 `messages/`、补 `test-wechat` SSRF 守卫
- T8 前构建期修复：`xiaozhouBackend` 组件/库镜像补全、`/api/orders` 支付关联名 `payments`、购物车 Json 类型转换、博客 JsonValue 转换、PayPal 类型声明

## 四、已知边界（非 V8 引入）
1. `seoKeywords` 仍未入库（Prisma `BlogPost` 无该列，V7 遗留；slug 正常持久化）
2. xiaozhouBackend 历史 4 个 tsc 错误（克隆 admin 遗留），但生产 `next build` 已全绿，不影响运行
3. 国内支付（微信/支付宝）为 mock 框架，需真实商户密钥后按代码注释接入即用

## 五、结论
V8 全量更新代码完整、生产构建通过、核心链路（i18n / 安全 / 购物车 / 支付 / 后台管理 / 服务管理）静态核查无阻断缺陷。可进入 QA 验证与 git 提交阶段。
