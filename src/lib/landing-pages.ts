/**
 * landing-pages.ts
 * Data for the 3 standalone landing pages:
 *   /[locale]/custom-smart-cabinet
 *   /[locale]/factory-display
 *   /[locale]/shipping-delivery
 * Meta descriptions live in `landingPageMeta` (src/lib/seo-page-meta.ts).
 */
import type { LandingContent } from '@/lib/landing-content';

export const landingPages: LandingContent[] = [
  {
    slug: 'custom-smart-cabinet',
    name: { en: 'Custom Smart Cabinet Solutions', zh: '', ar: '' },
    metaTitle: 'Custom Smart Cabinet Solutions | WS Tool Cabinet',
    intro: [
      'Custom smart cabinet solutions adapt to CNC tools, PPE, documents, liquids and MRO supplies. We tailor size, access control, software and workflow to your operation.',
      'From a single cabinet to a multi-station vending network, our engineering team designs storage that fits your space, your items and your processes.',
    ],
    benefits: [
      { title: 'Tailored size', text: 'Cabinet dimensions matched to your footprint and items.' },
      { title: 'Access control', text: 'Card, PIN, face or RFID to fit your security policy.' },
      { title: 'Software & workflow', text: 'Integrate with ERP/MES and your replenishment rules.' },
    ],
  },
  {
    slug: 'factory-display',
    name: { en: 'Smart Cabinet Factory Display', zh: '', ar: '' },
    metaTitle: 'Smart Cabinet Factory Display | WS Tool Cabinet',
    intro: [
      'Visit our smart cabinet factory to see the production workshop and quality process behind CNC tool vending machines, PPE cabinets and industrial lockers.',
      'From sheet-metal fabrication to final inspection, our display shows how each cabinet is built, tested and prepared for global delivery.',
    ],
    benefits: [
      { title: 'Production workshop', text: 'See sheet-metal, assembly and testing lines in action.' },
      { title: 'Quality process', text: 'Understand inspection and burn-in before shipment.' },
      { title: 'Cabinet range', text: 'View CNC, PPE, RFID and locker products side by side.' },
    ],
  },
  {
    slug: 'shipping-delivery',
    name: { en: 'Shipping & Delivery', zh: '', ar: '' },
    metaTitle: 'Shipping & Delivery | WS Tool Cabinet',
    intro: [
      'Learn about wooden box packaging and delivery options for smart cabinets, CNC tool vending machines and industrial vending systems.',
      'Every cabinet is crated for overseas transit and shipped through reliable freight partners, with documentation handled for smooth customs clearance.',
    ],
    benefits: [
      { title: 'Wooden box packing', text: 'Export-grade crating protects cabinets in transit.' },
      { title: 'Global freight', text: 'Sea and air options to major ports worldwide.' },
      { title: 'Customs ready', text: 'Documentation prepared for smooth clearance.' },
    ],
  },
];

export const landingPageMap: Record<string, LandingContent> = Object.fromEntries(
  landingPages.map((item) => [item.slug, item]),
);
