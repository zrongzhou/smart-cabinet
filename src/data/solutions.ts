export interface Solution {
  id: string;
  title: {
    en: string;
    zh: string;
    ar: string;
  };
  slug: string;
  description: {
    en: string;
    zh: string;
    ar: string;
  };
  icon: string;
  colorTheme: 'blue' | 'green' | 'purple' | 'orange';
  painPoints: {
    en: string[];
    zh: string[];
    ar: string[];
  };
  solution: {
    en: string;
    zh: string;
    ar: string;
  };
  detailedSolution: {
    en: string[];
    zh: string[];
    ar: string[];
  };
  benefits: string[];
  benefitsDetailed: {
    en: { metric: string; description: string }[];
    zh: { metric: string; description: string }[];
    ar: { metric: string; description: string }[];
  };
  caseData: {
    metric: string;
    description: {
      en: string;
      zh: string;
      ar: string;
    };
    details: {
      en: string;
      zh: string;
      ar: string;
    };
  };
}

const solutions: Solution[] = [
  {
    id: '1',
    title: {
      en: 'CNC Machining',
      zh: 'CNC机加工',
      ar: 'تشغيل CNC',
    },
    slug: 'cnc-machining',
    description: {
      en: 'Intelligent tool management solutions for CNC machining workshops, enabling precise tracking of cutting tools and reducing machine downtime.',
      zh: '为CNC机加工车间提供智能刀具管理解决方案，实现切削刀具的精确追踪，减少机床停机时间。',
      ar: 'حلول إدارة الأدوات الذكية لورش تشغيل CNC، مما يمكّن من التتبع الدقيق لأدوات القطع وتقليل وقت توقف الماكينة.',
    },
    icon: 'Cog',
    colorTheme: 'blue',
    painPoints: {
      en: [
        'Tool search time averaging 15-20 minutes per setup change',
        'Lost or misplaced tools causing production delays',
        'Difficulty tracking tool life and usage history',
      ],
      zh: [
        '每次设置更换的刀具搜索时间平均15-20分钟',
        '丢失或放错位置的刀具导致生产延误',
        '难以追踪刀具寿命和使用历史',
      ],
      ar: [
        'متوسط وقت البحث عن الأدوات 15-20 دقيقة لكل تغيير إعداد',
        'الأدوات المفقودة أو الموضوعة في غير مكانها تسبب تأخيرات الإنتاج',
        'صعوبة تتبع عمر الأداة وتاريخ الاستخدام',
      ],
    },
    solution: {
      en: 'Our smart cutting tool cabinets with RFID tracking provide automated tool identification, real-time inventory visibility, and complete lifecycle management.',
      zh: '我们配备RFID追踪的智能刀具柜提供自动化刀具识别、实时库存可见性和完整的生命周期管理。',
      ar: 'توفر خزائن أدوات القطع الذكية الخاصة بنا مع تتبع RFID التعرف التلقائي على الأدوات، والرؤية للمخزون في الوقت الفعلي، وإدارة دورة الحياة الكاملة.',
    },
    detailedSolution: {
      en: [
        'The system records every tool transaction, tracks tool usage count, and sends alerts for tool maintenance or replacement. Real-time monitoring ensures optimal tool availability.',
        'Advanced RFID technology enables instant tool detection and tracking. Each tool is equipped with a unique RFID tag for precise identification and location tracking.',
        'The intelligent cabinet system integrates seamlessly with your existing MES and ERP systems, providing automated data synchronization and comprehensive reporting capabilities.',
      ],
      zh: [
        '系统记录每笔刀具交易，追踪刀具使用次数，并发送刀具维护或更换警报。实时监控确保最佳的刀具可用性。',
        '先进的RFID技术实现即时刀具检测和追踪。每个刀具都配备独特的RFID标签，用于精确识别和位置追踪。',
        '智能柜系统与您现有的MES和ERP系统无缝集成，提供自动化数据同步和全面的报告功能。',
      ],
      ar: [
        'يسجل النظام كل معاملة أدوات، ويتتبع عدد استخدام الأداة، ويرسل تنبيهات لصيانة الأداة أو استبدالها. المراقبة في الوقت الفعلي تضمن توفر الأدوات المثالي.',
        'تكنولوجيا RFID المتقدمة تمكّن من اكتشاف الأدوات وتتبعها لحظياً. كل أداة مجهزة بعلامة RFID فريدة للتعرف الدقيق وتتبع الموقع.',
        'يتكامل نظام الخزائن الذكية بسلاسة مع أنظمة MES وERP الموجودة لديك، مما يوفر مزامنة البيانات المؤتمة وقدرات إعداد التقارير الشاملة.',
      ],
    },
    benefits: [
      'Efficiency improvement 40% / 效率提升40% / تحسين الكفاءة 40%',
      'Inventory accuracy 99.5% / 库存准确率99.5% / دقة المخزون 99.5%',
      'Reduced machine downtime 75% / 减少机床停机时间75% / تقليل وقت توقف الماكينة 75%',
      'Tool life extended 30% / 刀具寿命延长30% / إطالة عمر الأداة 30%',
      'ROI achieved in 8 months / 8个月实现投资回报 / تحقيق العائد على الاستثمار في 8 أشهر',
    ],
    benefitsDetailed: {
      en: [
        { metric: '40%', description: 'Efficiency improvement in tool management' },
        { metric: '99.5%', description: 'Inventory accuracy rate' },
        { metric: '75%', description: 'Reduction in machine downtime' },
        { metric: '30%', description: 'Tool life extension' },
      ],
      zh: [
        { metric: '40%', description: '刀具管理效率提升' },
        { metric: '99.5%', description: '库存准确率' },
        { metric: '75%', description: '机床停机时间减少' },
        { metric: '30%', description: '刀具寿命延长' },
      ],
      ar: [
        { metric: '40%', description: 'تحسين كفاءة إدارة الأدوات' },
        { metric: '99.5%', description: 'معدل دقة المخزون' },
        { metric: '75%', description: 'انخفاض وقت توقف الماكينة' },
        { metric: '30%', description: 'إطالة عمر الأداة' },
      ],
    },
    caseData: {
      metric: '75%',
      description: {
        en: 'Reduction in tool search time, from 20 minutes to 5 minutes per setup',
        zh: '刀具搜索时间减少，从每次设置20分钟减少到5分钟',
        ar: 'انخفاض في وقت البحث عن الأدوات، من 20 دقيقة إلى 5 دقائق لكل إعداد',
      },
      details: {
        en: 'A leading automotive parts manufacturer implemented our smart cabinet system across 5 production lines. Within 3 months, they reported 75% reduction in tool search time and 99.5% inventory accuracy. The system paid for itself in 8 months through labor savings and reduced tool replacement costs.',
        zh: '一家领先的汽车零配件制造商在5条生产线上实施了我们的智能柜系统。3个月内，他们报告刀具搜索时间减少75%，库存准确率达到99.5%。该系统通过节省人工和减少刀具更换成本，在8个月内收回了投资。',
        ar: 'نفذت شركة رائدة في تصنيع قطع غيار السيارات نظام الخزائن الذكية الخاص بنا عبر 5 خطوط إنتاج. في غضون 3 أشهر، أبلغوا عن انخفاض بنسبة 75% في وقت البحث عن الأدوات ودقة المخزون 99.5%. استرد النظام تكلفته في غضون 8 أشهر من خلال توفير العمالة وتقليل تكاليف استبدال الأدوات.',
      },
    },
  },
  {
    id: '2',
    title: {
      en: 'Automotive Parts Manufacturing',
      zh: '汽配制造',
      ar: 'تصنيع قطع غيار السيارات',
    },
    slug: 'automotive-parts-manufacturing',
    description: {
      en: 'Smart storage solutions for automotive parts manufacturers, managing tools, consumables, and quality control materials with full traceability.',
      zh: '为汽车零配件制造商提供智能存储解决方案，管理刀具、耗材和质量控制材料，具有完整可追溯性。',
      ar: 'حلول التخزين الذكية لمصنعي قطع غيار السيارات، وإدارة الأدوات والمستهلكات ومواد التحكم في الجودة مع القدرة الكاملة على التتبع.',
    },
    icon: 'Car',
    colorTheme: 'green',
    painPoints: {
      en: [
        'Stringent quality requirements needing full material traceability',
        'High-mix, low-volume production causing inventory complexity',
        'Manual processes leading to errors in component tracking',
      ],
      zh: [
        '严格的质量要求需要完整的物料可追溯性',
        '多品种、小批量生产导致库存复杂性',
        '手动流程导致组件追踪错误',
      ],
      ar: [
        'متطلبات الجودة الصارمة التي تحتاج إلى قابلية تتبع المواد الكاملة',
        'الإنتاج متعدد الأنواع ومنخفض الحجم يسبب تعقيد المخزون',
        'العمليات اليدوية تؤدي إلى أخطاء في تتبع المكونات',
      ],
    },
    solution: {
      en: 'Our integrated smart cabinet system provides end-to-end traceability for all materials and tools. The system integrates with quality management software.',
      zh: '我们的集成智能柜系统为所有材料和工具提供端到端的可追溯性。系统与质量管理软件集成。',
      ar: 'يوفر نظام الخزائن الذكية المتكامل لدينا قابلية التتبع من النهاية إلى النهاية لجميع المواد والأدوات. يتكامل النظام مع برمجيات إدارة الجودة.',
    },
    detailedSolution: {
      en: [
        'The system automatically records material batches and ensures compliance with automotive industry standards like IATF 16949. Complete audit trails are maintained for all material movements.',
        'Our smart storage solution handles high-mix, low-volume production efficiently with automated inventory optimization and demand forecasting.',
        'Quality control is enhanced through integrated inspection workflows and automatic documentation of all material usage, ensuring full compliance with industry regulations.',
      ],
      zh: [
        '系统自动记录材料批次，并确保符合IATF 16949等汽车行业标准的合规性。所有材料移动都保持完整的审计跟踪。',
        '我们的智能存储解决方案通过自动化库存优化和需求预测，高效处理多品种、小批量生产。',
        '通过集成检验工作流程和所有材料使用的自动文档化，增强质量控制，确保完全符合行业法规。',
      ],
      ar: [
        'يسجل النظام تلقائياً فئات المواد، ويضمن الامتثال لمعايير صناعة السيارات مثل IATF 16949. تتم صيانة مسارات التدقيق الكاملة لجميع تحركات المواد.',
        'تتعامل حلول التخزين الذكية الخاصة بنا مع الإنتاج متعدد الأنواع ومنخفض الحجم بكفاءة من خلال تحسين المخزون المؤتم وتنبؤ الطلب.',
        'يتم تعزيز التحكم في الجودة من خلال سير عمل التفتيش المتكامل والتوثيق التلقائي لجميع استخدامات المواد، مما يضمن الامتثال الكامل للوائح الصناعة.',
      ],
    },
    benefits: [
      'Traceability 100% / 可追溯性100% / قابلية التتبع 100%',
      'Quality compliance 99.8% / 质量合规率99.8% / امتثال الجودة 99.8%',
      'Inventory cost reduction 30% / 库存成本降低30% / انخفاض تكلفة المخزون 30%',
      'Audit time reduced 60% / 审计时间减少60% / انخفاض وقت التدقيق 60%',
    ],
    benefitsDetailed: {
      en: [
        { metric: '100%', description: 'Material traceability achieved' },
        { metric: '99.8%', description: 'Quality compliance rate' },
        { metric: '30%', description: 'Inventory cost reduction' },
        { metric: '60%', description: 'Audit preparation time reduced' },
      ],
      zh: [
        { metric: '100%', description: '实现物料可追溯性' },
        { metric: '99.8%', description: '质量合规率' },
        { metric: '30%', description: '库存成本降低' },
        { metric: '60%', description: '审计准备时间减少' },
      ],
      ar: [
        { metric: '100%', description: 'تحقيق قابلية تتبع المواد' },
        { metric: '99.8%', description: 'معدل امتثال الجودة' },
        { metric: '30%', description: 'انخفاض تكلفة المخزون' },
        { metric: '60%', description: 'انخفاض وقت إعداد التدقيق' },
      ],
    },
    caseData: {
      metric: '100%',
      description: {
        en: 'Full material traceability achieved, zero quality compliance issues in 12 months',
        zh: '实现完整物料可追溯性，12个月内零质量合规问题',
        ar: 'تحقيق قابلية التتبع الكاملة للمواد، صفر من قضايا امتثال الجودة في 12 شهراً',
      },
      details: {
        en: 'A tier-1 automotive supplier implemented our system across 3 facilities. They achieved 100% material traceability and zero quality compliance issues for 12 consecutive months, enabling them to win new contracts with major automotive OEMs.',
        zh: '一家一级汽车供应商在3个工厂实施了我们的系统。他们实现了100%物料可追溯性，连续12个月零质量合规问题，使他们赢得了与主要汽车OEM的新合同。',
        ar: 'نفذت شركة موردة للسيارات من الفئة الأولى نظامنا عبر 3 مرافق. حققوا قابلية تتبع المواد 100% وصفراً من قضايا امتثال الجودة لمدة 12 شهراً متتالياً، مما مكنهم من الفوز بعقود جديدة مع شركات تصنيع السيارات الكبرى.',
      },
    },
  },
  {
    id: '3',
    title: {
      en: '3C Electronics Manufacturing',
      zh: '3C电子',
      ar: 'تصنيع الإلكترونيات 3C',
    },
    slug: '3c-electronics-manufacturing',
    description: {
      en: 'Precision material management for 3C electronics production, handling small components, PCBs, and precision tools with intelligent storage systems.',
      zh: '为3C电子生产提供精密物料管理，通过智能存储系统处理小型组件、PCB和精密工具。',
      ar: 'إدارة المواد الدقيقة لإنتاج الإلكترونيات 3C، والتعامل مع المكونات الصغيرة والـ PCB والأدوات الدقيقة من خلال أنظمة التخزين الذكية.',
    },
    icon: 'Cpu',
    colorTheme: 'purple',
    painPoints: {
      en: [
        'Miniature components requiring precise inventory tracking',
        'Anti-static and humidity control requirements for sensitive electronics',
        'Fast production rhythm with frequent material requests',
      ],
      zh: [
        '微型组件需要精确的库存追踪',
        '敏感电子产品需要防静电和湿度控制要求',
        '快速生产节奏，频繁的材料请求',
      ],
      ar: [
        'المكونات المتناهية الصغر تتطلب تتبع مخزون دقيق',
        'المتطلبات المضادة للكهرباء الساكنة والتحكم في الرطوبة للمكونات الإلكترونية الحساسة',
        'إيقاع إنتاج سريع مع طلبات مواد متكررة',
      ],
    },
    solution: {
      en: 'Our smart cabinets for electronics manufacturing feature climate control, anti-static design, and high-density storage configurations.',
      zh: '我们用于电子制造的智能柜具有气候控制、防静电设计和高密度存储配置。',
      ar: 'تتميز الخزائن الذكية الخاصة بنا لتصنيع الإلكترونيات بالتحكم في المناخ، والتصميم المضاد للكهرباء الساكنة، وتكوينات التخزين عالية الكثافة.',
    },
    detailedSolution: {
      en: [
        'The system supports rapid retrieval with pick-to-light guidance and integrates with MES for real-time production material requirements. Climate and ESD control ensure component integrity.',
        'High-density storage configurations maximize space utilization while maintaining easy access. The system automatically tracks component lots and expiration dates.',
        'Real-time inventory visibility enables proactive material replenishment. The system generates automatic alerts for low stock and expiring components.',
      ],
      zh: [
        '系统支持带有拣选指示灯引导的快速检索，并与MES集成以实现实时生产材料需求。气候和ESD控制确保组件完整性。',
        '高密度存储配置在保持易访问性的同时最大化空间利用率。系统自动追踪组件批次和过期日期。',
        '实时库存可见性实现主动材料补充。系统为低库存和即将过期的组件生成自动警报。',
      ],
      ar: [
        'يدعم النظام الاسترداد السريع مع توجيه الإضاءة للانتقاء ويتكامل مع MES لمتطلبات مواد الإنتاج في الوقت الفعلي. التحكم في المناخ وESD يضمن سلامة المكونات.',
        'تكوينات التخزين عالية الكثافة تعظم استخدام المساحة مع الحفاظ على سهولة الوصول. يتتبع النظام تلقائياً فئات المكونات وتواريخ انتهاء الصلاحية.',
        'الرؤية للمخزون في الوقت الفعلي تمكّن من تجديد المواد الاستباقي. يولد النظام تنبيهات تلقائية للمخزون المنخفض والمكونات التي ستنتهي صلاحيتها.',
      ],
    },
    benefits: [
      'Pick efficiency improved 60% / 拣选效率提升60% / تحسين كفاءة الانتقاء 60%',
      'Component loss reduced 90% / 组件损失减少90% / انخفاض فقدان المكونات 90%',
      'Production line efficiency 95% / 生产线效率95% / كفاءة خط الإنتاج 95%',
      'Space utilization increased 50% / 空间利用率提高50% / زيادة استخدام المساحة 50%',
    ],
    benefitsDetailed: {
      en: [
        { metric: '60%', description: 'Pick efficiency improvement' },
        { metric: '90%', description: 'Component loss reduction' },
        { metric: '95%', description: 'Production line efficiency' },
        { metric: '50%', description: 'Space utilization increase' },
      ],
      zh: [
        { metric: '60%', description: '拣选效率提升' },
        { metric: '90%', description: '组件损失减少' },
        { metric: '95%', description: '生产线效率' },
        { metric: '50%', description: '空间利用率提高' },
      ],
      ar: [
        { metric: '60%', description: 'تحسين كفاءة الانتقاء' },
        { metric: '90%', description: 'انخفاض فقدان المكونات' },
        { metric: '95%', description: 'كفاءة خط الإنتاج' },
        { metric: '50%', description: 'زيادة استخدام المساحة' },
      ],
    },
    caseData: {
      metric: '60%',
      description: {
        en: 'Improvement in material retrieval speed, supporting faster production cycles',
        zh: '材料检索速度提升，支持更快的生产周期',
        ar: 'تحسين في سرعة استرداد المواد، مما يدعم دورات الإنتاج الأسرع',
      },
      details: {
        en: 'A major 3C electronics manufacturer deployed our smart cabinets in 8 SMT lines. Material retrieval speed improved by 60%, component loss reduced by 90%, and production line efficiency reached 95%. The ROI was achieved in just 6 months.',
        zh: '一家主要的3C电子制造商在8条SMT生产线上部署了我们的智能柜。材料检索速度提升60%，组件损失减少90%，生产线效率达到95%。仅在6个月内就实现了投资回报。',
        ar: 'نشرت شركة كبرى لتصنيع الإلكترونيات 3C خزائننا الذكية في 8 خطوط SMT. تحسنت سرعة استرداد المواد بنسبة 60%، وانخفض فقدان المكونات بنسبة 90%، ووصلت كفاءة خط الإنتاج إلى 95%. تحقق العائد على الاستثمار في غضون 6 أشهر فقط.',
      },
    },
  },
  {
    id: '4',
    title: {
      en: 'Wire & Cable Industry',
      zh: '电线电缆',
      ar: 'صناعة الأسلاك والكابلات',
    },
    slug: 'wire-cable-industry',
    description: {
      en: 'Smart inventory management for wire and cable manufacturers, handling raw materials, production tools and finished product traceability.',
      zh: '为电线电缆制造商提供智能库存管理，处理原材料、生产工具和成品可追溯性。',
      ar: 'إدارة المخزون الذكية لمصنعي الأسلاك والكابلات، والتعامل مع المواد الخام وأدوات الإنتاج وقابلية تتبع المنتج النهائي.',
    },
    icon: 'Cable',
    colorTheme: 'orange',
    painPoints: {
      en: [
        'Large spools and reels difficult to track and store',
        'Material waste from over-ordering or expiration',
        'Complex batch tracking for quality assurance',
      ],
      zh: [
        '大型线轴和卷盘难以追踪和存储',
        '过度订购或过期导致材料浪费',
        '质量保证的复杂批次追踪',
      ],
      ar: [
        'البكرات والأسطوانات الكبيرة يصعب تتبعها وتخزينها',
        'هدر المواد من الطلب الزائد أو انتهاء الصلاحية',
        'تتبع الدفعات المعقد لضمان الجودة',
      ],
    },
    solution: {
      en: 'Our smart storage solutions for wire and cable industry feature heavy-duty racks with weight sensors, automated batch tracking.',
      zh: '我们用于电线电缆行业的智能存储解决方案具有带重量传感器的重型货架、自动化批次追踪。',
      ar: 'تتميز حلول التخزين الذكية الخاصة بنا لصناعة الأسلاك والكابلات بالرفوف الثقيلة مع مستشعرات الوزن، وتتبع الدفعات الآلي.',
    },
    detailedSolution: {
      en: [
        'The system optimizes material usage and reduces waste through accurate inventory management. Weight sensors provide real-time stock level monitoring for large spools and reels.',
        'Automated batch tracking ensures quality assurance compliance. The system maintains complete traceability from raw material receipt to finished product delivery.',
        'Integration with production planning systems enables proactive material replenishment. The system generates automatic alerts for low stock and upcoming production requirements.',
      ],
      zh: [
        '系统通过精确的库存管理优化材料使用并减少浪费。重量传感器为大型线轴和卷盘提供实时库存水平监控。',
        '自动化批次追踪确保质量保证合规性。系统保持从原材料接收到成品交付的完整可追溯性。',
        '与生产计划系统集成实现主动材料补充。系统为低库存和即将到来的生产需求生成自动警报。',
      ],
      ar: [
        'يحسن النظام استخدام المواد ويقلل الهدر من خلال إدارة المخزون الدقيقة. مستشعرات الوزن توفر مراقبة مستويات المخزون في الوقت الفعلي للبكرات والأسطوانات الكبيرة.',
        'تتبع الدفعات المؤتم يضمن امتثال ضمان الجودة. يحافظ النظام على قابلية التتبع الكاملة من استلام المواد الخام إلى تسليم المنتج النهائي.',
        'التكامل مع أنظمة تخطيط الإنتاج يمكن من تجديد المواد الاستباقي. يولد النظام تنبيهات تلقائية للمخزون المنخفض ومتطلبات الإنتاج القادمة.',
      ],
    },
    benefits: [
      'Material waste reduced 35% / 材料浪费减少35% / انخفاض هدر المواد 35%',
      'Storage space optimized 50% / 存储空间优化50% / تحسين مساحة التخزين 50%',
      'Batch traceability 100% / 批次可追溯性100% / قابلية تتبع الدفعة 100%',
      'Inventory accuracy 99%+ / 库存准确率99%+ / دقة المخزون 99%+',
    ],
    benefitsDetailed: {
      en: [
        { metric: '35%', description: 'Material waste reduction' },
        { metric: '50%', description: 'Storage space optimization' },
        { metric: '100%', description: 'Batch traceability achieved' },
        { metric: '99%', description: 'Inventory accuracy rate' },
      ],
      zh: [
        { metric: '35%', description: '材料浪费减少' },
        { metric: '50%', description: '存储空间优化' },
        { metric: '100%', description: '批次可追溯性实现' },
        { metric: '99%', description: '库存准确率' },
      ],
      ar: [
        { metric: '35%', description: 'انخفاض هدر المواد' },
        { metric: '50%', description: 'تحسين مساحة التخزين' },
        { metric: '100%', description: 'تحقيق قابلية تتبع الدفعة' },
        { metric: '99%', description: 'معدل دقة المخزون' },
      ],
    },
    caseData: {
      metric: '35%',
      description: {
        en: 'Reduction in material waste through optimized inventory and usage tracking',
        zh: '通过优化库存和使用追踪，材料浪费减少',
        ar: 'انخفاض في هدر المواد من خلال تحسين المخزون وتتبع الاستخدام',
      },
      details: {
        en: 'A leading wire and cable manufacturer implemented our smart storage system across 2 production facilities. Material waste reduced by 35%, storage space optimized by 50%, and batch traceability reached 100%. Customer satisfaction improved significantly due to fewer delivery delays.',
        zh: '一家领先的电线电缆制造商在2个生产工厂实施了我们的智能存储系统。材料浪费减少35%，存储空间优化50%，批次可追溯性达到100%。由于交付延迟减少，客户满意度显著提高。',
        ar: 'نفذت شركة رائدة في صناعة الأسلاك والكابلات نظام التخزين الذكي الخاص بنا عبر مرفقين إنتاجيين. انخفض هدر المواد بنسبة 35%، وتحسنت مساحة التخزين بنسبة 50%، ووصلت قابلية تتبع الدفعة إلى 100%. تحسنت رضا العملاء بشكل ملحوظ بسبب قلة تأخيرات التسليم.',
      },
    },
  },
  {
    id: '5',
    title: {
      en: 'Construction Industry',
      zh: '建筑行业',
      ar: 'صناعة البناء',
    },
    slug: 'construction-industry',
    description: {
      en: 'Smart tool and equipment management for construction sites, ensuring tools are available when needed and reducing tool loss across multiple job sites.',
      zh: '为建筑工地提供智能工具和设备管理，确保需要时工具可用，并减少多个工地的工具损失。',
      ar: 'إدارة الأدوات والمعدات الذكية لمواقع البناء، وضمان توفر الأدوات عند الحاجة إليها وتقليل فقد الأدوات عبر مواقع العمل المتعددة.',
    },
    icon: 'Building',
    colorTheme: 'blue',
    painPoints: {
      en: [
        'Tools frequently lost or stolen across job sites',
        'Difficulty tracking tool location and availability',
        'High replacement costs for lost or damaged tools',
      ],
      zh: [
        '工具在工地之间经常丢失或被盗',
        '难以追踪工具位置和可用性',
        '丢失或损坏工具的高更换成本',
      ],
      ar: [
        'الأدوات تُفقد أو تُسرق بشكل متكرر عبر مواقع العمل',
        'صعوبة تتبع موقع الأداة وتوفرها',
        'تكاليف استبدال مرتفعة للأدوات المفقودة أو التالفة',
      ],
    },
    solution: {
      en: 'Our rugged smart cabinets designed for construction environments provide secure tool storage with cloud-based tracking.',
      zh: '我们为建筑环境设计的坚固智能柜提供带有基于云追踪的安全工具存储。',
      ar: 'توفر الخزائن الذكية المتينة الخاصة بنا والمصممة لبيئات البناء تخزين أدوات آمن مع تتبع قائم على السحابة.',
    },
    detailedSolution: {
      en: [
        'The system enables tool check-out/check-in from any site, sends alerts for overdue tools, and generates usage reports for project cost allocation. Cloud-based tracking ensures real-time visibility across all job sites.',
        'Rugged construction withstands harsh job site conditions. The system features reinforced locks, weather-resistant design, and backup power for uninterrupted operation.',
        'Project cost allocation is automated through detailed usage reports. The system tracks which projects each tool is used for, enabling accurate job costing and client billing.',
      ],
      zh: [
        '系统支持从任何工地借出/归还工具，发送逾期工具警报，并生成用于项目成本分配的使用报告。基于云的追踪确保跨所有工地的实时可见性。',
        '坚固的结构可承受恶劣的工地条件。系统具有加强锁、耐候设计和备用电源，确保不间断运行。',
        '项目成本分配通过详细的使用报告实现自动化。系统追踪每个工具用于哪些项目，实现准确的作业成本计算和客户计费。',
      ],
      ar: [
        'يمكّن النظام من إصدار/استلام الأدوات من أي موقع، ويرسل تنبيهات للأدوات المتأخرة، ويولد تقارير الاستخدام لتخصيص تكلفة المشروع. التتبع القائم على السحابة يضمن الرؤية في الوقت الفعلي عبر جميع مواقع العمل.',
        'البناء المتين يتحمل ظروف مواقع العمل القاسية. يتميز النظام بأقفال معززة، وتصميم مقاوم للطقس، وقدرة طاقة احتياطية للتشغيل المتواصل.',
        'يتم أتمتة تخصيص تكلفة المشروع من خلال تقارير الاستخدام المفصلة. يتتبع النظام المشاريع التي تُستخدم كل أداة من أجلها، مما يمكّن من حساب تكلفة العمل الدقيقة وفوترة العملاء.',
      ],
    },
    benefits: [
      'Tool loss reduced 85% / 工具损失减少85% / انخفاض فقدان الأدوات 85%',
      'Tool availability 98% / 工具可用率98% / توفر الأدوات 98%',
      'Replacement cost savings 45% / 更换成本节省45% / توفير تكلفة الاستبدال 45%',
      'Project costing accuracy 95% / 项目成本计算准确度95% / دقة حساب تكلفة المشروع 95%',
    ],
    benefitsDetailed: {
      en: [
        { metric: '85%', description: 'Tool loss reduction' },
        { metric: '98%', description: 'Tool availability rate' },
        { metric: '45%', description: 'Replacement cost savings' },
        { metric: '95%', description: 'Project costing accuracy' },
      ],
      zh: [
        { metric: '85%', description: '工具损失减少' },
        { metric: '98%', description: '工具可用率' },
        { metric: '45%', description: '更换成本节省' },
        { metric: '95%', description: '项目成本计算准确度' },
      ],
      ar: [
        { metric: '85%', description: 'انخفاض فقدان الأدوات' },
        { metric: '98%', description: 'معدل توفر الأدوات' },
        { metric: '45%', description: 'توفير تكلفة الاستبدال' },
        { metric: '95%', description: 'دقة حساب تكلفة المشروع' },
      ],
    },
    caseData: {
      metric: '85%',
      description: {
        en: 'Reduction in tool loss across 5 construction sites over 8 months',
        zh: '在5个建筑工地8个月内，工具损失减少',
        ar: 'انخفاض في فقدان الأدوات عبر 5 مواقع بناء على مدار 8 أشهر',
      },
      details: {
        en: 'A large construction company deployed our smart cabinets across 5 active job sites. Tool loss reduced by 85%, tool availability increased to 98%, and replacement cost savings reached 45%. Project costing accuracy improved to 95%, enabling more competitive bidding.',
        zh: '一家大型建筑公司在5个活跃工地部署了我们的智能柜。工具损失减少85%，工具可用率提高到98%，更换成本节省达到45%。项目成本计算准确度提高到95%，使竞标更具竞争力。',
        ar: 'نشرت شركة إنشاءات كبرى خزائننا الذكية عبر 5 مواقع عمل نشطة. انخفض فقدان الأدوات بنسبة 85%، وارتفع توفر الأدوات إلى 98%، ووصل توفير تكلفة الاستبدال إلى 45%. تحسنت دقة حساب تكلفة المشروع إلى 95%، مما مكن من تقديم عروض أسعار أكثر تنافسية.',
      },
    },
  },
  {
    id: '6',
    title: {
      en: 'Auto Repair & Maintenance',
      zh: '汽车维修',
      ar: 'إصلاح والصيانة السيارات',
    },
    slug: 'auto-repair-maintenance',
    description: {
      en: 'Efficient tool and spare parts management for auto repair shops, reducing time spent searching for tools and ensuring quick service delivery.',
      zh: '为汽车维修店提供高效的工具和备件管理，减少搜索工具的时间并确保快速服务交付。',
      ar: 'إدارة الأدوات وقطع الغيار الكفاءة لورش إصلاح السيارات، وتقليل الوقت المستغرق في البحث عن الأدوات وضمان تسليم الخدمة السريعة.',
    },
    icon: 'Wrench',
    colorTheme: 'green',
    painPoints: {
      en: [
        'Mechanics wasting time searching for tools and parts',
        'Difficulty managing inventory across multiple bays',
        'Customer dissatisfaction due to delayed repairs from missing tools',
      ],
      zh: [
        '机械师浪费时间搜索工具和零件',
        '难以管理多个工位之间的库存',
        '由于缺少工具导致维修延误，客户不满意',
      ],
      ar: [
        'إضاعة وقت الميكانيكيين في البحث عن الأدوات والقطع',
        'صعوبة إدارة المخزون عبر مناطق عمل متعددة',
        'عدم رضا العملاء بسبب تأخيرات الإصلاح من الأدوات المفقودة',
      ],
    },
    solution: {
      en: 'Our smart cabinets for auto repair shops provide quick-access tool storage with RFID identification.',
      zh: '我们用于汽车维修店的智能柜提供带有RFID识别的快速访问工具存储。',
      ar: 'توفر الخزائن الذكية الخاصة بنا لورش إصلاح السيارات تخزين أدوات وصول سريع مع التعرف RFID.',
    },
    detailedSolution: {
      en: [
        'The system tracks tool location in real-time, manages spare parts inventory with automated reordering, and integrates with shop management software for seamless operations. Mechanics can instantly locate any tool.',
        'Automated spare parts inventory management reduces stockouts and overstock situations. The system generates purchase orders automatically based on usage patterns and lead times.',
        'Integration with shop management software streamlines operations. The system tracks repair times, tool usage, and parts consumption for each job, improving overall efficiency.',
      ],
      zh: [
        '系统实时追踪工具位置，通过自动重新订购管理备件库存，并与商店管理软件集成以实现无缝运营。机械师可以立即找到任何工具。',
        '自动化备件库存管理减少缺货和积压情况。系统根据使用模式和交货时间自动生成采购订单。',
        '与商店管理软件集成简化了操作。系统追踪每个工作的维修时间、工具使用和零件消耗，提高整体效率。',
      ],
      ar: [
        'يتتبع النظام موقع الأداة في الوقت الفعلي، ويدير مخزون قطع الغيار مع إعادة الطلب الآلية، ويتكامل مع برمجيات إدارة الورشة للعمليات السلسة. يمكن للميكانيكيين تحديد موقع أي أداة لحظياً.',
        'إدارة مخزون قطع الغيار المؤتمة تقلل من حالات نفاد المخزون والفرط في المخزون. يولد النظام أوامر الشراء تلقائياً بناءً على أنماط الاستخدام وأوقات التوريد.',
        'التكامل مع برمجيات إدارة الورشة يبسط العمليات. يتتبع النظام أوقات الإصلاح، واستخدام الأدوات، واستهلاك القطع لكل عمل، مما يحسن الكفاءة الإجمالية.',
      ],
    },
    benefits: [
      'Tool search time reduced 70% / 工具搜索时间减少70% / انخفاض وقت البحث عن الأدوات 70%',
      'Service efficiency improved 35% / 服务效率提升35% / تحسين كفاءة الخدمة 35%',
      'Customer satisfaction increased 40% / 客户满意度提高40% / زيادة رضا العملاء 40%',
      'Parts inventory accuracy 98% / 零件库存准确率98% / دقة مخزون القطع 98%',
    ],
    benefitsDetailed: {
      en: [
        { metric: '70%', description: 'Tool search time reduction' },
        { metric: '35%', description: 'Service efficiency improvement' },
        { metric: '40%', description: 'Customer satisfaction increase' },
        { metric: '98%', description: 'Parts inventory accuracy' },
      ],
      zh: [
        { metric: '70%', description: '工具搜索时间减少' },
        { metric: '35%', description: '服务效率提升' },
        { metric: '40%', description: '客户满意度提高' },
        { metric: '98%', description: '零件库存准确率' },
      ],
      ar: [
        { metric: '70%', description: 'انخفاض وقت البحث عن الأدوات' },
        { metric: '35%', description: 'تحسين كفاءة الخدمة' },
        { metric: '40%', description: 'زيادة رضا العملاء' },
        { metric: '98%', description: 'دقة مخزون القطع' },
      ],
    },
    caseData: {
      metric: '70%',
      description: {
        en: 'Time savings in tool retrieval, enabling more vehicles serviced per day',
        zh: '工具检索时间节省，每天可服务更多车辆',
        ar: 'توفير الوقت في استرداد الأدوات، مما يمكّن من خدمة المزيد من المركبات يومياً',
      },
      details: {
        en: 'A busy auto repair shop with 8 bays implemented our smart cabinet system. Tool search time reduced by 70%, enabling them to service 5 more vehicles per day. Customer satisfaction scores increased by 40%, and service efficiency improved by 35%.',
        zh: '一家拥有8个工位的繁忙汽车维修店实施了我们的智能柜系统。工具搜索时间减少70%，使他们每天能多服务5辆车。客户满意度得分提高40%，服务效率提升35%。',
        ar: 'نفذت ورشة إصلاح سيارات مزدحمة تضم 8 مناطق عمل نظام الخزائن الذكية الخاص بنا. انخفض وقت البحث عن الأدوات بنسبة 70%، مما مكنهم من خدمة 5 مركبات إضافية يومياً. زادت درجات رضا العملاء بنسبة 40%، وتحسنت كفاءة الخدمة بنسبة 35%.',
      },
    },
  },
  {
    id: '7',
    title: {
      en: 'General Manufacturing',
      zh: '通用制造',
      ar: 'التصنيع العام',
    },
    slug: 'general-manufacturing',
    description: {
      en: 'Universal smart storage solutions for various manufacturing industries, providing flexible and scalable tool and material management systems.',
      zh: '为各种制造行业提供通用智能存储解决方案，提供灵活且可扩展的工具和材料管理系统。',
      ar: 'حلول التخزين الذكية الشاملة لمختلف الصناعات التحويلية، وتوفير أنظمة إدارة الأدوات والمواد المرنة والقابلة للتوسع.',
    },
    icon: 'Factory',
    colorTheme: 'purple',
    painPoints: {
      en: [
        'Diverse inventory needs across different departments',
        'Lack of visibility into cross-departmental tool sharing',
        'Manual inventory counts consuming valuable production time',
      ],
      zh: [
        '不同部门之间多样化的库存需求',
        '缺乏跨部门工具共享的可见性',
        '手动库存盘点消耗宝贵的生产时间',
      ],
      ar: [
        'احتياجات مخزون متنوعة عبر أقسام مختلفة',
        'الافتقار إلى الرؤية لمشاركة الأدوات بين الأقسام',
        'عمليات عد المخزون اليدوية تستهلك وقت الإنتاج الثمين',
      ],
    },
    solution: {
      en: 'Our scalable smart cabinet systems can be deployed across multiple departments with centralized management.',
      zh: '我们的可扩展智能柜系统可以跨多个部门部署，并进行集中管理。',
      ar: 'يمكن نشر أنظمة الخزائن الذكية القابلة للتوسع الخاصة بنا عبر أقسام متعددة مع إدارة مركزية.',
    },
    detailedSolution: {
      en: [
        'The system provides cross-departmental visibility, automated inventory counts, and analytics to optimize tool and material allocation across the entire facility. Centralized management reduces administrative overhead.',
        'Flexible deployment options support various departmental needs. The system can be customized for different workflows, tool types, and material categories.',
        'Advanced analytics provide insights into tool usage patterns, enabling data-driven decisions on tool procurement and allocation. The system identifies underutilized assets and optimization opportunities.',
      ],
      zh: [
        '系统提供跨部门可见性、自动化库存盘点和分析，以优化整个设施的工具和材料分配。集中管理减少管理开销。',
        '灵活的部署选项支持各种部门需求。系统可以针对不同工作流程、工具类型和材料类别进行定制。',
        '高级分析提供工具使用模式的洞察，支持数据驱动的 tool 采购和分配决策。系统识别未充分利用的资产和优化机会。',
      ],
      ar: [
        'يوفر النظام الرؤية بين الأقسام، وعمليات عد المخزون الآلية، والتحليلات لتحسين تخصيص الأدوات والمواد عبر المنشأة بأكملها. الإدارة المركزية تقلل المصاريف الإدارية.',
        'خيارات النشر المرنة تدعم احتياجات الأقسام المختلفة. يمكن تخصيص النظام لسير العمل المختلف، وأنواع الأدوات، وفئات المواد.',
        'التحليلات المتقدمة توفر رؤى حول أنماط استخدام الأدوات، مما يمكّن من قرارات تعتمد على البيانات بشأن مشتريات وتخصيص الأدوات. يحدد النظام الأصول المستغلة بشكل غير كافٍ وفرص التحسين.',
      ],
    },
    benefits: [
      'Inventory accuracy 99%+ / 库存准确率99%+ / دقة المخزون 99%+',
      'Cross-departmental efficiency 50% / 跨部门效率50% / كفاءة بين الأقسام 50%',
      'Annual cost savings 25% / 年度成本节省25% / توفير التكلفة السنوية 25%',
      'Admin overhead reduced 40% / 管理开销减少40% / انخفاض المصاريف الإدارية 40%',
    ],
    benefitsDetailed: {
      en: [
        { metric: '99%', description: 'Inventory accuracy rate' },
        { metric: '50%', description: 'Cross-departmental efficiency' },
        { metric: '25%', description: 'Annual cost savings' },
        { metric: '40%', description: 'Admin overhead reduction' },
      ],
      zh: [
        { metric: '99%', description: '库存准确率' },
        { metric: '50%', description: '跨部门效率' },
        { metric: '25%', description: '年度成本节省' },
        { metric: '40%', description: '管理开销减少' },
      ],
      ar: [
        { metric: '99%', description: 'معدل دقة المخزون' },
        { metric: '50%', description: 'كفاءة بين الأقسام' },
        { metric: '25%', description: 'توفير التكلفة السنوية' },
        { metric: '40%', description: 'انخفاض المصاريف الإدارية' },
      ],
    },
    caseData: {
      metric: '99%',
      description: {
        en: 'Inventory accuracy achieved across 6 departments with 500+ managed items',
        zh: '在6个部门实现库存准确率，管理500+件物品',
        ar: 'تحقيق دقة المخزون عبر 6 أقسام مع إدارة 500+ عنصر',
      },
      details: {
        en: 'A diversified manufacturing company implemented our smart cabinet system across 6 departments. Inventory accuracy reached 99%+, cross-departmental efficiency improved by 50%, and annual cost savings of 25% were achieved. Admin overhead reduced by 40%.',
        zh: '一家多元化制造公司在6个部门实施了我们的智能柜系统。库存准确率达到99%+，跨部门效率提高50%，实现年度成本节省25%。管理开销减少40%。',
        ar: 'نفذت شركة تصنيع متنوعة نظام الخزائن الذكية الخاص بنا عبر 6 أقسام. وصلت دقة المخزون إلى 99%+، وتحسنت الكفاءة بين الأقسام بنسبة 50%، وتحققت توفيرات في التكلفة السنوية بنسبة 25%. انخفضت المصاريف الإدارية بنسبة 40%.',
      },
    },
  },
  {
    id: '8',
    title: {
      en: 'Office & Facility Management',
      zh: '办公设施管理',
      ar: 'إدارة المكاتب والمرافق',
    },
    slug: 'office-facility-management',
    description: {
      en: 'Smart management solutions for office supplies and facility materials, streamlining procurement and ensuring cost control with automated dispensing systems.',
      zh: '为办公用品和设施材料提供智能管理解决方案，通过自动化分发系统简化采购并确保成本控制。',
      ar: 'حلول الإدارة الذكية لمستلزمات المكاتب ومواد المرافق، وتبسيط المشتريات وضمان التحكم في التكلفة مع أنظمة التوزيع الآلية.',
    },
    icon: 'Building2',
    colorTheme: 'orange',
    painPoints: {
      en: [
        'Office supply costs difficult to track and control',
        'Employees spending time on supply runs instead of productive work',
        'Frequent over-ordering or urgent last-minute purchases',
      ],
      zh: [
        '办公用品成本难以追踪和控制',
        '员工在供应品采购上花费时间，而不是进行生产性工作',
        '频繁的过度订购或紧急的最后一分钟采购',
      ],
      ar: [
        'تكاليف مستلزمات المكاتب يصعب تتبعها والتحكم فيها',
        'قضاء الموظفين وقتاً في مشتريات التوريد بدلاً من العمل المنتج',
        'الطلب الزائد المتكرر أو المشتريات المستعجلة في اللحظة الأخيرة',
      ],
    },
    solution: {
      en: 'Our smart vending solutions for office environments provide 24/7 access to supplies with user authentication and cost allocation.',
      zh: '我们用于办公环境的智能售货解决方案提供带有用户身份验证和成本分配的24/7供应访问。',
      ar: 'توفر حلول البيع الذكية الخاصة بنا لبيئات المكاتب وصولاً على مدار الساعة طوال أيام الأسبوع للموارد مع مصادقة المستخدم وتخصيص التكلفة.',
    },
    detailedSolution: {
      en: [
        'The system tracks usage patterns, automates reordering, and provides detailed cost reports by department or cost center. Employees can access supplies 24/7 with proper authentication.',
        'Automated reordering based on usage patterns eliminates over-ordering and urgent last-minute purchases. The system maintains optimal stock levels automatically.',
        'Detailed cost allocation reports enable better budget control. The system tracks consumption by department, project, or individual, providing full visibility into office supply expenses.',
      ],
      zh: [
        '系统追踪使用模式，自动化重新订购，并提供按部门或成本中心的详细成本报告。员工可以通过适当的身份验证24/7访问供应品。',
        '基于使用模式的自动化重新订购消除了过度订购和紧急的最后一分钟采购。系统自动保持最佳库存水平。',
        '详细的成本分配报告实现更好的预算控制。系统按部门、项目或个人追踪消耗，提供办公用品费用的完全可见性。',
      ],
      ar: [
        'يتتبع النظام أنماط الاستخدام، ويؤتمت إعادة الطلب، ويوفر تقارير تكلفة مفصلة حسب القسم أو مركز التكلفة. يمكن للموظفين الوصول إلى الموارد على مدار الساعة طوال أيام الأسبوع مع المصادقة المناسبة.',
        'إعادة الطلب المؤتمة بناءً على أنماط الاستخدام تلغي الطلب الزائد والمشتريات المستعجلة في اللحظة الأخيرة. يحافظ النظام على مستويات المخزون المثلى تلقائياً.',
        'تقارير تخصيص التكلفة المفصلة تمكّن من تحكم أفضل في الميزانية. يتتبع النظام الاستهلاك حسب القسم أو المشروع أو الفرد، مما يوفر رؤية كاملة لنفقات مستلزمات المكاتب.',
      ],
    },
    benefits: [
      'Supply cost reduction 30% / 供应成本降低30% / انخفاض تكلفة التوريد 30%',
      'Employee productivity increased 15% / 员工生产力提高15% / زيادة إنتاجية الموظفين 15%',
      'Procurement efficiency improved 60% / 采购效率提升60% / تحسين كفاءة المشتريات 60%',
      'Budget control accuracy 95% / 预算控制准确度95% / دقة التحكم في الميزانية 95%',
    ],
    benefitsDetailed: {
      en: [
        { metric: '30%', description: 'Supply cost reduction' },
        { metric: '15%', description: 'Employee productivity increase' },
        { metric: '60%', description: 'Procurement efficiency improvement' },
        { metric: '95%', description: 'Budget control accuracy' },
      ],
      zh: [
        { metric: '30%', description: '供应成本降低' },
        { metric: '15%', description: '员工生产力提高' },
        { metric: '60%', description: '采购效率提升' },
        { metric: '95%', description: '预算控制准确度' },
      ],
      ar: [
        { metric: '30%', description: 'انخفاض تكلفة التوريد' },
        { metric: '15%', description: 'زيادة إنتاجية الموظفين' },
        { metric: '60%', description: 'تحسين كفاءة المشتريات' },
        { metric: '95%', description: 'دقة التحكم في الميزانية' },
      ],
    },
    caseData: {
      metric: '30%',
      description: {
        en: 'Office supply cost reduction through controlled access and automated procurement',
        zh: '通过受控访问和自动化采购，办公用品成本降低',
        ar: 'انخفاض تكلفة مستلزمات المكاتب من خلال الوصول المحكوم والمشتريات المؤتمة',
      },
      details: {
        en: 'A corporate office with 200+ employees implemented our smart vending system. Office supply costs reduced by 30%, employee productivity increased by 15%, and procurement efficiency improved by 60%. Budget control accuracy reached 95%.',
        zh: '一家拥有200多名员工的企业办公室实施了我们的智能售货系统。办公用品成本降低30%，员工生产力提高15%，采购效率提升60%。预算控制准确度达到95%。',
        ar: 'نفذت مكاتب شركة تضم 200+ موظف نظام البيع الذكي الخاص بنا. انخفضت تكاليف مستلزمات المكاتب بنسبة 30%، وزادت إنتاجية الموظفين بنسبة 15%، وتحسنت كفاءة المشتريات بنسبة 60%. وصلت دقة التحكم في الميزانية إلى 95%.',
      },
    },
  },
];

export default solutions;

// Helper functions
export function getSolutionBySlug(slug: string): Solution | undefined {
  return solutions.find((s) => s.slug === slug);
}

export function getSolutionById(id: string): Solution | undefined {
  return solutions.find((s) => s.id === id);
}

export function getAllSolutions(): Solution[] {
  return solutions;
}
