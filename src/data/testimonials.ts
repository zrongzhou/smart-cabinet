export interface Testimonial {
  id: string;
  name: string;
  nameZh?: string;
  nameAr?: string;
  company: string;
  companyZh?: string;
  companyAr?: string;
  position: string;
  positionZh?: string;
  positionAr?: string;
  content: {
    en: string;
    zh: string;
    ar: string;
  };
  rating: number;
  image: string;
  industry: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'John Smith',
    nameZh: '约翰·史密斯',
    company: 'TechCorp Inc.',
    companyZh: 'TechCorp公司',
    position: 'Operations Manager',
    positionZh: '运营经理',
    content: {
      en: 'Implementing Smart Cabinet solutions has transformed our inventory management. We\'ve reduced waste by 35% and improved efficiency by 50%. The real-time tracking and automated alerts have eliminated stockouts and overstock situations. The ROI was evident within the first 6 months.',
      zh: '实施智能柜解决方案彻底改变了我们的库存管理。我们减少了35%的浪费，效率提高了50%。实时跟踪和自动警报消除了缺货和积压情况。投资回报在头6个月内就显现出来。',
      ar: 'لقد غيّر تنفيذ حلول الخزائن الذكية إدارة المخزون لدينا بالكامل. لقد قللنا الهدر بنسبة 35% وحسّنا الكفاءة بنسبة 50%. أدى التتبع في الوقت الفعلي والتنبيهات الآلية إلى القضاء على حالات نفاد المخزون والفراط في المخزون. كان عائد الاستثمار واضحاً في غضون أول 6 أشهر.',
    },
    rating: 5,
    image: '/images/testimonials/john-smith.jpg',
    industry: 'Technology',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    nameZh: '莎拉·约翰逊',
    company: 'MediCare Solutions',
    companyZh: 'MediCare解决方案公司',
    position: 'Facility Director',
    positionZh: '设施总监',
    content: {
      en: 'The intelligent lockers have revolutionized our staff locker system. Employees love the mobile app integration, and we\'ve seen a 90% reduction in lost item incidents. The installation was smooth, and the support team has been exceptional throughout the process.',
      zh: '智能储物柜彻底改变了我们的员工储物柜系统。员工喜欢移动应用集成，我们看到丢失物品事件减少了90%。安装过程顺利，支持团队在整个过程中都非常出色。',
      ar: 'أحدثت الخزائن الذكية ثورة في نظام خزائن الموظفين لدينا. يحب الموظفون تكامل تطبيق الجوال، وقد شهدنا انخفاضاً بنسبة 90% في حوادث فقدان العناصر. كانت عملية التركيب سلسة، وكان فريق الدعم استثنائياً طوال العملية.',
    },
    rating: 5,
    image: '/images/testimonials/sarah-johnson.jpg',
    industry: 'Healthcare',
  },
  {
    id: '3',
    name: 'Michael Chen',
    nameZh: '迈克尔·陈',
    company: 'Global Logistics Ltd.',
    companyZh: '全球物流有限公司',
    position: 'Warehouse Manager',
    positionZh: '仓库经理',
    content: {
      en: 'We installed 20 Smart Cabinets across our distribution centers, and the results have been outstanding. The AI-powered analytics help us predict demand patterns, and the IoT integration with our WMS has streamlined our entire operation. I highly recommend Smart Cabinet to any logistics company.',
      zh: '我们在配送中心安装了20个智能柜，结果非常出色。AI驱动的分析帮助我们预测需求模式，与WMS的物联网集成简化了我们的整个运营。我强烈推荐智能柜给任何物流公司。',
      ar: 'قمنا بتركيب 20 خزانة ذكية عبر مراكز التوزيع لدينا، وكانت النتائج استثنائية. تساعدنا التحليلات المدعومة بالذكاء الاصطناعي على التنبؤ بأنماط الطلب، وتكامل IoT مع نظام إدارة المستودعات لدينا قد بسّط عمليتنا بالكامل. أوصي بشدة بالخزائن الذكية لأي شركة لوجستيات.',
    },
    rating: 5,
    image: '/images/testimonials/michael-chen.jpg',
    industry: 'Logistics',
  },
];

export default testimonials;

export function getTestimonialsByIndustry(industry: string): Testimonial[] {
  return testimonials.filter((t) => t.industry === industry);
}
