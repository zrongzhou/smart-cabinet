import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/seo';
import { buildStaticPageKeywords, buildHreflang } from '@/lib/seo-keywords';
import { ContactClient } from './ContactClient';

const PAGE_TITLE: Record<'en' | 'zh' | 'ar', string> = {
  en: 'Contact WS Tool Cabinet',
  zh: '联系 WS 工具柜',
  ar: 'اتصل بـ WS Tool Cabinet',
};

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = (params.locale || 'en') as 'en' | 'zh' | 'ar';
  // 全站关键词以英文为主：主词从英文标题提炼，二级用本语言标题核心（仅本语言页出现）
  const en = `Contact WS Tool Cabinet | WS Tool Cabinet`;
  const display = `${PAGE_TITLE[locale]} | WS Tool Cabinet`;
  const keywords = buildStaticPageKeywords(en, display).join(', ');
  const { canonical, languages } = buildHreflang(getBaseUrl(), locale, '/contact');
  return {
    title: display,
    description:
      'Contact WS Tool Cabinet for smart tool cabinets, vending machines and RFID inventory solutions. Reach us via email, phone or WhatsApp for quotes and support.',
    keywords,
    alternates: { canonical, languages },
  };
}

export default function Page({ params }: PageProps) {
  return <ContactClient />;
}
