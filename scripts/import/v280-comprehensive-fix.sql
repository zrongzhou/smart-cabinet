-- ============================================================
-- v280 综合数据修复（一次性执行）
-- 1. 拆分 By Managed items 下 2 个合并分类为 4 个独立分类
-- 2. 更新产品-分类关联（_CategoryToProduct）
-- 3. 全部 30 个分类 + 26 个产品 的 zh/ar 自动翻译补全
-- ============================================================

BEGIN;

-- -----------------------------------------------------------
-- STEP 1: 拆分"By Managed items"下的 2 个合并分类
-- -----------------------------------------------------------

-- 1a. 把 "CNC Tool Management / PPE & Safety Supplies" 改名为纯 "CNC Tool Management"
UPDATE categories SET "name" = '{"ar":"إدارة أدوات CNC","en":"CNC Tool Management","zh":"CNC 刀具管理"}'::jsonb,
  slug = 'sub-cnc-tool-management',
  "updatedAt" = NOW()
WHERE id = 'cmr6j6wzx000jvxlu43uvhob7';

-- 1b. 新建 "PPE & Safety Supplies" 子分类（挂到 cat-managed-items 下）
INSERT INTO categories ("id", "slug", "name", "icon", "description", "parentId", "order", "status", "type", "createdAt", "updatedAt")
VALUES (
  'cmr6new-ppe-safety',
  'sub-ppe-safety-supplies',
  '{"ar":"مستلزمات السلامة ومعدات الحماية الشخصية","en":"PPE & Safety Supplies","zh":"劳保安全防护用品"}'::jsonb,
  NULL,
  NULL,
  'cmr6j6wzw000hvxlulv4cmdfa',
  0,
  'active',
  'product',
  NOW(),
  NOW()
);

-- 1c. 把 "Fasteners & Consumables / Documents & Archives" 改名为纯 "Fasteners & Consumables"
UPDATE categories SET "name" = '{"ar":"المثبتات والمستهلكات","en":"Fasteners & Consumables","zh":"紧固件与耗材"}'::jsonb,
  slug = 'sub-fasteners-consumables',
  "updatedAt" = NOW()
WHERE id = 'cmr6j6wzz000lvxluvelxd476';

-- 1d. 新建 "Documents & Archives" 子分类（挂到 cat-managed-items 下）
INSERT INTO categories ("id", "slug", "name", "icon", "description", "parentId", "order", "status", "type", "createdAt", "updatedAt")
VALUES (
  'cmr6new-docs-archives',
  'sub-documents-archives',
  '{"ar":"الوثائق والأرشيف","en":"Documents & Archives","zh":"文档与档案"}'::jsonb,
  NULL,
  NULL,
  'cmr6j6wzw000hvxlulv4cmdfa',
  0,
  'active',
  'product',
  NOW(),
  NOW()
);

-- -----------------------------------------------------------
-- STEP 2: 修正产品-分类关联
-- -----------------------------------------------------------

-- MAT-002 从旧的合并分类移到新的 PPE & Safety Supplies
DELETE FROM "_CategoryToProduct" WHERE "B" = (SELECT id FROM products WHERE sku = 'MAT-002');
INSERT INTO "_CategoryToProduct" ("A", "B") VALUES ('cmr6new-ppe-safety', (SELECT id FROM products WHERE sku = 'MAT-002'));

-- MAT-004 从旧的合并分类移到新的 Documents & Archives
DELETE FROM "_CategoryToProduct" WHERE "B" = (SELECT id FROM products WHERE sku = 'MAT-004');
INSERT INTO "_CategoryToProduct" ("A", "B") VALUES ('cmr6new-docs-archives', (SELECT id FROM products WHERE sku = 'MAT-004'));

-- -----------------------------------------------------------
-- STEP 3: 全量翻译补全 — 分类表
-- ============================================================

-- === L1 一级分类 (4个) ===
UPDATE categories SET "name" = '{"ar":"حسب أنواع الخزائن","en":"By Cabinets types","zh":"按柜体类型"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'cat-cabinet';
UPDATE categories SET "name" = '{"ar":"حسب المواد المُدارة","en":"By Managed items","zh":"按管理物料"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'cat-managed-items';
UPDATE categories SET "name" = '{"ar":"حسب الصناعات","en":"By Industries","zh":"按行业"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'cat-industry';
UPDATE categories SET "name" = '{"ar":"أخرى","en":"Others","zh":"其他"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'cat-others';

-- === CAB L2 子分类 (8个) ===
UPDATE categories SET "name" = '{"ar":"ماكينات بيع أدوات التصنيع CNC","en":"CNC Tool Vending Machines","zh":"CNC 刀具自动售货机"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-cnc-tool-vending-machines';
UPDATE categories SET "name" = '{"ar":"خزانة فرعية لماكينات بيع أدوات CNC","en":"CNC Tool Vending Machines-sub cabinet","zh":"CNC 刀具自动售货机-副柜"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-cnc-tool-vending-sub-cabinet';
UPDATE categories SET "name" = '{"ar":"خزائن الأدوات الذكية","en":"Smart Tool locker Cabinets","zh":"智能工具储物柜"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-smart-tool-locker-cabinets';
UPDATE categories SET "name" = '{"ar":"ماكينات البيع الصناعية المعيارية","en":"Modular Industrial Vending Machines","zh":"模块化工业自动售货机"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-modular-industrial-vending-machines';
UPDATE categories SET "name" = '{"ar":"خزائن الأدراج الذكية","en":"Smart Drawer Cabinets","zh":"智能抽屉式工具柜"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-smart-drawer-cabinets';
UPDATE categories SET "name" = '{"ar":"خزائن الوزن الذكية","en":"Smart Weighing Cabinets","zh":"智能称重柜"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-smart-weighing-cabinets';
UPDATE categories SET "name" = '{"ar":"خزائن التخزين المصغرة","en":"Micro Warehousing Cabinets","zh":"微型仓储柜"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-micro-warehousing-cabinets';
UPDATE categories SET "name" = '{"ar":"خزائن RFID الذكية","en":"RFID Smart Cabinets","zh":"RFID 智能柜"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-rfid-smart-cabinets';

-- === MAT L2 子分类 (9个) ===
-- CNC Tool Management 已在 STEP 1a 中更新
-- PPE & Safety Supplies 已在 STEP 1b 中新建
-- Fasteners & Consumables 已在 STEP 1c 中更新
-- Documents & Archives 已在 STEP 1d 中新建
UPDATE categories SET "name" = '{"ar":"تخزين الموظفين الشخصي","en":"Employee Personal Storage","zh":"员工个人储物"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-employee-personal-storage';
UPDATE categories SET "name" = '{"ar":"الأدوات والأصول القابلة لإعادة الاستخدام","en":"Reusable Tools & Assets","zh":"可复用工具与资产"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-reusable-tools-assets';
UPDATE categories SET "name" = '{"ar":"مستلزمات المكتب","en":"Office Supplies","zh":"办公用品"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-office-supplies';
UPDATE categories SET "name" = '{"ar":"استلام الوجبات وجمع الوجبات","en":"Food Pickup and Meal Collection","zh":"取餐与餐食收集"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-food-pickup-meal-collection';
UPDATE categories SET "name" = '{"ar":"إدارة السوائل الكيميائية","en":"Chemical Liquid Management","zh":"化学品液体管理"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-chemical-liquid-management';

-- === IND L2 子分类 (8个) ===
UPDATE categories SET "name" = '{"ar":"التشغيل CNC وتصنيع القطع الدقيقة","en":"CNC Machining and Precision Parts Manufacturing","zh":"CNC 加工与精密零件制造"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-cnc-machining';
UPDATE categories SET "name" = '{"ar":"التصنيع العام والمصنع الذكي","en":"General Manufacturing and Smart Factory","zh":"通用制造与智能工厂"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-general-manufacturing';
UPDATE categories SET "name" = '{"ar":"الأجهزة والتصنيع المعدني ومعالجة الألمنيوم","en":"Hardware, Metal Fabrication and Aluminum Processing","zh":"五金、金属加工与铝材处理"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-metal-fabrication';
UPDATE categories SET "name" = '{"ar":"القوالب والحقن وأدوات الدقة","en":"Mold, Injection Molding and Precision Tooling","zh":"模具、注塑与精密工具"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-mold-tooling';
UPDATE categories SET "name" = '{"ar":"الإلكترونيات وأشباه الموصلات والكهرباء والبصريات","en":"Electronics, Semiconductor, Electrical and Optical Manufacturing","zh":"电子、半导体、电气与光学制造"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-electronics-manufacturing';
UPDATE categories SET "name" = '{"ar":"تصنيع مكونات السيارات والمركبات الكهربائية","en":"Automotive and EV Components Manufacturing","zh":"汽车与电动汽车零部件制造"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-automotive-manufacturing';
UPDATE categories SET "name" = '{"ar":"تصنيع الأجهزة الطبية ومعدات علوم الحياة","en":"Medical Device and Life Science Equipment Manufacturing","zh":"医疗器械与生命科学设备制造"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-medical-device';
UPDATE categories SET "name" = '{"ar":"المواد الجديدة والكابلات والمواد الوظيفية","en":"New Materials, Cable and Functional Materials Manufacturing","zh":"新材料、线缆与功能材料制造"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-new-materials';

-- === OTH L2 子分类 (1个) ===
UPDATE categories SET "name" = '{"ar":"مخصص","en":"customized","zh":"定制化"}'::jsonb, "updatedAt"=NOW() WHERE slug = 'sub-customized';

-- -----------------------------------------------------------
-- STEP 4: 全量翻译补全 — 产品表 (26 个)
-- ============================================================

-- CAB (8个) — en 已在 v279 fix-cab-names.sql 中更新，此处确保 zh/ar 一致
UPDATE products SET "name" = '{"en":"CNC Tool Vending Machine - Smart CNC Tool Cabinet for Tool Inventory Management","zh":"CNC刀具自动售货机 - 用于刀具库存管理的智能CNC工具柜","ar":"ماكينة بيع أدوات CNC - خزانة أدوات CNC ذكية لإدارة مخزون الأدوات"}'::jsonb WHERE sku = 'CAB-001';
UPDATE products SET "name" = '{"en":"DL80F Tool Vending Auxiliary Cabinet for CNC Cutting Tool Storage Expansion","zh":"DL80F 刀具售货辅助柜 - 用于CNC切削刀具存储扩展","ar":"خزانة مساعدة لماكينة بيع الأدوات DL80F لتوسيع تخزين أدوات CNC"}'::jsonb WHERE sku = 'CAB-002';
UPDATE products SET "name" = '{"en":"Industrial Tool Locker Cabinet for Tools, PPE, Spare Parts and MRO Supplies","zh":"工业工具储物柜 - 用于工具、劳保用品、备件和MRO耗材","ar":"خزانة أدوات صناعية للأدوات ومعدات السلامة والقطع الغيار ولوازم MRO"}'::jsonb WHERE sku = 'CAB-003';
UPDATE products SET "name" = '{"en":"Modular Industrial Vending Machine for Tools, PPE and MRO Supplies","zh":"模块化工业自动售货机 - 用于工具、劳保用品和MRO耗材","ar":"ماكينة بيع صناعية معيارية للأدوات ومعدات السلامة ولوازم MRO"}'::jsonb WHERE sku = 'CAB-004';
UPDATE products SET "name" = '{"en":"Smart Drawer Tool Cabinet for Measuring Tools, Gauges and Reusable Assets","zh":"智能抽屉工具柜 - 用于量具、检具和可重复使用资产","ar":"خزانة أدراج ذكية للأدوات القياس والمقاييس والأصول القابلة لإعادة الاستخدام"}'::jsonb WHERE sku = 'CAB-005';
UPDATE products SET "name" = '{"en":"Weight-based vending cabinet for fasteners screws nuts and industrial consumables","zh":"称重式自动售货柜 - 用于紧固件、螺丝、螺母和工业耗材","ar":"خزانة بيع مبنية على الوزن للمثبتات والمسامير والصواميل واللوازم الصناعية"}'::jsonb WHERE sku = 'CAB-006';
UPDATE products SET "name" = '{"en":"Automated Micro Warehouse Cabinet for Printing Wheels, Tools and Reusable Parts","zh":"自动化微型仓储柜 - 用于印轮、工具和可重复使用零件","ar":"خزانة مستودع صغير آلي لعجلات الطباعة والأدوات والقطع القابلة لإعادة الاستخدام"}'::jsonb WHERE sku = 'CAB-007';
UPDATE products SET "name" = '{"en":"RFID Smart Cabinet for Document Tracking, Asset Management and File Storage","zh":"RFID智能柜 - 用于文档追踪、资产管理和文件存储","ar":"خزانة ذكية RFID لتتبع المستندات وإدارة الأصول وتخزين الملفات"}'::jsonb WHERE sku = 'CAB-008';

-- MAT (9个)
UPDATE products SET "name" = '{"en":"CNC Tool Vending Machine for Cutting Tools, Inserts, End Mills and Taps","zh":"CNC 刀具自动售货机 - 用于切削刀具、刀片、立铣刀和丝锥","ar":"ماكينة بيع أدوات CNC لأدوات القطع والشرائط والفرازات والقلاوظ"}'::jsonb WHERE sku = 'MAT-001';
UPDATE products SET "name" = '{"en":"PPE Vending Machine for Industrial Safety Supplies and Employee Distribution","zh":"劳保自动售货机 - 用于工业安全防护用品及员工发放","ar":"ماكينة بيع مستلزمات السلامة الصناعية وتوزيع الموظفين"}'::jsonb WHERE sku = 'MAT-002';
UPDATE products SET "name" = '{"en":"Fastener Vending Cabinet for Screws, Nuts, Bolts and MRO Consumables","zh":"紧固件自动售货柜 - 用于螺丝、螺母、螺栓和MRO耗材","ar":"خزانة بيع المثبتات للمسامير والصواميل والبراغي ولوازم MRO"}'::jsonb WHERE sku = 'MAT-003';
UPDATE products SET "name" = '{"en":"Smart File Cabinet for Document Management, Archive Storage and File Tracking","zh":"智能文件柜 - 用于文档管理、档案存储和文件追踪","ar":"خزانة ملفات ذكية لإدارة المستندات والتخزين الأرشيفي وتتبع الملفات"}'::jsonb WHERE sku = 'MAT-004';
UPDATE products SET "name" = '{"en":"Smart Locker System for Employee Lockers, Offices and Workplace Storage","zh":"智能储物柜系统 - 用于员工储物柜、办公室和工作场所存储","ar":"نظام خزائن ذكي لخزائن الموظفين والمكاتب وتخزين أماكن العمل"}'::jsonb WHERE sku = 'MAT-005';
UPDATE products SET "name" = '{"en":"Tool Tracking System for Reusable Tools, Gauges, Fixtures and Asset Control","zh":"工具追踪系统 - 用于可复用工量具、检具、夹具和资产管控","ar":"نظام تتبع الأدوات للأدوات القابلة لإعادة الاستخدام والمقاييس والتثبيتات وإدارة الأصول"}'::jsonb WHERE sku = 'MAT-006';
UPDATE products SET "name" = '{"en":"Office Supply Vending Machine for Stationery, IT Supplies and Workplace Consumables","zh":"办公用品自动售货机 - 用于文具、IT物资和工作场所耗材","ar":"ماكينة بيع مستلزمات المكتب للمستلزمات المكتبية ولوازم تقنية المعلومات واستهلاك أماكن العمل"}'::jsonb WHERE sku = 'MAT-007';
UPDATE products SET "name" = '{"en":"Smart Food Pickup Locker for Takeout, Meal Collection and Office Buildings","zh":"智能取餐柜 - 用于外卖取餐、餐食收集和办公大楼","ar":"خزانة طعام ذكية لاستلام الطلبات وجمع الوجبات والمباني المكتبية"}'::jsonb WHERE sku = 'MAT-008';
UPDATE products SET "name" = '{"en":"Refrigerated Chemical Storage Cabinet for Lab Reagents, Liquid Bottles and Samples","zh":"冷藏化学品储存柜 - 用于实验室试剂、液体试剂瓶和样品","ar":"خزانة تخزين كيميائية مبردة لمواد مخبرية وقارورات السوائل والعينات"}'::jsonb WHERE sku = 'MAT-009';

-- IND (8个)
UPDATE products SET "name" = '{"en":"CNC Tool Vending Machine Solution for CNC Machining and Precision Parts","zh":"CNC 刀具自动售货机方案 - 面向 CNC 加工与精密零件制造","ar":"حل ماكينة بيع أدوات CNC للتشغيل CNC وتصنيع القطع الدقيقة"}'::jsonb WHERE sku = 'IND-001';
UPDATE products SET "name" = '{"en":"Industrial Vending Machine Solution for Smart Factory Inventory Management","zh":"工业自动售货机方案 - 面向通用制造与智能工厂库存管理","ar":"حل ماكينة بيع صناعية لإدارة مخزون المصنع الذكي والتصنيع العام"}'::jsonb WHERE sku = 'IND-002';
UPDATE products SET "name" = '{"en":"Industrial Vending Cabinet for Metal Fabrication Tools, Fasteners and PPE","zh":"工业自动售货柜 - 面向五金金属加工工具、紧固件和劳保防护","ar":"خزانة بيع صناعية لأدوات تصنيع المعادن والمثبتات ومعدات السلامة"}'::jsonb WHERE sku = 'IND-003';
UPDATE products SET "name" = '{"en":"Smart Tool Cabinet Solution for Mold Shops, Injection Molding and Spare Parts","zh":"智能工具柜方案 - 面向模具车间、注塑成型和备件管理","ar":"حل خزانة أدوات ذكية لورش القوالب والحقن بالقولبة والقطع الغيار"}'::jsonb WHERE sku = 'IND-004';
UPDATE products SET "name" = '{"en":"Smart Cabinet Solution for Electronics, Semiconductor and ESD Supplies Management","zh":"智能柜方案 - 面向电子半导体电气光学制造与ESD物料管理","ar":"حل خزانة ذكية لإدارة الإلكترونيات وأشباه الموصلات والكهرباء والبصريات ومستلزمات ESD"}'::jsonb WHERE sku = 'IND-005';
UPDATE products SET "name" = '{"en":"Industrial Vending Machine Solution for Automotive and EV Components Manufacturing","zh":"工业自动售货机方案 - 面向汽车与电动汽车零部件制造","ar":"حل ماكينة بيع صناعية لتصنيع مكونات السيارات والمركبات الكهربائية"}'::jsonb WHERE sku = 'IND-006';
UPDATE products SET "name" = '{"en":"Smart Cabinet Solution for Medical Device Manufacturing Supplies and PPE","zh":"智能柜方案 - 面向医疗器械制造供应品与劳保防护","ar":"حل خزانة ذكية لمستلزمات تصنيع الأجهزة الطبية ومعدات السلامة"}'::jsonb WHERE sku = 'IND-007';
UPDATE products SET "name" = '{"en":"Smart Cabinet Solution for New Materials, Cable and Functional Materials Manufacturing","zh":"智能柜方案 - 面向新材料线缆与功能材料制造","ar":"حل خزانة ذكية لتصنيع المواد الجديدة والكابلات والمواد الوظيفية"}'::jsonb WHERE sku = 'IND-008';

-- OTH (1个)
UPDATE products SET "name" = '{"en":"Custom Industrial Vending Machine and Smart Cabinet Solutions","zh":"定制化工业自动售货机与智能柜解决方案","ar":"حلول الخزائن الذكية وماكينات البيع الصناعية المخصصة"}'::jsonb WHERE sku = 'OTH-001';

COMMIT;
