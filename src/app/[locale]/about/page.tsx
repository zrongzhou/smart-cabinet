import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/seo';
import { buildStaticPageKeywords, buildHreflang } from '@/lib/seo-keywords';
import { AboutClient } from './AboutClient';

const PAGE_TITLE: Record<'en' | 'zh' | 'ar', string> = {
  en: 'About WS Tool Cabinet',
  zh: '关于 WS 工具柜',
  ar: 'حول WS Tool Cabinet',
};

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = (params.locale || 'en') as 'en' | 'zh' | 'ar';
  // 全站关键词以英文为主：主词从英文标题提炼，二级用本语言标题核心（仅本语言页出现）
  const en = `About WS Tool Cabinet | WS Tool Cabinet`;
  const display = `${PAGE_TITLE[locale]} | WS Tool Cabinet`;
  const keywords = buildStaticPageKeywords(en, display).join(', ');
  const { canonical, languages } = buildHreflang(getBaseUrl(), locale, '/about');
  return {
    title: display,
    description:
      'WS Tool Cabinet (Guangzhou Qiuyan Technology) — an intelligent tool cabinet, vending machine and RFID inventory solutions manufacturer serving 60+ countries since 2010.',
    keywords,
    alternates: { canonical, languages },
  };
}

export default function Page({ params }: PageProps) {
  return <AboutClient />;
}
