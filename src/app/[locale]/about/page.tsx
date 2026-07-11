import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/seo';
import { buildStaticPageKeywords, buildHreflang } from '@/lib/seo-keywords';
import { AboutClient } from './AboutClient';

const PAGE_META: Record<string, { title: string; description: string }> = {
  en: {
    title: 'About Qtech Tool Cabinet | Smart Cabinet Manufacturer in China',
    description: 'Guangzhou Qiuyuan Technology manufactures smart material cabinets, CNC tool vending machines and MRO inventory solutions with 11 years of experience.',
  },
  zh: {
    title: '关于 Qtech 智能工具柜 | 中国智能柜制造商',
    description: '了解广州秋渊科技——一家服务于全球工厂的智能工具柜与工业自动售货机制造商。',
  },
  ar: {
    title: 'حول Qtech لخزائن الأدوات الذكية | مصنع الخزائن الذكية في الصين',
    description: 'تعرّف على شركة قوانغتشو تشيويوان للتكنولوجيا، مصنع خزائن الأدوات الذكية وآلات البيع الصناعية الذي يخدم المصانع في جميع أنحاء العالم.',
  },
};

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = (params.locale || 'en') as 'en' | 'zh' | 'ar';
  const meta = PAGE_META[locale] || PAGE_META.en;
  // 全站关键词以英文为主：主词从英文标题提炼，二级用本语言标题核心（仅本语言页出现）
  const en = `About Qtech Tool Cabinet | Smart Cabinet Manufacturer in China`;
  const keywords = buildStaticPageKeywords(en, meta.title).join(', ');
  const { canonical, languages } = buildHreflang(getBaseUrl(), locale, '/about');
  return {
    title: meta.title,
    description: meta.description,
    keywords,
    alternates: { canonical, languages },
  };
}

export default function Page({ params }: PageProps) {
  return <AboutClient />;
}
