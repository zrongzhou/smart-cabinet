/**
 * managed-items.ts
 * Data for the 10 "managed items" landing pages under /[locale]/managed-items/[slug].
 * Meta descriptions live in `managedItemMeta` (src/lib/seo-page-meta.ts); this file
 * owns the on-page H1 / intro / benefits content.
 */
import type { LandingContent } from '@/lib/landing-content';

export const managedItems: LandingContent[] = [
  {
    slug: 'cnc-tool-management',
    name: { en: 'CNC Tool Management Cabinets', zh: '', ar: '' },
    metaTitle: 'CNC Tool Management Cabinets | Qtech',
    intro: [
      'CNC tool management cabinets give machine shops full control over cutting tools, from carbide inserts and end mills to drills, taps and tool holders. Every issue and return is recorded by user, so you always know who has which tool and when it was taken.',
      'With employee limits, return tracking and real-time inventory reports, supervisors can stop tool waste, reduce search time and plan regrinding before a tool runs out.',
    ],
    benefits: [
      { title: 'Secure dispensing', text: 'Authorized access only, with every transaction tied to a named employee.' },
      { title: 'Return tracking', text: 'Log used tools, broken cutters and regrinding items for full tool-life analysis.' },
      { title: 'Real-time reports', text: 'Live inventory and usage dashboards help you reorder before stockouts happen.' },
    ],
  },
  {
    slug: 'ppe-safety-supplies',
    name: { en: 'PPE & Safety Supplies Vending', zh: '', ar: '' },
    metaTitle: 'PPE & Safety Supplies Vending | Qtech',
    intro: [
      'PPE inventory management cabinets keep gloves, masks, goggles, respirators and safety gear available exactly where workers need them, without a staffed storeroom.',
      'Controlled access and low-stock alerts prevent both waste and stockouts, so your team stays protected and compliant on every shift.',
    ],
    benefits: [
      { title: 'Reduce waste', text: 'Issue-by-need control cuts hoarding and expired safety supplies.' },
      { title: 'Prevent stockouts', text: 'Low-stock alerts trigger replenishment before critical PPE runs out.' },
      { title: 'Accountability', text: 'Every pickup is logged to a worker for OSHA-style traceability.' },
    ],
  },
  {
    slug: 'fasteners-consumables',
    name: { en: 'Fastener & Consumables Vending', zh: '', ar: '' },
    metaTitle: 'Fastener & Consumables Vending Cabinets | Qtech',
    intro: [
      'Fastener and consumables cabinets manage screws, nuts, bolts, washers, rivets and small parts with automated pickup records, so the right component is always within reach of the line.',
      'By tracking every issue, you gain visibility into consumption, reduce line-side clutter and stop production from stopping on a missing bolt.',
    ],
    benefits: [
      { title: 'Automated pickup', text: 'Carousels and drawers record every fastener issued by employee and job.' },
      { title: 'Stock visibility', text: 'See real-time consumption by line, shift or work order.' },
      { title: 'Less downtime', text: 'Point-of-use storage keeps small parts off the critical path.' },
    ],
  },
  {
    slug: 'documents-archives',
    name: { en: 'Document & Archive Management Cabinets', zh: '', ar: '' },
    metaTitle: 'Document & Archive Management Cabinets | Qtech',
    intro: [
      'Document and archive cabinets protect files, drawings, contracts and work orders with secure access, numbered locations and audit trails.',
      'Authorized pickup and return records mean sensitive paperwork is never lost, and every document can be traced to the person who holds it.',
    ],
    benefits: [
      { title: 'Secure access', text: 'Permission-based pickup for drawings, contracts and records.' },
      { title: 'Numbered locations', text: 'Every pocket is mapped so documents are easy to find and file.' },
      { title: 'Audit trails', text: 'Full pickup and return history for compliance and traceability.' },
    ],
  },
  {
    slug: 'employee-personal-storage',
    name: { en: 'Employee Personal Storage Lockers', zh: '', ar: '' },
    metaTitle: 'Employee Personal Storage Lockers | Qtech',
    intro: [
      'Employee personal storage lockers provide secure compartments for bags, uniforms, devices and personal items in factories or offices.',
      'Card, PIN or face-recognition access gives every worker a private space while giving facilities managers a clear record of locker usage.',
    ],
    benefits: [
      { title: 'Private & secure', text: 'Individual compartments protect personal belongings during shifts.' },
      { title: 'Flexible access', text: 'Card, PIN or face recognition to match your site policy.' },
      { title: 'Clean floor', text: 'Move personal items off the production floor and into managed lockers.' },
    ],
  },
  {
    slug: 'reusable-tools-assets',
    name: { en: 'Reusable Tools & Asset Tracking', zh: '', ar: '' },
    metaTitle: 'Reusable Tools & Asset Tracking | Qtech',
    intro: [
      'Reusable tools and asset cabinets track gauges, fixtures, hand tools and shared equipment through issue, return and location records.',
      'Knowing where every shared asset is — and who has it — reduces loss, shortens search time and improves planned maintenance.',
    ],
    benefits: [
      { title: 'Location tracking', text: 'See exactly which locker holds each gauge or fixture.' },
      { title: 'Issue & return', text: 'Log every handoff so assets are never silently lost.' },
      { title: 'Loss reduction', text: 'Accountability cuts missing tools and duplicate purchases.' },
    ],
  },
  {
    slug: 'office-supplies',
    name: { en: 'Office Supplies Vending Lockers', zh: '', ar: '' },
    metaTitle: 'Office Supplies Vending Lockers | Qtech',
    intro: [
      'Office supplies cabinets manage stationery, printer toner, labels, chargers and shared office consumables with permission control.',
      'Self-service pickup keeps administration running while giving facilities a clear view of consumption across offices and departments.',
    ],
    benefits: [
      { title: 'Permission control', text: 'Limit access by department or role to avoid misuse.' },
      { title: 'Self-service', text: 'Staff grab what they need without a storeroom attendant.' },
      { title: 'Usage insight', text: 'Track toner, labels and chargers by team for smarter ordering.' },
    ],
  },
  {
    slug: 'food-pickup-meal-collection',
    name: { en: 'Food Pickup & Meal Collection Lockers', zh: '', ar: '' },
    metaTitle: 'Food Pickup & Meal Collection Lockers | Qtech',
    intro: [
      'Food pickup and meal collection lockers support offices, campuses and canteens with QR pickup, heating, cooling and secure compartments.',
      'Employees collect meals on their schedule while the kitchen manages deliveries through a contactless, theft-resistant locker system.',
    ],
    benefits: [
      { title: 'QR pickup', text: 'Contactless collection by scan, no cashier required.' },
      { title: 'Heating & cooling', text: 'Optional warmed or refrigerated compartments keep meals fresh.' },
      { title: 'Secure compartments', text: 'Assigned lockers prevent mix-ups and loss.' },
    ],
  },
  {
    slug: 'chemical-liquid-management',
    name: { en: 'Chemical & Liquid Management Cabinets', zh: '', ar: '' },
    metaTitle: 'Chemical & Liquid Management Cabinets | Qtech',
    intro: [
      'Chemical liquid management cabinets control reagents, samples and bottles with refrigerated storage, permissions and full pickup records.',
      'Cooling options and audited access help labs and factories store controlled liquids safely while meeting traceability requirements.',
    ],
    benefits: [
      { title: 'Refrigerated storage', text: 'Keep reagents and samples at the right temperature.' },
      { title: 'Permission control', text: 'Restrict hazardous liquids to trained staff only.' },
      { title: 'Full records', text: 'Every bottle issue and return is logged for audit.' },
    ],
  },
  {
    slug: 'grinding-wheels-abrasive-discs',
    name: { en: 'Grinding Wheel & Abrasive Disc Storage', zh: '', ar: '' },
    metaTitle: 'Grinding Wheel & Abrasive Disc Storage | Qtech',
    intro: [
      'Grinding wheel storage cabinets manage abrasive discs, cut-off wheels and PPE with sealed compartments and humidity control options.',
      'Dry, controlled storage protects brittle abrasives from damage and keeps safety gear close to the workstation.',
    ],
    benefits: [
      { title: 'Sealed compartments', text: 'Protect abrasive discs from chips, moisture and impact.' },
      { title: 'Humidity control', text: 'Optional dehumidification preserves wheel integrity.' },
      { title: 'Worksite PPE', text: 'Store grinding PPE alongside discs for a ready-to-work station.' },
    ],
  },
];

export const managedItemMap: Record<string, LandingContent> = Object.fromEntries(
  managedItems.map((item) => [item.slug, item]),
);
