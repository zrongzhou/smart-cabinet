import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/seo';
import { buildStaticPageKeywords, buildHreflang } from '@/lib/seo-keywords';
import { FaqClient } from './FaqClient';

const PAGE_META: Record<string, { title: string; description: string }> = {
  en: {
    title: 'FAQ | Qtech Tool Cabinet',
    description: 'Frequently asked questions about Qtech smart storage, tool vending machines, RFID tool tracking, customization and after-sales support.',
  },
  zh: {
    title: '常见问题 | Qtech 智能工具柜',
    description: '关于 Qtech 智能存储、工具自动售货机、RFID 刀具追踪、定制与售后支持的常见问题解答。',
  },
  ar: {
    title: 'الأسئلة الشائعة | Qtech خزائن الأدوات الذكية',
    description: 'أسئلة شائعة حول التخزين الذكي من Qtech، وآلات بيع الأدوات، وتتبع أدوات RFID، والتخصيص، ودعم ما بعد البيع.',
  },
};

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = (params.locale || 'en') as 'en' | 'zh' | 'ar';
  const meta = PAGE_META[locale] || PAGE_META.en;
  // 全站关键词以英文为主：主词从英文标题提炼，二级用本语言标题核心（仅本语言页出现）
  const en = `FAQ | Qtech Tool Cabinet`;
  const keywords = buildStaticPageKeywords(en, meta.title).join(', ');
  const { canonical, languages } = buildHreflang(getBaseUrl(), locale, '/faq');
  return {
    title: meta.title,
    description: meta.description,
    keywords,
    alternates: { canonical, languages },
  };
}

export default function Page({ params }: PageProps) {
  return <FaqClient />;
}
