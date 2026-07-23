import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/seo';
import { buildStaticPageKeywords, buildHreflang } from '@/lib/seo-keywords';
import { ContactClient } from './ContactClient';

// 静态内容页，ISR 重新校验
export const revalidate = 300;

const PAGE_META: Record<string, { title: string; description: string }> = {
  en: {
    title: 'Contact Qtech Tool Cabinet | Request a Smart Cabinet Quote',
    description: 'Contact us for CNC tool vending machines, smart lockers, PPE cabinets and MRO inventory management solutions customized for your factory.',
  },
  zh: {
    title: '联系 Qtech 智能工具柜 | 获取智能柜报价',
    description: '联系 Qtech，咨询 CNC 刀具自动售货机、PPE 自动售货柜、RFID 智能柜及定制工业库存解决方案。',
  },
  ar: {
    title: 'اتصل بـ Qtech لخزائن الأدوات الذكية | اطلب عرض سعر للخزانة الذكية',
    description: 'تواصل مع Qtech للحصول على آلات بيع أدوات CNC، وخزائن بيع PPE، وخزائن RFID الذكية، وحلول جرد صناعية مخصصة.',
  },
};

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = (params.locale || 'en') as 'en' | 'zh' | 'ar';
  const meta = PAGE_META[locale] || PAGE_META.en;
  // 全站关键词以英文为主：主词从英文标题提炼，二级用本语言标题核心（仅本语言页出现）
  const en = `Contact Qtech Tool Cabinet | Request a Smart Cabinet Quote`;
  const keywords = buildStaticPageKeywords(en, meta.title).join(', ');
  const { canonical, languages } = buildHreflang(getBaseUrl(), locale, '/contact');
  return {
    title: meta.title,
    description: meta.description,
    keywords,
    alternates: { canonical, languages },
  };
}

export default function Page({ params }: PageProps) {
  return <ContactClient />;
}
