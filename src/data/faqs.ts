export interface FAQ {
  id: string;
  question: {
    en: string;
    zh: string;
    ar: string;
  };
  answer: {
    en: string;
    zh: string;
    ar: string;
  };
  category: string;
  status?: 'active' | 'inactive';
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: {
      en: 'What access methods are available?',
      zh: '有哪些访问方式？',
      ar: 'ما هي طرق الوصول المتاحة؟',
    },
    answer: {
      en: 'Our smart cabinets support multiple access methods to suit different workplace needs. These include RFID card recognition, fingerprint biometric scanning, facial recognition technology, and PIN code entry. You can configure single or multi-factor authentication based on your security requirements. The system also supports mobile app integration for remote authorization and audit trail access.',
      zh: '我们的智能柜支持多种访问方式，以适应不同的工作场所需求。包括RFID卡识别、指纹生物识别扫描、面部识别技术和PIN码输入。您可以根据安全要求配置单一或多因素认证。系统还支持移动应用集成，用于远程授权和审计跟踪访问。',
      ar: 'تدرم خزائننا الذكية طرق وصول متعددة لتناسب احتياجات أماكن العمل المختلفة. وتشمل هذه التعرف على بطاقة RFID، ومسح البصمة الحيوية، وتقنية التعرف على الوجه، وإدخال رمز PIN. يمكنك تكوين المصادقة الأحادية أو متعددة العوامل بناءً على متطلبات الأمان الخاصة بك. كما تدرم النظام تكامل تطبيق الجوال للتصريح عن بُعد والوصول إلى سجل التدقيق.',
    },
    category: 'features',
  },
  {
    id: '2',
    question: {
      en: 'Can different users have different permissions?',
      zh: '不同用户可以有不同权限吗？',
      ar: 'هل يمكن للمستخدمين المختلفين الحصول على أذونات مختلفة؟',
    },
    answer: {
      en: 'Yes, our system features a comprehensive role-based access control (RBAC) mechanism. Administrators can define user roles with specific permissions for viewing, retrieving, and returning items. You can set different authority levels for managers, operators, and auditors. The system logs all user activities with timestamps, creating a complete audit trail for accountability and compliance purposes.',
      zh: '是的，我们的系统具备全面的基于角色的访问控制（RBAC）机制。管理员可以定义具有特定权限的用户角色，用于查看、领取和归还物品。您可以为经理、操作员和审计员设置不同的权限级别。系统记录所有用户活动及时间戳，为责任追究和合规目的创建完整的审计轨迹。',
      ar: 'نعم، يتميز نظامنا بآلية شاملة للتحكم في الوصول القائم على الأدوار (RBAC). يمكن للمدراء تعريف أدوار المستخدمين بأذونات محددة للعرض والاسترداد وإرجاع العناصر. يمكنك تعيين مستويات سلطة مختلفة للمدراء والمشغلين والمدققين. يسجل النظام جميع أنشطة المستخدمين مع طوابع زمنية، مما يؤدي إلى إنشاء سجل تدقيق كامل لأغراض المساءلة والامتثال.',
    },
    category: 'security',
  },
  {
    id: '3',
    question: {
      en: 'Can the cabinet track who takes each item?',
      zh: '系统能追踪谁取走了每件物品吗？',
      ar: 'هل يمكن للخزانة تتبع من أخذ كل عنصر؟',
    },
    answer: {
      en: 'Absolutely. Our smart cabinet system provides complete traceability for every item transaction. When a user accesses the cabinet, the system records their identity, the exact timestamp, and which specific items were taken or returned. This creates a full chain of custody for all managed items. The data is stored securely and can be accessed through the management software for auditing, analysis, and compliance reporting.',
      zh: '当然可以。我们的智能柜系统为每一笔物品交易提供完整的可追溯性。当用户访问柜子时，系统记录他们的身份、准确的时间戳以及领取或归还的具体物品。这为企业管理的所有物品创建了完整的监管链。数据被安全存储，可通过管理软件进行审计、分析和合规报告。',
      ar: 'بالتأكيد. يوفر نظام الخزانة الذكية الخاص بنا القدرة الكاملة على التتبع لكل معاملة من معاملات العناصر. عندما يصل المستخدم إلى الخزانة، يسجل النظام هويته، والطابع الزمني الدقيق، والعناصر المحددة التي تم أخذها أو إرجاعها. هذا يؤدي إلى إنشاء سلسلة حيازة كاملة لجميع العناصر المدارة. يتم تخزين البيانات بشكل آمن ويمكن الوصول إليها من خلال برمجيات الإدارة للتدقيق والتحليل وإعداد التقارير المتعلقة بالامتثال.',
    },
    category: 'tracking',
  },
  {
    id: '4',
    question: {
      en: 'Can we check inventory data in real time?',
      zh: '可以实时查看库存数据吗？',
      ar: 'هل يمكننا التحقق من بيانات المخزون في الوقت الفعلي؟',
    },
    answer: {
      en: 'Yes, our smart cabinet system provides real-time inventory visibility through a cloud-based dashboard. Authorized users can access current stock levels, item locations, and usage patterns from any internet-connected device. The system updates instantly when items are taken or returned, ensuring data accuracy. You can also set up automated alerts for low stock, unusual usage patterns, or required reorders.',
      zh: '可以，我们的智能柜系统通过基于云的仪表板提供实时库存可见性。授权用户可以从任何联网设备访问当前库存水平、物品位置和使用模式。当物品被领取或归还时，系统会即时更新，确保数据准确性。您还可以设置自动警报，用于低库存、异常使用模式或需要重新订购的情况。',
      ar: 'نعم، يوفر نظام الخزانة الذكية الخاص بنا الرؤية للمخزون في الوقت الفعلي من خلال لوحة معلومات تعتمد على السحابة. يمكن للمستخدمين المصرح لهم الوصول إلى مستويات المخزون الحالية، ومواقع العناصر، وأنماط الاستخدام من أي جهاز متصل بالإنترنت. يقوم النظام بالتحديث فوراً عند أخذ العناصر أو إرجاعها، مما يضمن دقة البيانات. يمكنك أيضاً إعداد تنبيهات آلية للمخزون المنخفض، وأنماط الاستخدام غير المعتادة، أو إعادات الطلب المطلوبة.',
    },
    category: 'features',
  },
  {
    id: '5',
    question: {
      en: 'Can reports be exported?',
      zh: '可以导出报表吗？',
      ar: 'هل يمكن تصدير التقارير؟',
    },
    answer: {
      en: 'Our system includes comprehensive reporting features with multiple export options. You can generate reports on inventory status, user activities, usage trends, and cost analysis, then export them in Excel, PDF, or CSV formats. Scheduled reports can be automatically generated and emailed to specified recipients. All reports can be customized with date ranges, user filters, and specific item categories to meet your business intelligence needs.',
      zh: '我们的系统包含全面的报告功能，提供多种导出选项。您可以生成关于库存状态、用户活动、使用趋势和成本分析的报告，然后以Excel、PDF或CSV格式导出。计划报告可以自动生成并通过电子邮件发送给指定收件人。所有报告都可以使用日期范围、用户筛选器和特定物品类别进行自定义，以满足您的商业智能需求。',
      ar: 'يتضمن نظامنا ميزات إعداد التقارير الشاملة مع خيارات تصدير متعددة. يمكنك إعداد تقارير حول حالة المخزون، وأنشطة المستخدمين، واتجاهات الاستخدام، وتحليل التكاليف، ثم تصديرها بتنسيقات Excel أو PDF أو CSV. يمكن إعداد التقارير المجدولة وتوليدها آلياً وإرسالها بالبريد الإلكتروني إلى المستلمين المحددين. يمكن تخصيص جميع التقارير بناات التواريخ، ومرشحات المستخدمين، وفئات العناصر المحددة لتلبية احتياجات استخبارات عملك.',
    },
    category: 'reporting',
  },
  {
    id: '6',
    question: {
      en: 'Can your system connect with our existing software?',
      zh: '你们的系统和我们现有软件可以对接吗？',
      ar: 'هل يمكن لنظامكم الاتصال ببرمجياتنا الموجودة؟',
    },
    answer: {
      en: 'Yes, we provide robust API integration capabilities to connect with most ERP, MES, and inventory management systems. Our system supports standard protocols including REST API, WebSocket, and database connectors. We have pre-built integrations with popular systems like SAP, Oracle, and Microsoft Dynamics. Our technical team will work with you to ensure seamless data flow between systems and can develop custom integration solutions if needed.',
      zh: '可以，我们提供强大的API集成功能，可与大多数ERP、MES和库存管理系统连接。我们的系统支持标准协议，包括REST API、WebSocket和数据库连接器。我们已预建与SAP、Oracle和Microsoft Dynamics等流行系统的集成。我们的技术团队将与您合作，确保系统之间的无缝数据流，并在需要时开发定制集成解决方案。',
      ar: 'نعم، نوفر قدرات تكامل قوية لواجهة برمجة التطبيقات (API) للاتصال بمعظم أنظمة ERP وMES وإدارة المخزون. يدرم نظامنا البروتوكولات القياسية بما في ذلك REST API وWebSocket وموصلات قاعدة البيانات. لدينا تكاملات مسبقة البناء مع أنظمة شائعة مثل SAP وOracle وMicrosoft Dynamics. سيعمل فريقنا التقني معك لضمان تدفق البيانات السلس بين الأنظمة ويمكنه تطوير حلول تكامل مخصصة إذا لزم الأمر.',
    },
    category: 'integration',
  },
  {
    id: '7',
    question: {
      en: 'What materials can be managed?',
      zh: '可以管理哪些物料？',
      ar: 'ما هي المواد التي يمكن إدارتها؟',
    },
    answer: {
      en: 'Our smart cabinets are designed to manage a wide variety of industrial materials and tools. This includes cutting tools, MRO supplies, PPE equipment, spare parts, consumables, office supplies, documents, abrasives, and special liquid materials. The modular design allows customization for specific item sizes and types. Weight sensors, RFID tags, and compartment configurations can be adjusted to accommodate different material characteristics and management requirements.',
      zh: '我们的智能柜旨在管理各种工业物料和工具。包括切削刀具、MRO用品、劳保用品、备件、耗材、办公用品、文档、磨料和特殊液体材料。模块化设计允许针对特定物品尺寸和类型进行定制。重量传感器、RFID标签和格位配置可以调整，以适应不同的物料特征和管理要求。',
      ar: 'تم تصميم خزائننا الذكية لإدارة مجموعة واسعة من المواد والأدوات الصناعية. يشمل ذلك أدوات القطع، ولوازم MRO، ومعدات PPE، وقطع الغيار، والمستهلكات، ومستلزمات المكتب، والمستندات، والمواد الكاشطة، والمواد السائلة الخاصة. يسمح التصميم المعياري بالتخصيص لأحجام وأنواع العناصر المحددة. يمكن تعديل مستشعرات الوزن، ووسوم RFID، وتكوينات المقاصير للتكيف مع خصائص المواد المختلفة ومتطلبات الإدارة.',
    },
    category: 'products',
  },
  {
    id: '8',
    question: {
      en: 'Can we set usage limits?',
      zh: '可以设置使用限制吗？',
      ar: 'هل يمكننا تعيين حدود الاستخدام؟',
    },
    answer: {
      en: 'Yes, our system allows administrators to set flexible usage limits and controls for different users and item categories. You can define daily, weekly, or monthly withdrawal limits per user, restrict access to specific time periods, and set minimum/maximum quantity rules. The system will automatically enforce these limits and can send notifications when thresholds are approached. This helps prevent waste, unauthorized use, and ensures fair resource allocation across your team.',
      zh: '可以，我们的系统允许管理员为不同的用户和物品类别设置灵活的使用限制和控制。您可以定义每个用户的每日、每周或每月领取限制，限制对特定时间段的访问，并设置最小/最大数量规则。系统将自动执行这些限制，并可以在接近阈值时发送通知。这有助于防止浪费、未经授权的使用，并确保团队资源的公平分配。',
      ar: 'نعم، يسمح نظامنا للمدراء بتعيين حدود استخدام وضوابط مرنة لمستخدمين وفئات عناصر مختلفة. يمكنك تعريف حدود السحب اليومية أو الأسبوعية أو الشهرية لكل مستخدم، وتقييد الوصول لفترات زمنية محددة، وتعيين قواعد الكمية الدنيا/القصوى. سيقوم النظام بفرض هذه الحدود آلياً ويمكنه إرسال إشعارات عند الاقتراب من العتبات. هذا يساعد على منع الهدر، والاستخدام غير المصرح به، ويضمن توزيع الموارد بشكل عادل عبر فريقك.',
    },
    category: 'features',
  },
  {
    id: '9',
    question: {
      en: 'Does the system have low-stock alerts?',
      zh: '系统有低库存提醒吗？',
      ar: 'هل يحتوي النظام على تنبيهات المخزون المنخفض؟',
    },
    answer: {
      en: 'Yes, our smart cabinet system includes configurable low-stock alert functionality. You can set minimum stock thresholds for each item type, and the system will automatically notify designated personnel via email, SMS, or in-app notifications when inventory falls below the defined level. Alerts can be customized by urgency level and can trigger automatic reorder workflows if integrated with your procurement system. This ensures continuous operation without unexpected stockouts.',
      zh: '是的，我们的智能柜系统包含可配置的低库存警报功能。您可以为每种物品类型设置最低库存阈值，当库存低于定义水平时，系统将通过电子邮件、短信或应用内通知自动通知指定人员。警报可以按紧急程度自定义，如果与采购系统集成，可以触发自动重新订购工作流程。这确保了连续运营，不会出现意外的缺货情况。',
      ar: 'نعم، يتضمن نظام الخزانة الذكية الخاص بنا وظيفة تنبيه المخزون المنخفض القابلة للتكوين. يمكنك تعيين عتبات المخزون الدنيا لكل نوع عنصر، وسيقوم النظام بإخطار الموظفين المعينين آلياً عبر البريد الإلكتروني أو الرسائل القصيرة أو إشعارات داخل التطبيق عندما ينخفض المخزون عن المستوى المعرف. يمكن تخصيص التنبيهات حسب مستوى الاستعجال ويمكنها تحفيز مسارات عمل إعادة الطلب الآلية إذا كانت متكاملة مع نظام المشتريات الخاص بك. هذا يضمن التشغيل المستمر دون نفاد مفاجئ للمخزون.',
    },
    category: 'features',
  },
  {
    id: '10',
    question: {
      en: 'Can the cabinet and software be customized?',
      zh: '柜体和软件可以定制吗？',
      ar: 'هل يمكن تخصيص الخزانة والبرمجيات؟',
    },
    answer: {
      en: 'Absolutely. We offer extensive customization options for both hardware and software to meet your specific requirements. Hardware customization includes cabinet dimensions, compartment configurations, access methods, and branding elements. Software customization covers user interface localization, workflow customization, report templates, and API integration with existing systems. Our engineering team will work closely with you to deliver a solution that fits your exact operational needs.',
      zh: '当然可以。我们为硬件和软件提供广泛的定制选项，以满足您的特定要求。硬件定制包括柜体尺寸、格位配置、访问方式和品牌元素。软件定制涵盖用户界面本地化、工作流程定制、报告模板以及与现有系统的API集成。我们的工程团队将与您密切合作，提供完全符合您运营需求的解决方案。',
      ar: 'بالتأكيد. نوفر خيارات تخصيص واسعة لكل من الأجهزة والبرمجيات لتلبية متطلباتك المحددة. يشمل تخصيص الأجهزة أبعاد الخزانة، وتكوينات المقاصير، وطرق الوصول، وعناصر العلامة التجارية. يغطي تخصيص البرمجيات تعريب واجهة المستخدم، وتخصيص مسار العمل، وقوالب التقارير، وتكامل API مع الأنظمة الموجودة. سيعمل فريق الهندسة لدينا عن كثب معك لتقديم حل يناسب احتياجاتك التشغيلية الدقيقة.',
    },
    category: 'customization',
  },
  {
    id: '11',
    question: {
      en: 'Is it suitable for PPE management?',
      zh: '适合 PPE 管理吗？',
      ar: 'هل هو مناسب لإدارة PPE؟',
    },
    answer: {
      en: 'Yes, our smart cabinets are ideal for Personal Protective Equipment (PPE) management. The system helps ensure compliance with safety regulations by tracking PPE issuance, usage, and expiration dates. You can set up automatic alerts for replacement intervals, maintain inventory of safety gear, and generate compliance reports. The cabinets can be configured with appropriate compartment sizes for items like safety glasses, gloves, helmets, high-visibility vests, and respiratory protection equipment.',
      zh: '是的，我们的智能柜非常适合个人防护装备（PPE）管理。系统通过追踪PPE的发放、使用和到期日期，帮助确保安全法规的合规性。您可以设置更换间隔的自动警报，维护安全装备的库存，并生成合规报告。柜子可以配置适当的格位尺寸，用于安全眼镜、手套、头盔、高可见度背心和呼吸防护装备等物品。',
      ar: 'نعم، خزائننا الذكية مثالية لإدارة معدات الحماية الشخصية (PPE). يساعد النظام على ضمان الامتثال للوائح السلامة من خلال تتبع إصدار PPE والاستخدام وتواريخ انتهاء الصلاحية. يمكنك إعداد تنبيهات آلية لفترات الاستبدال، والحفاظ على مخزون معدات السلامة، وإعداد تقارير الامتثال. يمكن تكوين الخزائن بأبعاد مقاصير مناسبة للعناصر مثل النظارات الواقية والقفازات والخوذات والسترات عالية الرؤية ومعدات الحماية التنفسية.',
    },
    category: 'applications',
  },
  {
    id: '12',
    question: {
      en: 'Can we start with one cabinet for testing?',
      zh: '可以先买一台测试吗？',
      ar: 'هل يمكننا البدء بخزانة واحدة للاختبار؟',
    },
    answer: {
      en: 'Yes, we support pilot programs with a minimum order quantity (MOQ) of just one cabinet. This allows you to evaluate the system\'s effectiveness in your actual working environment before making a larger investment. Our team will help you select the right cabinet model, assist with installation and configuration, and provide training for your staff. After the pilot, we can seamlessly expand the system with additional cabinets and integrate them into your existing setup.',
      zh: '可以，我们支持试点项目，最低订购量（MOQ）仅为一台柜子。这使您能够在进行更大投资之前，在实际工作环境中评估系统的有效性。我们的团队将帮助您选择合适的柜体型号，协助安装和配置，并为您的员工提供培训。试点结束后，我们可以无缝扩展系统，增加更多柜子并将其集成到您现有的设置中。',
      ar: 'نعم، نحن ندعم برامج تجريبية بحد أدنى لكمية الطلب (MOQ) يبلغ خزانة واحدة فقط. هذا يسمح لك بتقييم فعالية النظام في بيئة عملك الفعلية قبل القيام باستثمار أكبر. سيساعدك فريقنا في اختيار نموذج الخزانة الصحيح، والمساعدة في التركيب والتكوين، وتوفير التدريب لموظفيك. بعد التجربة، يمكننا توسيع النظام بسلاسة بإضافة خزائن إضافية ودمجها في إعدادك الموجود.',
    },
    category: 'sales',
  },
  {
    id: '13',
    question: {
      en: 'What is the lead time?',
      zh: '交货期是多久？',
      ar: 'ما هو وقت التسليم؟',
    },
    answer: {
      en: 'Lead time depends on the product type and customization requirements. For standard cabinet models, our typical lead time is 2-4 weeks from order confirmation to delivery. Customized solutions may require 6-8 weeks depending on the complexity of modifications. We maintain buffer stock for popular models to expedite delivery when possible. Our sales team will provide you with a specific delivery timeline when you place your order, and you can track production status through our customer portal.',
      zh: '交货期取决于产品类型和定制要求。对于标准柜体型号，我们从订单确认到交付的典型交货期为2-4周。定制解决方案可能需要6-8周，具体取决于修改的复杂程度。我们为热门型号维持缓冲库存，以尽可能加快交付。我们的销售团队将在您下订单时为您提供具体的交付时间表，您可以通过我们的客户门户跟踪生产状态。',
      ar: 'يعتمد وقت التسليم على نوع المنتج ومتطلبات التخصيص. بالنسبة لنماذج الخزائن القياسية، فإن وقت التسليم النموذجي لدينا هو 2-4 أسابيع من تأكيد الطلب إلى التسليم. قد تتطلب الحلول المخصصة 6-8 أسابيع اعتماداً على تعقيد التعديلات. نحافظ على مخزون مؤقت للنماذج الشائعة لتسريع التسليم متى أمكن. سيقدم لك فريق المبيعات لدينا جدولاً زمنياً محدداً للتسليم عندما تضع طلبك، ويمكنك تتبع حالة الإنتاج من خلال بوابة العملاء لدينا.',
    },
    category: 'sales',
  },
  {
    id: '14',
    question: {
      en: 'Do you provide after-sales service?',
      zh: '你们提供售后服务吗？',
      ar: 'هل تقدمون خدمة ما بعد البيع؟',
    },
    answer: {
      en: 'Yes, we provide comprehensive after-sales support to ensure your smart cabinet system operates reliably. Our service package includes 1-year standard warranty covering parts and labor, with options for extended warranty plans. We offer remote technical support, on-site maintenance visits, software updates, and a dedicated customer service hotline. Our global service network ensures quick response times, and we maintain a spare parts inventory for fast replacements when needed.',
      zh: '是的，我们提供全面的售后服务，确保您的智能柜系统可靠运行。我们的服务包包括1年标准保修，涵盖零件和人工，并提供延长保修计划选项。我们提供远程技术支持、现场维护访问、软件更新和专门的客户服务热线。我们的全球服务网络确保快速响应时间，并且我们维护备件库存，以便在需要时快速更换。',
      ar: 'نعم، نحن نقدم دعماً شاملاً بعد البيع لضمان تشغيل نظام الخزانة الذكية الخاص بك بموثوقية. تتضمن حزمة الخدمة لدينا ضماناً قياسياً لمدة عام واحد يغطي قطع الغيار والعمالة، مع خيارات لخطط ضمان ممتدة. نحن نقدم الدعم التقني عن بُعد، وزيارات الصيانة في الموقع، وتحديثات البرمجيات، وخط ساخن مخصص لخدمة العملاء. تضمن شبكة الخدمة العالمية لدينا أوقات استجابة سريعة، ونحافظ على مخزون قطع الغيار للاستبدال السريع عند الحاجة.',
    },
    category: 'support',
  },
  {
    id: '15',
    question: {
      en: 'How do you ensure product quality?',
      zh: '你们如何确保产品质量？',
      ar: 'كيف تضمنون جودة المنتج؟',
    },
    answer: {
      en: 'Quality assurance is integral to our manufacturing process. We are ISO 9001 quality management system certified and hold CE certification for our products. Every cabinet undergoes rigorous testing before leaving our factory, including functional tests, durability assessments, and safety inspections. We maintain complete traceability of components with quality documentation for each unit. Our production facilities follow strict quality control protocols, and we continuously improve our processes based on customer feedback and field performance data.',
      zh: '质量保证是我们制造过程中不可或缺的一部分。我们通过了ISO 9001质量管理体系认证，产品持有CE认证。每个柜子在离开工厂前都要经过严格测试，包括功能测试、耐用性评估和安全检查。我们保持组件的完整可追溯性，每个单元都有质量文件。我们的生产设施遵循严格的质量控制协议，并且我们根据客户反馈和现场性能数据不断改进我们的流程。',
      ar: 'تعد ضمانة الجودة جزءاً لا يتجزأ من عملية التصنيع لدينا. نحن حاصلون على شهادة نظام إدارة الجودة ISO 9001 ونحمل شهادة CE لمنتجاتنا. يخضع كل خزانة لاختبارات صارمة قبل مغادرة مصنعنا، بما في ذلك الاختبارات الوظيفية، وتقييمات المتانة، وعمليات التفتيش على السلامة. نحافظ على القدرة الكاملة على التتبع للمكونات مع وثائق الجودة لكل وحدة. تتبع مرافق الإنتاج لدينا بروتوكولات صارمة للتحكم في الجودة، ونحن نحسن عملياتنا باستمرار بناءً على تعليقات العملاء وبيانات أداء الحقل.',
    },
    category: 'company',
  },
  {
    id: '16',
    question: {
      en: 'How many employees does your company have?',
      zh: '贵公司有多少名员工？',
      ar: 'كم عدد الموظفين في شركتكم؟',
    },
    answer: {
      en: 'Our company currently employs 85 dedicated professionals across research and development, manufacturing, sales, and customer support departments. Our team includes experienced engineers, software developers, manufacturing specialists, and customer service representatives. This workforce size allows us to maintain high quality standards while providing responsive service and continuous innovation. We are committed to sustainable growth and reinvest a significant portion of our revenue into R&D to bring you cutting-edge smart storage solutions.',
      zh: '我们公司目前拥有85名专业人员，分布在研发、制造、销售和客户服务部门。我们的团队包括经验丰富的工程师、软件开发人员、制造专家和客户服务代表。这个规模的员工队伍使我们能够保持高质量标准，同时提供响应迅速的服务和持续的创新。我们致力于可持续增长，并将收入的很大一部分重新投资于研发，为您带来尖端的智能存储解决方案。',
      ar: 'توظف شركتنا حالياً 85 محترفاً مخلصاً عبر أقسام البحث والتطوير، والتصنيع، والمبيعات، ودعم العملاء. يتضمن فريقنا مهندسين ذوي خبرة، ومطوري برمجيات، ومتخصصين في التصنيع، وممثلين لخدمة العملاء. يسمح لنا حجم القوى العاملة هذا بالحفاظ على معايير جودة عالية مع تقديم خدمة مستجيبة وابتكار مستمر. نحن ملتزمون بالنمو المستدام ونعيد استثمار جزء كبير من إيراداتنا في البحث والتطوير لتقديم حلول تخزين ذكية متطورة لك.',
    },
    category: 'company',
  },
];

export default faqs;

// Helper functions
export function getFAQsByCategory(category: string): FAQ[] {
  return faqs.filter((f) => f.category === category);
}

export function getAllFAQs(): FAQ[] {
  return faqs;
}

export function getFAQById(id: string): FAQ | undefined {
  return faqs.find((f) => f.id === id);
}
