import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getBaseUrl } from '@/lib/seo';
import { buildStaticPageKeywords, buildHreflang } from '@/lib/seo-keywords';
import { FaqClient } from './FaqClient';

// 静态内容页，ISR 重新校验
export const revalidate = 300;

const PAGE_META: Record<string, { title: string; description: string }> = {
  en: {
    title: 'FAQ | Qtech Tool Cabinet',
    description: 'Find answers about CNC tool vending machines, smart lockers, PPE cabinets, software integration, customization, delivery and after-sales support.',
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
  // 标题不带 " | " 分隔符，避免 buildStaticPageKeywords 按 | 切分后只保留第一段（"faq"），
  // 从而保证英文关键词由完整英文标题提炼出多个词元（faq, ws, tool, cabinet）。
  const en = 'FAQ Qtech';
  const keywords = buildStaticPageKeywords(en, meta.title).join(', ');
  const { canonical, languages } = buildHreflang(getBaseUrl(), locale, '/faq');
  return {
    title: meta.title,
    description: meta.description,
    keywords,
    alternates: { canonical, languages },
  };
}

export default async function Page({ params }: PageProps) {
  // V8.10: 服务端拉取 FAQ，作为 props 传给 FaqClient，确保 FAQ 内容出现在 SSR HTML。
  const faqs = await prisma.fAQ.findMany({
    where: { status: 'active' },
    orderBy: { order: 'asc' },
  });
  return <FaqClient initialFaqs={faqs as any} />;
}
