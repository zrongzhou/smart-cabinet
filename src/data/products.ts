export interface Product {
  id: string;
  name: { en: string; zh: string; ar: string };
  slug: string;
  sku: string;
  categories: string[];
  tags: string[];
  description: { en: string; zh: string; ar: string };
  features: { en: string[]; zh: string[]; ar: string[] };
  price: number;
  images: string[];
  status: 'active' | 'inactive' | 'coming-soon';
  featured: boolean;
  hidePrice?: boolean;
  specs?: { [key: string]: { en: string; zh: string; ar: string } };
  relatedProducts?: string[];
}

const products: Product[] = [
  {
    id: '1',
    name: { en: 'CNC Tool Smart Cabinet QT-DL80-48 - 80 Tool Types 48 Compartments', zh: 'CNC刀具智能柜 QT-DL80-48 - 80种刀具类型48格管理', ar: 'QT-DL80-48' },
    slug: 'cnc-tool-smart-cabinet-qt-dl80-48', sku: 'QT-DL80-48',
    categories: ['cabinet-1'],
    tags: ['CNC tool cabinet','RFID smart management','cutting tool','automated cabinet','刀具智能柜','CNC刀具管理','80 tool types','48 compartments'],
    description: {
      en: 'Professional CNC Tool Smart Cabinet with 80 Tool Types Management and 48 Multi-Purpose Storage Compartments. Features RFID automatic identification, real-time inventory monitoring, and complete tool lifecycle tracking.',
      zh: '专业CNC刀具智能柜，支持80种刀具类型管理和48个多功能存储格位。配备RFID自动识别、实时库存监控和完整刀具生命周期追踪功能。',
      ar: 'Professional CNC Tool Smart Cabinet with RFID.',
    },
    features: { en: ['RFID auto identification & tracking','Real-time inventory monitoring + alerts','80 tool types, 48 compartments','Auto issuing/recovery recording','Closed-loop management','ISO 9001 certified','Cloud data sync','7" touchscreen UI'], zh: ['RFID自动识别与追踪','实时库存监控+低库存警报','80种刀具类型，48格','自动发放/回收记录','闭环管理系统','ISO 9001认证','云端数据同步','7寸触摸屏'], ar: [] },
    price: 0, images: ['/images/products/qt-dl80-48.jpg'],
    status: 'active', featured: true, hidePrice: true,
    specs: { 'Tool Types':{en:'80 Types',zh:'80种',ar:''},'Compartments':{en:'48',zh:'48格',ar:''},'Identification':{en:'RFID',zh:'RFID',ar:''} },
    relatedProducts: ['2','3'],
  },
  {
    id: '2',
    name: { en: 'CNC Tool Smart Cabinet DL64A - End Mills Taps Inserts Auto Management', zh: 'CNC刀具智能柜 DL64A - 铣刀丝锥刀片自动化管理', ar: 'DL64A' },
    slug: 'cnc-tool-smart-cabinet-dl64a', sku: 'DL64A',
    categories: ['cabinet-1'],
    tags: ['DL64A','end mill management','tap management','insert tracking','铣刀管理','丝锥管理','刀片追踪'],
    description: { en: 'Optimized for end mills, taps & inserts with intelligent RFID identification.', zh: '专为铣刀、丝锥、刀片优化，配备RFID智能识别。', ar: '' },
    features: { en: ['End mill/tap/insert optimized','RFID intelligent ID','Real-time tracking','Compact design','User auth & access control'], zh: ['铣刀/丝锥/刀片优化','RFID智能识别','实时追踪','紧凑设计','用户验证+访问控制'], ar: [] },
    price: 0, images: ['/images/products/dl64a-1.jpg'],
    status: 'active', featured: true, hidePrice: true,
    specs: { 'Tool Types':{en:'64 Types',zh:'64种',ar:''},'Application':{en:'End Mills,Taps,Inserts',zh:'铣刀/丝锥/刀片',ar:''} },
    relatedProducts: ['1','3'],
  },
  {
    id: '3',
    name: { en: 'CNC Tool Expansion Cabinet DL60B - Compact High-Capacity Link', zh: 'CNC刀具扩展柜 DL60B - 紧凑高容量联动', ar: 'DL60B' },
    slug: 'cnc-tool-expansion-dl60b', sku: 'DL60B',
    categories: ['cabinet-1'],
    tags: ['expansion cabinet','DL60B','scalable storage','tool expansion','扩展柜','扩容方案'],
    description: { en: 'Compact high-capacity expansion for seamless main cabinet integration.', zh: '紧凑型高容量扩展，与主柜无缝集成。', ar: '' },
    features: { en: ['High-capacity expansion','Main cabinet link','Scalable modular','Compact footprint','Auto-sync'], zh: ['高容量扩展','主柜连接','可扩展模块','紧凑占地','自动同步'], ar: [] },
    price: 0, images: ['/images/products/dl60b.jpg'],
    status: 'active', featured: true, hidePrice: true,
    relatedProducts: ['1','2'],
  },
  {
    id: '4',
    name: { en: 'CNC Tool Expansion Cabinet DL80F - 80 Types 1-6 Units Cascading', zh: 'CNC刀具扩展柜 DL80F - 80种类型1-6台级联', ar: 'DL80F' },
    slug: 'cnc-tool-expansion-dl80f', sku: 'DL80F',
    categories: ['cabinet-1'],
    tags: ['DL80F','cascading cabinet','unlimited expansion','multi-unit link','级联扩展','多柜联动'],
    description: { en: 'Advanced expansion supporting 80 types with 1-6 unit cascading.', zh: '先进扩展柜，80种类型，支持1-6台级联。', ar: '' },
    features: { en: ['80 tool types','1-6 cascading units','Unlimited expansion','Centralized control','Real-time sync'], zh: ['80种刀具类型','1-6台级联','无限扩展','集中控制','实时同步'], ar: [] },
    price: 0, images: ['/images/products/dl80f.jpg'],
    status: 'active', featured: true, hidePrice: true,
    relatedProducts: ['1','2','3'],
  },
  {
    id: '5',
    name: { en: 'Drawer Smart Material Cabinet CTGJG-324 - 324 Compartment Multi-Material', zh: '抽屉式智能物料柜 CTGJG-324 - 324格多物料管理', ar: 'CTGJG-324' },
    slug: 'drawer-material-cabinet-ctgjg-324', sku: 'CTGJG-324',
    categories: ['cabinet-4','item-6'],
    tags: ['drawer cabinet','CTGJG-324','material management','fastener','consumables','抽屉柜','物料管理'],
    description: { en: '324-compartment drawer cabinet for multi-material management with intelligent tracking.', zh: '324格抽屉柜，多物料分类智能管理。', ar: '' },
    features: { en: ['324 compartments','Drawer layout','Per-compartment tracking','Fastener/small parts ideal','Anti-misplacement design'], zh: ['324格','抽屉布局','逐格追踪','适合紧固件小零件','防错放设计'], ar: [] },
    price: 0, images: ['/images/products/ctgjg-324.jpg'],
    status: 'active', featured: true, hidePrice: true,
    specs: { 'Compartments':{en:'324',zh:'324格',ar:''},'Type':{en:'Drawer',zh:'抽屉式',ar:''} },
    relatedProducts: ['1','6'],
  },
  {
    id: '6',
    name: { en: 'Smart Tool Cabinet STG-100 - General Purpose Tool Storage', zh: '智能工具柜 STG-100 - 通用工具存储管理', ar: 'STG-100' },
    slug: 'smart-tool-cabinet-stg-100', sku: 'STG-100',
    categories: ['cabinet-2','item-3'],
    tags: ['tool cabinet','STG-100','general tool','tool storage','工具柜','通用存储'],
    description: { en: 'General purpose smart tool cabinet for comprehensive tool storage with RFID tracking.', zh: '通用智能工具柜，全面工具存储，RFID追踪。', ar: '' },
    features: { en: ['General purpose storage','RFID all-type tracking','Automated inventory','Flexible config','Lending/tracking','Low-stock alerts'], zh: ['通用存储','全类型RFID追踪','自动库存','灵活配置','借还追踪','低库存预警'], ar: [] },
    price: 0, images: ['/images/products/stg-100.jpg'],
    status: 'active', featured: false, hidePrice: true,
    relatedProducts: ['1','5'],
  },
  {
    id: '7',
    name: { en: 'Combination Smart Cabinet CSG-200 - Modular Integrated Solution', zh: '组合智能柜 CSG-200 - 模块化集成方案', ar: 'CSG-200' },
    slug: 'combination-smart-cabinet-csg-200', sku: 'CSG-200',
    categories: ['cabinet-3'],
    tags: ['combination cabinet','CSG-200','modular','integrated solution','组合柜','模块化'],
    description: { en: 'Modular combination integrating tools, materials, documents into one unit.', zh: '模块化组合，工具+物料+文档一体化。', ar: '' },
    features: { en: ['Modular integrated','Tools+materials+docs in one','Customizable modules','Space-saving layout','Unified software','Expandable'], zh: ['模块化集成','一体多能','可定制模块','节省空间布局','统一软件','可扩展'], ar: [] },
    price: 0, images: ['/images/products/csg-200.jpg'],
    status: 'active', featured: false, hidePrice: true,
    relatedProducts: ['1','6'],
  },
  {
    id: '8',
    name: { en: 'RFID Smart File Cabinet RFG-500 - Document Security Management', zh: 'RFID智能文件柜 RFG-500 - 文档安全管理', ar: 'RFG-500' },
    slug: 'rfid-file-cabinet-rfg-500', sku: 'RFG-500',
    categories: ['cabinet-8','item-8'],
    tags: ['file cabinet','RFG-500','document security','RFID document','文件柜','文档安全'],
    description: { en: 'RFID-enabled file cabinet for secure document management with real-time tracking.', zh: 'RFID智能文件柜，安全文档管理，实时追踪。', ar: '' },
    features: { en: ['RFID real-time tracking','Access audit log','Auth-based borrowing','Location intelligence','Multi-level security','Auto return reminder'], zh: ['RFID实时追踪','访问审计日志','授权借阅','位置感知','多级安全','归还提醒'], ar: [] },
    price: 0, images: ['/images/products/rfg-500.jpg'],
    status: 'active', featured: false, hidePrice: true,
    relatedProducts: ['7'],
  },
  {
    id: '9',
    name: { en: 'Smart Weighing Cabinet SWC-300 - Precision Material Dispensing', zh: '智能称重柜 SWC-300 - 精准物料发放', ar: 'SWC-300' },
    slug: 'smart-weighing-swc-300', sku: 'SWC-300',
    categories: ['cabinet-5'],
    tags: ['weighing cabinet','SWC-300','precision dispensing','material control','称重柜','精准发放'],
    description: { en: 'Integrated precision weighing for accurate material dispensing and consumption tracking.', zh: '集成高精度称重，精准发放和消耗追踪。', ar: '' },
    features: { en: ['High-precision scale','Weigh-based dispensing','Consumption tracking','Per-user quota','Anti-theft verification','Cost accounting integration'], zh: ['高精度电子秤','按重量发放','消耗追踪','单人限额','防盗验证','成本核算对接'], ar: [] },
    price: 0, images: ['/images/products/swc-300.jpg'],
    status: 'active', featured: false, hidePrice: true,
    relatedProducts: ['5'],
  },
  {
    id: '10',
    name: { en: 'Employee Locker Cabinet ELC-600 - Personal Storage Management', zh: '员工储物柜 ELC-600 - 个人物品管理', ar: 'ELC-600' },
    slug: 'employee-locker-elc-600', sku: 'ELC-600',
    categories: ['cabinet-9'],
    tags: ['employee locker','ELC-600','personal storage','locker management','员工柜','储物柜'],
    description: { en: 'Smart locker with individual secure compartments. Card/fingerprint/face access.', zh: '智能储物柜，独立安全隔间。刷卡/指纹/人脸识别。', ar: '' },
    features: { en: ['Individual secure lockers','Card/fingerprint/face access','Temp/permanent modes','Remote management','Usage statistics','Clean design'], zh: ['独立安全储物','多种开锁方式','临时/永久模式','远程管理','使用统计','简洁设计'], ar: [] },
    price: 0, images: ['/images/products/elc-600.jpg'],
    status: 'active', featured: false, hidePrice: true,
    relatedProducts: [],
  },
  {
    id: '11',
    name: { en: 'Micro Warehousing Cabinet MWC-150 - Line-Side Inventory Hub', zh: '微仓储柜 MWC-150 - 线边仓储枢纽', ar: 'MWC-150' },
    slug: 'micro-warehousing-mwc-150', sku: 'MWC-150',
    categories: ['cabinet-6'],
    tags: ['micro warehouse','MWC-150','line-side storage','inventory hub','微仓储','线边仓'],
    description: { en: 'Compact line-side micro warehousing bridging warehouse to workstation.', zh: '紧凑线边微仓储，连接仓库和工作站。', ar: '' },
    features: { en: ['Line-side warehousing','Bridge warehouse-workstation','Intelligent replenishment','Compact footprint','WMS integration','Kanban visual'], zh: ['线边仓储','仓站连接','智能补料','紧凑占地','WMS集成','看板可视'], ar: [] },
    price: 0, images: ['/images/products/mwc-150.jpg'],
    status: 'coming-soon', featured: false, hidePrice: true,
    relatedProducts: [],
  },
  {
    id: '12',
    name: { en: 'Custom Liquid Material Cabinet CLMC - Hazardous Liquid Management', zh: '定制特殊液体管理柜 CLMC - 危化品智能管控', ar: 'CLMC' },
    slug: 'custom-liquid-clmc', sku: 'CLMC-Special',
    categories: ['custom-1'],
    tags: ['liquid cabinet','CLMC','hazardous material','custom solution','液体柜','危化管理'],
    description: { en: 'Custom smart cabinet for hazardous/special liquids with leak detection and safety compliance.', zh: '定制危化品智能柜，泄漏检测+安全合规。', ar: '' },
    features: { en: ['Leak detection sensors','Environment monitoring','Safety logging','Emergency lock-down','Chemical resistant','Ventilation system'], zh: ['泄漏检测传感器','环境监测','安全日志','紧急锁定','耐腐蚀结构','通风排气'], ar: [] },
    price: 0, images: ['/images/products/clmc-special.jpg'],
    status: 'coming-soon', featured: false, hidePrice: true,
    relatedProducts: [],
  },
];

export default products;

export function getFeaturedProducts(): Product[] { return products.filter(p => p.featured); }
export function getProductsByCategory(categoryId: string): Product[] { return products.filter(p => p.categories.includes(categoryId)); }
export function getProductBySlug(slug: string): Product | undefined {
  const found = products.find(p => p.slug === slug);
  if (found) return found;
  if (typeof window !== 'undefined') {
    try { const saved = localStorage.getItem('admin_products'); if (saved) { return JSON.parse(saved).find((p: Product) => p.slug === slug); } } catch(e) {}
  }
  return undefined;
}
export function getProductById(id: string): Product | undefined { return products.find(p => p.id === id); }
export function getAllProducts(): Product[] { return products; }
