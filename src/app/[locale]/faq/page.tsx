import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/seo';
import { buildStaticPageKeywords, buildHreflang } from '@/lib/seo-keywords';
import { FaqClient } from './FaqClient';

const PAGE_TITLE: Record<'en' | 'zh' | 'ar', string> = {
  en: 'FAQ',
  zh: '常见问题',
  ar: 'الأسئلة الشائعة',
};

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = (params.locale || 'en') as 'en' | 'zh' | 'ar';
  // 全站关键词以英文为主：主词从英文标题提炼，二级用本语言标题核心（仅本语言页出现）
  const en = `FAQ | WS Tool Cabinet`;
  const display = `${PAGE_TITLE[locale]} | WS Tool Cabinet`;
  const keywords = buildStaticPageKeywords(en, display).join(', ');
  const { canonical, languages } = buildHreflang(getBaseUrl(), locale, '/faq');
  return {
    title: display,
    description:
      'Frequently asked questions about WS Tool Cabinet smart storage, tool vending machines, RFID tool tracking, customization and after-sales support.',
    keywords,
    alternates: { canonical, languages },
  };
}

export default function Page({ params }: PageProps) {
  return <FaqClient />;
}
