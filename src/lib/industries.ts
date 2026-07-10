/**
 * industries.ts
 * Data for the 10 "industry" landing pages under /[locale]/industries/[slug].
 * Meta descriptions live in `industryMeta` (src/lib/seo-page-meta.ts); this file
 * owns the on-page H1 / intro / benefits content.
 */
import type { LandingContent } from '@/lib/landing-content';

export const industries: LandingContent[] = [
  {
    slug: 'cnc-machining-precision-parts',
    name: { en: 'CNC Machining & Precision Parts', zh: '', ar: '' },
    metaTitle: 'CNC Machining & Precision Parts Tool Management | WS Tool Cabinet',
    intro: [
      'CNC machining tool management solutions control cutting tools, gauges and MRO supplies for machine shops and precision parts factories.',
      'Keep expensive inserts and end mills accountable, reduce tool-room search time and give planners live data to avoid downtime.',
    ],
    benefits: [
      { title: 'Cutting tool control', text: 'Manage inserts, end mills and drills by user and job.' },
      { title: 'Gauge tracking', text: 'Protect calibrated gauges with logged issue and return.' },
      { title: 'MRO at point of use', text: 'Stage consumables where machinists actually work.' },
    ],
  },
  {
    slug: 'general-manufacturing-smart-factory',
    name: { en: 'Smart Factory & General Manufacturing', zh: '', ar: '' },
    metaTitle: 'Smart Factory Inventory Management | WS Tool Cabinet',
    intro: [
      'Smart factory inventory management cabinets help manufacturers control MRO supplies, PPE, tools and spare parts at the point of use.',
      'Connect storage to your production lines so materials are available exactly when and where they are needed, with full visibility.',
    ],
    benefits: [
      { title: 'Point-of-use control', text: 'Stage MRO, PPE and tools beside the line.' },
      { title: 'Full visibility', text: 'Live dashboards show consumption across the plant.' },
      { title: 'Waste reduction', text: 'Issue-by-need policies cut over-ordering.' },
    ],
  },
  {
    slug: 'metal-fabrication-aluminum-processing',
    name: { en: 'Metal Fabrication & Aluminum Processing', zh: '', ar: '' },
    metaTitle: 'Metal Fabrication Tool Storage | WS Tool Cabinet',
    intro: [
      'Metal fabrication smart cabinets manage abrasives, cutting discs, welding supplies, fasteners and PPE for high-usage workshops.',
      'Keep consumables and safety gear close to cutting and welding stations while logging every issue for cost control.',
    ],
    benefits: [
      { title: 'Abrasive control', text: 'Store cutting discs and wheels safely and dry.' },
      { title: 'Welding supplies', text: 'Stage consumables at the weld cell, not the storeroom.' },
      { title: 'PPE at hand', text: 'Ensure helmets and gloves are always available.' },
    ],
  },
  {
    slug: 'mold-injection-molding-tooling',
    name: { en: 'Mold & Injection Molding Tooling', zh: '', ar: '' },
    metaTitle: 'Mold & Injection Molding Tool Management | WS Tool Cabinet',
    intro: [
      'Mold and injection molding cabinets organize mold components, maintenance tools, nozzles, gauges and spare parts with traceable access.',
      'Reduce mold-change downtime by keeping the right components staged and accounted for, with a clear record of who took what.',
    ],
    benefits: [
      { title: 'Mold components', text: 'Organize nozzles, inserts and fittings by mold.' },
      { title: 'Maintenance tools', text: 'Stage torque tools and gauges for fast changeovers.' },
      { title: 'Traceable access', text: 'Every borrow is logged for accountability.' },
    ],
  },
  {
    slug: 'electronics-semiconductor-manufacturing',
    name: { en: 'Electronics & Semiconductor Manufacturing', zh: '', ar: '' },
    metaTitle: 'Electronics & Semiconductor Inventory Cabinets | WS Tool Cabinet',
    intro: [
      'Electronics and semiconductor smart cabinets manage ESD tools, precision parts, cleanroom supplies and optical components securely.',
      'Controlled, clean storage protects sensitive components and helps high-tech lines meet quality and traceability standards.',
    ],
    benefits: [
      { title: 'ESD protection', text: 'Store static-sensitive tools in grounded cabinets.' },
      { title: 'Cleanroom supplies', text: 'Keep optics and parts in controlled conditions.' },
      { title: 'Precision parts', text: 'Account for small, high-value components.' },
    ],
  },
  {
    slug: 'automotive-ev-components',
    name: { en: 'Automotive & EV Components', zh: '', ar: '' },
    metaTitle: 'Automotive & EV Component Inventory | WS Tool Cabinet',
    intro: [
      'Automotive and EV component cabinets control tools, fasteners, PPE and line-side MRO supplies for assembly, machining and maintenance.',
      'Support mixed-model lines with point-of-use storage that keeps assembly moving and gives supervisors live usage data.',
    ],
    benefits: [
      { title: 'Line-side MRO', text: 'Stage consumables where assembly happens.' },
      { title: 'Fastener control', text: 'Manage high-mix fasteners by station.' },
      { title: 'PPE compliance', text: 'Keep safety gear at every workstation.' },
    ],
  },
  {
    slug: 'medical-device-life-science-equipment',
    name: { en: 'Medical Device & Life Science Equipment', zh: '', ar: '' },
    metaTitle: 'Medical Device & Life Science Inventory | WS Tool Cabinet',
    intro: [
      'Medical device smart cabinets manage controlled tools, samples, PPE and production supplies with permissions, traceability and audit logs.',
      'Meet strict quality requirements with logged access to instruments and materials used in regulated production.',
    ],
    benefits: [
      { title: 'Permission control', text: 'Restrict instruments to qualified staff.' },
      { title: 'Traceability', text: 'Full audit logs for regulated environments.' },
      { title: 'Sample safety', text: 'Secure, tracked storage for sensitive samples.' },
    ],
  },
  {
    slug: 'new-materials-cable-functional-materials',
    name: { en: 'New Materials & Cable Manufacturing', zh: '', ar: '' },
    metaTitle: 'New Materials & Cable Manufacturing Inventory | WS Tool Cabinet',
    intro: [
      'New materials and cable factories use smart cabinets to manage consumables, test tools, spare parts and production supplies.',
      'Control high-mix materials at the line and capture usage data that helps planning and quality teams reduce waste.',
    ],
    benefits: [
      { title: 'Consumable control', text: 'Manage reels, labels and test tools by line.' },
      { title: 'Spare parts', text: 'Stage critical spares for fast recovery.' },
      { title: 'Usage data', text: 'Feed planning with real consumption signals.' },
    ],
  },
  {
    slug: 'aerospace-machining-tool-management',
    name: { en: 'Aerospace Machining Tool Management', zh: '', ar: '' },
    metaTitle: 'Aerospace Machining Tool Management | WS Tool Cabinet',
    intro: [
      'Aerospace machining smart cabinets support secure tool issue, work order material pickup and local data modes for controlled workshops.',
      'Meet aerospace traceability needs with locked, audited storage and offline-capable operation for restricted environments.',
    ],
    benefits: [
      { title: 'Secure issue', text: 'Locked, permissioned tool dispensing.' },
      { title: 'Work-order pickup', text: 'Bind materials to a job for full traceability.' },
      { title: 'Local data mode', text: 'Operate offline in controlled workshops.' },
    ],
  },
  {
    slug: 'construction-ppe-management',
    name: { en: 'Construction PPE Management', zh: '', ar: '' },
    metaTitle: 'Construction PPE Management | WS Tool Cabinet',
    intro: [
      'Construction PPE management lockers control helmets, gloves, safety glasses, respirators and worksite supplies with user records.',
      'Move PPE to the site gate with self-service lockers that log every issue, so crews stay protected and supplies stay accounted for.',
    ],
    benefits: [
      { title: 'Site PPE', text: 'Helmets, gloves and glasses at the gate.' },
      { title: 'User records', text: 'Log every issue to a worker for accountability.' },
      { title: 'Self-service', text: 'Crews grab gear without a storeroom attendant.' },
    ],
  },
];

export const industryMap: Record<string, LandingContent> = Object.fromEntries(
  industries.map((item) => [item.slug, item]),
);
