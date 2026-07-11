-- v279 follow-up: CAB-001..008 product NAME must be the real product name (【产品名称标题】 = title_en),
-- NOT the L2 sub-category name (name_en). Category assignment (L2) is already correct in categories table.
-- Fix en/zh/ar for all 8 CAB products.

UPDATE products SET "name" = '{"en":"CNC Tool Vending Machine - Smart CNC Tool Cabinet for Tool Inventory Management","zh":"CNC刀具自动售货机 - 用于刀具库存管理的智能CNC工具柜","ar":"ماكينة بيع أدوات CNC - خزانة أدوات CNC ذكية لإدارة مخزون الأدوات"}'::jsonb WHERE "slug"='tool-vending-machine-cnc-tools.html';

UPDATE products SET "name" = '{"en":"DL80F Tool Vending Auxiliary Cabinet for CNC Cutting Tool Storage Expansion","zh":"DL80F 刀具售货辅助柜 - 用于CNC切削刀具存储扩展","ar":"خزانة مساعدة لماكينة بيع الأدوات DL80F لتوسيع تخزين أدوات CNC"}'::jsonb WHERE "slug"='tool-vending-expansion-cabinet.html';

UPDATE products SET "name" = '{"en":"Industrial Tool Locker Cabinet for Tools, PPE, Spare Parts and MRO Supplies","zh":"工业工具储物柜 - 用于工具、劳保用品、备件和MRO耗材","ar":"خزانة أدوات صناعية للأدوات ومعدات السلامة والقطع الغيار ولوازم MRO"}'::jsonb WHERE "slug"='smart-tool-locker-cabinet.html';

UPDATE products SET "name" = '{"en":"Modular Industrial Vending Machine for Tools, PPE and MRO Supplies","zh":"模块化工业自动售货机 - 用于工具、劳保用品和MRO耗材","ar":"ماكينة بيع صناعية معيارية للأدوات ومعدات السلامة ولوازم MRO"}'::jsonb WHERE "slug"='modular-industrial-vending-machine.html';

UPDATE products SET "name" = '{"en":"Smart Drawer Tool Cabinet for Measuring Tools, Gauges and Reusable Assets","zh":"智能抽屉工具柜 - 用于量具、检具和可重复使用资产","ar":"خزانة أدراج ذكية للأدوات القياس والمقاييس والأصول القابلة لإعادة الاستخدام"}'::jsonb WHERE "slug"='smart-drawer-tool-cabinet.html';

UPDATE products SET "name" = '{"en":"Weight-based vending cabinet for fasteners screws nuts and industrial consumables","zh":"称重式自动售货柜 - 用于紧固件、螺丝、螺母和工业耗材","ar":"خزانة بيع مبنية على الوزن للمثبتات والمسامير والصواميل واللوازم الصناعية"}'::jsonb WHERE "slug"='weight-based-vending-cabinet.html';

UPDATE products SET "name" = '{"en":"Automated Micro Warehouse Cabinet for Printing Wheels, Tools and Reusable Parts","zh":"自动化微型仓储柜 - 用于印轮、工具和可重复使用零件","ar":"خزانة مستودع صغير آلي لعجلات الطباعة والأدوات والقطع القابلة لإعادة الاستخدام"}'::jsonb WHERE "slug"='automated-tool-storage-system.html';

UPDATE products SET "name" = '{"en":"RFID Smart Cabinet for Document Tracking, Asset Management and File Storage","zh":"RFID智能柜 - 用于文档追踪、资产管理和文件存储","ar":"خزانة ذكية RFID لتتبع المستندات وإدارة الأصول وتخزين الملفات"}'::jsonb WHERE "slug"='rfid-asset-tracking-cabinet.html';
