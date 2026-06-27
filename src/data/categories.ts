export interface Category {
  id: string;
  slug: string;
  name: {
    en: string;
    zh: string;
    ar: string;
  };
  type: 'cabinet-type' | 'managed-items' | 'industry' | 'custom-solution';
  icon: string;
  parentId?: string; // For secondary/child categories
  description?: {
    en: string;
    zh: string;
    ar: string;
  };
}

// Dimension labels for UI filtering (keys must match Category.type values in DB)
export const dimensionLabels = {
  en: {
    'cabinet-type': 'By Cabinet Type',
    'managed-items': 'By Managed Items',
    industry: 'By Industry',
    'custom-solution': 'Custom Solutions',
  },
  zh: {
    'cabinet-type': '柜型分类',
    'managed-items': '管理物料分类',
    industry: '行业分类',
    'custom-solution': '定制方案',
  },
  ar: {
    'cabinet-type': 'حسب نوع الخزانة',
    'managed-items': 'حسب المواد المدارة',
    industry: 'حسب الصناعة',
    'custom-solution': 'حلول مخصصة',
  },
};

// ① 柜型分类 (9 categories)
const cabinetTypes: Category[] = [
  {
    id: 'cabinet-1',
    slug: 'smart-cutting-tool-cabinets',
    name: {
      en: 'Smart Cutting Tool Cabinets',
      zh: '智能刀具柜',
      ar: 'خزائن أدوات القطع الذكية',
    },
    type: 'cabinet-type',
    icon: 'Scissors',
    description: {
      en: 'Intelligent cabinets specifically designed for CNC cutting tool management with RFID tracking',
      zh: '专为CNC刀具管理设计的智能柜，配备RFID追踪功能',
      ar: 'خزائن ذكية مصممة خصيصاً لإدارة أدوات القطع CNC مع تتبع RFID',
    },
  },
  {
    id: 'cabinet-2',
    slug: 'smart-tool-cabinets',
    name: {
      en: 'Smart Tool Cabinets',
      zh: '智能工具柜',
      ar: 'خزائن الأدوات الذكية',
    },
    type: 'cabinet-type',
    icon: 'Wrench',
    description: {
      en: 'Versatile smart cabinets for general tool and equipment management',
      zh: '用于通用工具和设备的多功能智能柜',
      ar: 'خزائن ذكية متعددة الاستخدامات لإدارة الأدوات والمعدات العامة',
    },
  },
  {
    id: 'cabinet-3',
    slug: 'combination-smart-cabinets',
    name: {
      en: 'Combination Smart Cabinets',
      zh: '组合柜',
      ar: 'الخزائن الذكية المدمجة',
    },
    type: 'cabinet-type',
    icon: 'Layers',
    description: {
      en: 'Modular cabinet systems that combine multiple storage and management functions',
      zh: '结合多种存储和管理功能的模块化柜体系统',
      ar: 'أنظمة خزائن معيارية تجمع بين وظائف التخزين والإدارة المتعددة',
    },
  },
  {
    id: 'cabinet-4',
    slug: 'smart-drawer-cabinets',
    name: {
      en: 'Smart Drawer Cabinets',
      zh: '抽屉柜',
      ar: 'الخزائن الذكية ذات الأدراج',
    },
    type: 'cabinet-type',
    icon: 'FolderOpen',
    description: {
      en: 'Drawer-based smart cabinets for organized storage of small parts and components',
      zh: '基于抽屉的智能柜，用于小零件和组件的有序存储',
      ar: 'خزائن ذكية تعتمد على الأدراج لتخزين الأجزاء والمكونات الصغيرة بشكل منظم',
    },
  },
  {
    id: 'cabinet-5',
    slug: 'smart-weighing-cabinets',
    name: {
      en: 'Smart Weighing Cabinets',
      zh: '称重柜',
      ar: 'الخزائن الذكية للوزن',
    },
    type: 'cabinet-type',
    icon: 'Scale',
    description: {
      en: 'Cabinets with integrated weighing systems for precise inventory tracking',
      zh: '配备集成称重系统的柜子，用于精确库存追踪',
      ar: 'خزائن مزودة بأنظمة وزن متكاملة لتتبع المخزون بدقة',
    },
  },
  {
    id: 'cabinet-6',
    slug: 'micro-warehousing-cabinets',
    name: {
      en: 'Micro Warehousing Cabinets',
      zh: '微仓储',
      ar: 'خزائن التخزين المصغر',
    },
    type: 'cabinet-type',
    icon: 'Warehouse',
    description: {
      en: 'Compact warehousing solutions for distributed inventory management',
      zh: '用于分布式库存管理的紧凑型仓储解决方案',
      ar: 'حلول التخزين المدمجة للإدارة الموزعة للمخزون',
    },
  },
  {
    id: 'cabinet-7',
    slug: 'rfid-smart-cabinets',
    name: {
      en: 'RFID Smart Cabinets',
      zh: 'RFID智能柜',
      ar: 'الخزائن الذكية RFID',
    },
    type: 'cabinet-type',
    icon: 'Radio',
    description: {
      en: 'Cabinets using RFID technology for automatic item identification and tracking',
      zh: '使用RFID技术进行物品自动识别和追踪的柜子',
      ar: 'خزائن تستخدم تقنية RFID للتعرف التلقائي على العناصر وتتبعها',
    },
  },
  {
    id: 'cabinet-8',
    slug: 'smart-file-cabinets',
    name: {
      en: 'Smart File Cabinets',
      zh: '文件柜',
      ar: 'الخزائن الذكية للملفات',
    },
    type: 'cabinet-type',
    icon: 'FileText',
    description: {
      en: 'Intelligent cabinets for document and file management with access control',
      zh: '用于文档和文件管理的智能柜，配备访问控制',
      ar: 'خزائن ذكية لإدارة المستندات والملفات مع التحكم في الوصول',
    },
  },
  {
    id: 'cabinet-9',
    slug: 'employee-locker-cabinets',
    name: {
      en: 'Employee Locker Cabinets',
      zh: '员工储物柜',
      ar: 'خزائن الموظفين',
    },
    type: 'cabinet-type',
    icon: 'Lock',
    description: {
      en: 'Smart lockers for employee personal storage with digital access management',
      zh: '用于员工个人存储的智能储物柜，配备数字访问管理',
      ar: 'خزائن ذكية للتخزين الشخصي للموظفين مع إدارة الوصول الرقمي',
    },
  },
];

// ② 管理物料分类 (10 categories)
const itemTypes: Category[] = [
  {
    id: 'item-1',
    slug: 'mro-material-management',
    name: {
      en: 'MRO Material Management',
      zh: 'MRO物料管理',
      ar: 'إدارة مواد MRO',
    },
    type: 'managed-items',
    icon: 'Package',
    description: {
      en: 'Management solutions for Maintenance, Repair, and Operations consumables',
      zh: '维护、维修和运营耗材的管理解决方案',
      ar: 'حلول الإدارة للمنتجات الاستهلاكية للصيانة والإصلاح والعمليات',
    },
  },
  {
    id: 'item-2',
    slug: 'ppe-management',
    name: {
      en: 'PPE Management',
      zh: 'PPE劳保用品管理',
      ar: 'إدارة معدات الحماية الشخصية',
    },
    type: 'managed-items',
    icon: 'Shield',
    description: {
      en: 'Smart management of Personal Protective Equipment with compliance tracking',
      zh: '配备合规性追踪的个人防护用品智能管理',
      ar: 'الإدارة الذكية لمعدات الحماية الشخصية مع تتبع الامتثال',
    },
  },
  {
    id: 'item-3',
    slug: 'tool-management',
    name: {
      en: 'Tool Management',
      zh: '工具管理',
      ar: 'إدارة الأدوات',
    },
    type: 'managed-items',
    icon: 'Wrench',
    description: {
      en: 'Comprehensive tool tracking and management system for workshops and factories',
      zh: '用于车间和工厂的全面工具追踪和管理系统',
      ar: 'نظام شامل لتتبع وإدارة الأدوات لورش العمل والمصانع',
    },
  },
  {
    id: 'item-4',
    slug: 'cutting-tool-management',
    name: {
      en: 'Cutting Tool Management',
      zh: '刀具管理',
      ar: 'إدارة أدوات القطع',
    },
    type: 'managed-items',
    icon: 'Scissors',
    description: {
      en: 'Specialized management for CNC cutting tools with life cycle tracking',
      zh: '配备生命周期追踪的CNC切削刀具专业管理',
      ar: 'إدارة متخصصة لأدوات القطع CNC مع تتبع دورة الحياة',
    },
  },
  {
    id: 'item-5',
    slug: 'spare-parts-management',
    name: {
      en: 'Spare Parts Management',
      zh: '备品备件管理',
      ar: 'إدارة قطع الغيار',
    },
    type: 'managed-items',
    icon: 'Settings',
    description: {
      en: 'Inventory management for spare parts with automated reordering alerts',
      zh: '配备自动补货警报的备件库存管理',
      ar: 'إدارة المخزون لقطع الغيار مع تنبيهات إعادة الطلب التلقائية',
    },
  },
  {
    id: 'item-6',
    slug: 'consumables-management',
    name: {
      en: 'Consumables Management',
      zh: '耗材管理',
      ar: 'إدارة المستهلكات',
    },
    type: 'managed-items',
    icon: 'Box',
    description: {
      en: 'Tracking and management of consumable materials with usage analytics',
      zh: '配备使用分析的消耗材料追踪和管理',
      ar: 'تتبع وإدارة المواد الاستهلاكية مع تحليلات الاستخدام',
    },
  },
  {
    id: 'item-7',
    slug: 'office-supplies-management',
    name: {
      en: 'Office Supplies Management',
      zh: '办公用品管理',
      ar: 'إدارة مستلزمات المكتب',
    },
    type: 'managed-items',
    icon: 'PenTool',
    description: {
      en: 'Automated office supplies dispensing and inventory management',
      zh: '自动化办公用品发放和库存管理',
      ar: 'التوزيع الآلي لمستلزمات المكتب وإدارة المخزون',
    },
  },
  {
    id: 'item-8',
    slug: 'document-management',
    name: {
      en: 'Document Management',
      zh: '文件资料管理',
      ar: 'إدارة المستندات',
    },
    type: 'managed-items',
    icon: 'FileText',
    description: {
      en: 'Digital and physical document management with access control and tracking',
      zh: '配备访问控制和追踪的数字和物理文档管理',
      ar: 'إدارة المستندات الرقمية والفعلية مع التحكم في الوصول والتتبع',
    },
  },
  {
    id: 'item-9',
    slug: 'abrasives-grinding-wheel-management',
    name: {
      en: 'Abrasives & Grinding Wheel Management',
      zh: '砂轮片/磨料管理',
      ar: 'إدارة المواد الكاشطة وعجلات الطحن',
    },
    type: 'managed-items',
    icon: 'Disc',
    description: {
      en: 'Specialized storage and management for grinding wheels and abrasive materials',
      zh: '砂轮和磨料的专业存储和管理',
      ar: 'تخزين وإدارة متخصصة لعجلات الطحن والمواد الكاشطة',
    },
  },
  {
    id: 'item-10',
    slug: 'special-liquid-material-management',
    name: {
      en: 'Special Liquid Material Management',
      zh: '特殊液体物料管理',
      ar: 'إدارة المواد السائلة الخاصة',
    },
    type: 'managed-items',
    icon: 'FlaskConical',
    description: {
      en: 'Management solutions for liquid materials with safety and compliance features',
      zh: '配备安全和合规功能的液体材料管理解决方案',
      ar: 'حلول الإدارة للمواد السائلة مع ميزات السلامة والامتثال',
    },
  },
];

// ③ 行业分类 (8 categories)
const industryTypes: Category[] = [
  {
    id: 'industry-1',
    slug: 'cnc-machining',
    name: {
      en: 'CNC Machining',
      zh: 'CNC机加工行业',
      ar: 'صناعة التشغيل CNC',
    },
    type: 'industry',
    icon: 'Cog',
    description: {
      en: 'Smart cabinet solutions for CNC machining workshops and factories',
      zh: 'CNC机加工车间和工厂的智能柜解决方案',
      ar: 'حلول الخزائن الذكية لورش ومصانع التشغيل CNC',
    },
  },
  {
    id: 'industry-2',
    slug: 'automotive-parts-manufacturing',
    name: {
      en: 'Automotive Parts Manufacturing',
      zh: '汽配制造行业',
      ar: 'صناعة قطع غيار السيارات',
    },
    type: 'industry',
    icon: 'Car',
    description: {
      en: 'Tool and material management solutions for automotive parts manufacturers',
      zh: '汽车零配件制造商的工具和物料管理解决方案',
      ar: 'حلول إدارة الأدوات والمواد لمصنعي قطع غيار السيارات',
    },
  },
  {
    id: 'industry-3',
    slug: '3c-electronics-manufacturing',
    name: {
      en: '3C Electronics Manufacturing',
      zh: '3C电子行业',
      ar: 'صناعة الإلكترونيات 3C',
    },
    type: 'industry',
    icon: 'Cpu',
    description: {
      en: 'Precision material management for 3C electronics production',
      zh: '3C电子生产的精密物料管理',
      ar: 'إدارة المواد الدقيقة لإنتاج الإلكترونيات 3C',
    },
  },
  {
    id: 'industry-4',
    slug: 'wire-cable-industry',
    name: {
      en: 'Wire & Cable Industry',
      zh: '电线电缆行业',
      ar: 'صناعة الأسلاك والكابلات',
    },
    type: 'industry',
    icon: 'Cable',
    description: {
      en: 'Smart storage solutions for wire and cable manufacturing enterprises',
      zh: '电线电缆制造企业的智能存储解决方案',
      ar: 'حلول التخزين الذكية لمؤسسات تصنيع الأسلاك والكابلات',
    },
  },
  {
    id: 'industry-5',
    slug: 'construction-industry',
    name: {
      en: 'Construction Industry',
      zh: '建筑行业',
      ar: 'صناعة البناء',
    },
    type: 'industry',
    icon: 'Building',
    description: {
      en: 'Tool and equipment management solutions for construction sites',
      zh: '建筑工地的工具和设备管理解决方案',
      ar: 'حلول إدارة الأدوات والمعدات لمواقع البناء',
    },
  },
  {
    id: 'industry-6',
    slug: 'auto-repair-maintenance',
    name: {
      en: 'Auto Repair & Maintenance',
      zh: '汽车维修行业',
      ar: 'إصلاح وصيانة السيارات',
    },
    type: 'industry',
    icon: 'Wrench',
    description: {
      en: 'Smart management for automotive repair tools and spare parts',
      zh: '汽车维修工具和备件的智能管理',
      ar: 'الإدارة الذكية لأدوات إصلاح السيارات وقطع الغيار',
    },
  },
  {
    id: 'industry-7',
    slug: 'general-manufacturing',
    name: {
      en: 'General Manufacturing',
      zh: '通用制造业',
      ar: 'التصنيع العام',
    },
    type: 'industry',
    icon: 'Factory',
    description: {
      en: 'Universal smart storage solutions for various manufacturing industries',
      zh: '适用于各种制造行业的通用智能存储解决方案',
      ar: 'حلول التخزين الذكية الشاملة لمختلف الصناعات التحويلية',
    },
  },
  {
    id: 'industry-8',
    slug: 'office-facility-management',
    name: {
      en: 'Office & Facility Management',
      zh: '办公及设施管理',
      ar: 'إدارة المكاتب والمرافق',
    },
    type: 'industry',
    icon: 'Building2',
    description: {
      en: 'Smart management solutions for office supplies and facility materials',
      zh: '办公用品和设施材料的智能管理解决方案',
      ar: 'حلول الإدارة الذكية لمستلزمات المكاتب ومواد المرافق',
    },
  },
];

// ④ 定制方案分类 (5 categories)
const customSolutions: Category[] = [
  {
    id: 'custom-1',
    slug: 'custom-liquid-material-cabinets',
    name: {
      en: 'Custom Liquid Material Cabinets',
      zh: '特殊液体管理柜',
      ar: 'خزائن المواد السائلة المخصصة',
    },
    type: 'custom-solution',
    icon: 'FlaskConical',
    description: {
      en: 'Customized cabinet solutions for special liquid material storage and management',
      zh: '用于特殊液体物料存储和管理的定制柜解决方案',
      ar: 'حلول خزائن مخصصة لتخزين وإدارة المواد السائلة الخاصة',
    },
  },
  {
    id: 'custom-2',
    slug: 'dehumidifying-cabinets-grinding-wheels',
    name: {
      en: 'Dehumidifying Cabinets for Grinding Wheels',
      zh: '砂轮片祛湿管理柜',
      ar: 'خزائن إزالة الرطوبة لعجلات الطحن',
    },
    type: 'custom-solution',
    icon: 'Droplets',
    description: {
      en: 'Climate-controlled cabinets for grinding wheel and abrasive material storage',
      zh: '用于砂轮和磨料存储的气候控制柜',
      ar: 'خزائن متحكم في مناخها لتخزين عجلات الطحن والمواد الكاشطة',
    },
  },
  {
    id: 'custom-3',
    slug: 'customized-rfid-cabinet-solutions',
    name: {
      en: 'Customized RFID Cabinet Solutions',
      zh: '定制RFID管理柜',
      ar: 'حلول خزائن RFID مخصصة',
    },
    type: 'custom-solution',
    icon: 'Radio',
    description: {
      en: 'Tailor-made RFID cabinet systems for specific industry needs',
      zh: '针对特定行业需求量身定制的RFID柜系统',
      ar: 'أنظمة خزائن RFID مصممة حسب الطلب لاحتياجات صناعية محددة',
    },
  },
  {
    id: 'custom-4',
    slug: 'oem-private-label-cabinets',
    name: {
      en: 'OEM & Private Label Cabinets',
      zh: 'OEM/品牌定制柜',
      ar: 'خزائن OEM والعلامة الخاصة',
    },
    type: 'custom-solution',
    icon: 'Tag',
    description: {
      en: 'Original equipment manufacturing and private label services for smart cabinets',
      zh: '智能柜的原始设备制造和自有品牌服务',
      ar: 'خدمات التصنيع الأصلي للمعدات والعلامة الخاصة للخزائن الذكية',
    },
  },
  {
    id: 'custom-5',
    slug: 'software-integration-solutions',
    name: {
      en: 'Software Integration Solutions',
      zh: '软件系统对接方案',
      ar: 'حلول تكامل البرمجيات',
    },
    type: 'custom-solution',
    icon: 'Code',
    description: {
      en: 'Custom software integration services to connect smart cabinets with existing systems',
      zh: '定制软件集成服务，将智能柜与现有系统连接',
      ar: 'خدمات تكامل البرمجيات المخصصة لربط الخزائن الذكية بالأنظمة الموجودة',
    },
  },
];

// Combine all categories (only primary categories, no secondary categories)
const categories: Category[] = [
  ...cabinetTypes,
  ...itemTypes,
  ...industryTypes,
  ...customSolutions,
];

export default categories;

// Helper functions
export function getCategoriesByType(type: Category['type']): Category[] {
  return categories.filter((c) => c.type === type);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getAllCategoryTypes(): Category['type'][] {
  return ['cabinet-type', 'managed-items', 'industry', 'custom-solution'];
}

// === Hierarchy functions for secondary categories ===

/** Get top-level (primary) categories only */
export function getPrimaryCategories(): Category[] {
  return categories.filter((c) => !c.parentId);
}

/** Get child categories of a specific parent */
export function getChildCategories(parentId: string): Category[] {
  return categories.filter((c) => c.parentId === parentId);
}

/** Build a tree structure: { category, children[] } */
export interface CategoryNode {
  category: Category;
  children: Category[];
}

export function getCategoryTree(): CategoryNode[] {
  const primaries = getPrimaryCategories();
  return primaries.map((cat) => ({
    category: cat,
    children: getChildCategories(cat.id),
  }));
}

/** Get flat list with indent info for dropdown rendering */
export interface CategoryFlat {
  id: string;
  slug: string;
  name: { en: string; zh: string; ar: string };
  type: Category['type'];
  level: number; // 0 = primary, 1 = secondary
  parentId?: string;
  path: string; // display path like "智能工具柜 > CNC刀具智能柜"
}

export function getFlattenedCategories(locale: string = 'zh'): CategoryFlat[] {
  const result: CategoryFlat[] = [];
  const primaries = getPrimaryCategories();

  for (const cat of primaries) {
    result.push({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      type: cat.type,
      level: 0,
      path: locale === 'zh' ? cat.name.zh : locale === 'ar' ? cat.name.ar : cat.name.en,
    });

    const children = getChildCategories(cat.id);
    for (const child of children) {
      const parentName = locale === 'zh' ? cat.name.zh : locale === 'ar' ? cat.name.ar : cat.name.en;
      const childName = locale === 'zh' ? child.name.zh : locale === 'ar' ? child.name.ar : child.name.en;
      result.push({
        id: child.id,
        slug: child.slug,
        name: child.name,
        type: child.type,
        level: 1,
        parentId: cat.id,
        path: `${parentName} > ${childName}`,
      });
    }
  }

  return result;
}
