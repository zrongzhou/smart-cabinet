/**
 * landing-content.ts
 * Shared content model for the 23 new SSR landing pages
 * (10 managed-items + 10 industries + 3 standalone).
 *
 * NOTE: the client's meta-description plan is English-only, so `name` / `intro`
 * / `benefits` are authored in English and `zh` / `ar` in every Trilingual field
 * are left empty (the pages fall back to English for those locales).
 */
import type { Trilingual } from '@/lib/seo-page-meta';

export interface LandingBenefit {
  title: string;
  text: string;
}

export interface LandingContent {
  /** Route slug (without locale prefix). */
  slug: string;
  /** H1 / page title. English-only per the SEO plan. */
  name: Trilingual;
  /** Full English meta title (already includes the brand suffix). */
  metaTitle: string;
  /** English intro paragraphs (rendered as SSR copy). */
  intro: string[];
  /** English benefit cards. */
  benefits: LandingBenefit[];
}
