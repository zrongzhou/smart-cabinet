/**
 * seo-page-meta.ts
 * ----------------------------------------------------------------------------
 * Centralized, hand-crafted SEO meta descriptions sourced from the client's
 * "Meta Description Plan" spreadsheet (Meta decription.xlsx).
 *
 * The spreadsheet is English-only (per the SEO team's brief), so every entry
 * below carries an English description. `zh` / `ar` are intentionally left empty
 * so that pages fall back to the localized database content (for product / blog
 * detail) or to the English value (for the static landing pages). This keeps a
 * single source of truth for the curated English snippets while preserving the
 * existing trilingual behaviour everywhere else.
 *
 * Slugs used as keys are the REAL production slugs:
 *   - product slugs are taken verbatim from scripts/import/source/products_data.json
 *   - blog slugs are the six real `.html` blog entries in src/data/blogs.ts
 *   - managed-item / industry / landing-page slugs match the new route segments
 * ----------------------------------------------------------------------------
 */

export type AppLocale = 'en' | 'zh' | 'ar';

export interface Trilingual {
  en: string;
  zh: string;
  ar: string;
}

/**
 * Normalize an arbitrary locale string into one of the three supported locales.
 * Accepts full tags such as `zh-CN`, `ar-SA`, `en-US` as well as bare `zh`/`ar`/`en`.
 */
export function normalizeLocale(locale: string | undefined | null): AppLocale {
  const l = (locale || 'en').toLowerCase();
  if (l.startsWith('zh')) return 'zh';
  if (l.startsWith('ar')) return 'ar';
  return 'en';
}

/**
 * Pick the localized string for a given locale, falling back to English when the
 * requested locale is empty (which is the case for zh/ar in this English-only plan).
 */
export function pickTrilingual(value: Trilingual | undefined, locale: string | undefined | null): string {
  if (!value) return '';
  const loc = normalizeLocale(locale);
  return value[loc] || value.en || '';
}

/**
 * Pick a localized meta *description*, falling back gracefully when the curated
 * translation is missing (the Meta Description Plan spreadsheet is English-only,
 * so zh/ar entries are intentionally empty).
 *
 * Fallback order (N2 fix):
 *   1. the explicit zh/ar translation if present,
 *   2. a localized page title (so a zh/ar page at least shows its own title
 *      rather than raw English marketing copy),
 *   3. the English description.
 *
 * We deliberately do NOT fabricate marketing copy for missing locales — callers
 * should list such pages for a human translator (see N2 audit).
 */
export function pickTrilingualDescription(
  value: Trilingual | undefined,
  locale: string | undefined | null,
  fallbackTitle?: string,
): string {
  if (!value) return fallbackTitle || '';
  const loc = normalizeLocale(locale);
  if (value[loc]) return value[loc];
  if (loc !== 'en' && fallbackTitle && fallbackTitle.trim() && fallbackTitle.trim() !== (value.en || '').trim()) {
    return fallbackTitle.trim();
  }
  return value.en || fallbackTitle || '';
}

// ============================================================================
// Product meta descriptions
// Key = the REAL product slug (verbatim from products_data.json).
// ============================================================================
export const productMeta: Record<string, Trilingual> = {
  'cnc-tool-vending-machines.html': {
    en: 'CNC tool vending machines manage inserts, end mills, drills and taps with secure dispensing, return tracking and real-time inventory reports.',
    zh: '',
    ar: '',
  },
  'tool-vending-expansion-cabinet.html': {
    en: 'LY-DL80F tool extension cabinet expands CNC tool vending capacity and supports one-to-two, one-to-three or multi-cabinet systems.',
    zh: '',
    ar: '',
  },
  'smart-tool-locker-cabinet.html': {
    en: 'Smart tool cabinets control access to tools, molds, PPE and MRO supplies with flexible locker sizes, user permissions and usage records.',
    zh: '',
    ar: '',
  },
  'modular-industrial-vending-machine.html': {
    en: 'Modular industrial vending machines combine tool vending, smart lockers and return cabinets for scalable MRO inventory management.',
    zh: '',
    ar: '',
  },
  'smart-drawer-tool-cabinet.html': {
    en: 'Smart drawer cabinets store gauges, calipers, micrometers and precision tools with drawer access control, LED guidance and full usage logs.',
    zh: '',
    ar: '',
  },
  'weight-based-vending-cabinet.html': {
    en: 'Smart weighing cabinets use weight sensors to track screws, nuts, washers and consumables automatically after users close the cabinet door.',
    zh: '',
    ar: '',
  },
  'automated-storage-cabinet.html': {
    en: 'Automated micro warehouse cabinets use internal robotics to issue and return reusable tools or printing wheels to the correct storage position.',
    zh: '',
    ar: '',
  },
  'rfid-asset-tracking-cabinet.html': {
    en: 'RFID smart cabinets identify tagged files, tools and assets automatically, helping factories improve inventory accuracy and traceability.',
    zh: '',
    ar: '',
  },
  'applications/cnc-tool-vending-machine.html': {
    en: 'CNC tool management cabinets control inserts, end mills, drills, taps and holders with employee limits, return tracking and reports.',
    zh: '',
    ar: '',
  },
  'applications/ppe-vending-machine.html': {
    en: 'PPE vending cabinets manage gloves, masks, goggles, earplugs and safety supplies with controlled access and low-stock alerts.',
    zh: '',
    ar: '',
  },
  'applications/fastener-vending-machine.html': {
    en: 'Fastener and consumables cabinets manage screws, nuts, bolts, washers, rivets and small parts with automated pickup records.',
    zh: '',
    ar: '',
  },
  'applications/smart-file-cabinet.html': {
    en: 'Smart file cabinets secure drawings, work orders and archives with authorized pickup, return records and searchable document storage.',
    zh: '',
    ar: '',
  },
  'applications/smart-locker-system.html': {
    en: 'Employee locker cabinets provide private storage for staff belongings, uniforms and work items with card, PIN or face recognition access.',
    zh: '',
    ar: '',
  },
  'applications/tool-tracking-system.html': {
    en: 'Reusable tools and asset cabinets track gauges, fixtures, hand tools and shared equipment through issue, return and location records.',
    zh: '',
    ar: '',
  },
  'applications/office-supply-vending-machine.html': {
    en: 'Office supplies smart lockers control pens, notebooks, printer toner, chargers and shared items across offices and administration areas.',
    zh: '',
    ar: '',
  },
  'applications/food-pickup-locker.html': {
    en: 'Food pickup lockers support meal collection in office buildings with QR pickup, optional heating, cooling and multi-size compartments.',
    zh: '',
    ar: '',
  },
  'applications/chemical-storage-cabinet.html': {
    en: 'Chemical liquid management cabinets store bottles, reagents and controlled liquids with cooling options, user permissions and issue records.',
    zh: '',
    ar: '',
  },
  'solutions/cnc-machining-tool-management.html': {
    en: 'CNC machining tool management solutions control cutting tools, gauges and MRO supplies for machine shops and precision parts factories.',
    zh: '',
    ar: '',
  },
  'solutions/smart-factory-inventory-management.html': {
    en: 'Smart factory inventory management cabinets help manufacturers control MRO supplies, PPE, tools and spare parts at the point of use.',
    zh: '',
    ar: '',
  },
  'solutions/metal-fabrication-tool-management.html': {
    en: 'Metal fabrication smart cabinets manage abrasives, cutting discs, welding supplies, fasteners and PPE for high-usage workshops.',
    zh: '',
    ar: '',
  },
  'solutions/mold-shop-tool-management.html': {
    en: 'Mold and injection molding cabinets organize mold components, maintenance tools, nozzles, gauges and spare parts with traceable access.',
    zh: '',
    ar: '',
  },
  'solutions/electronics-manufacturing-inventory.html': {
    en: 'Electronics and semiconductor smart cabinets manage ESD tools, precision parts, cleanroom supplies and optical components securely.',
    zh: '',
    ar: '',
  },
  'solutions/automotive-manufacturing-inventory.html': {
    en: 'Automotive and EV component cabinets control tools, fasteners, PPE and line-side MRO supplies for assembly, machining and maintenance.',
    zh: '',
    ar: '',
  },
  'solutions/medical-device-manufacturing-supplies.html': {
    en: 'Medical device smart cabinets manage controlled tools, samples, PPE and production supplies with permissions, traceability and audit logs.',
    zh: '',
    ar: '',
  },
  'solutions/materials-manufacturing-inventory.html': {
    en: 'New materials and cable factories use smart cabinets to manage consumables, test tools, spare parts and production supplies.',
    zh: '',
    ar: '',
  },
  'solutions/custom-industrial-vending-machine.html': {
    en: 'Custom smart cabinet solutions for CNC tools, PPE, documents, liquids and MRO supplies. Tailor size, access control, software and workflow.',
    zh: '',
    ar: '',
  },
};

// ============================================================================
// Blog meta descriptions
// Key = the REAL blog slug (the six `.html` entries in src/data/blogs.ts).
// ============================================================================
export const blogMeta: Record<string, Trilingual> = {
  'ppe-vending-machine-safety-supplies-management.html': {
    en: 'Learn how PPE vending machines reduce safety supply waste, prevent shortages and improve accountability in construction and factories.',
    zh: '',
    ar: '',
  },
  'cutting-tool-distributors-tool-vending-machine.html': {
    en: 'See how cutting tool distributors use CNC tool vending machines to lock in customers, improve replenishment and grow repeat sales.',
    zh: '',
    ar: '',
  },
  'tool-vending-machine-functions-cnc-workshop.html': {
    en: 'Explore tool vending machine functions such as issue limits, old-for-new exchange, used tool return and tool life statistics.',
    zh: '',
    ar: '',
  },
  'manual-tool-crib-to-smart-tool-cabinet.html': {
    en: 'Compare manual tool crib management with smart tool cabinets and see how factories reduce waste, downtime and hidden inventory costs.',
    zh: '',
    ar: '',
  },
  'industrial-vending-machine-trends-2026.html': {
    en: 'Discover 2026 industrial vending machine trends, from RFID tool tracking to cloud inventory and smarter MRO replenishment for factories.',
    zh: '',
    ar: '',
  },
  'cnc-tool-inventory-management-guide.html': {
    en: 'A practical guide to CNC tool inventory management: organize inserts, end mills and drills, track usage and cut tooling waste.',
    zh: '',
    ar: '',
  },
  'how-to-choose-cnc-tool-vending-machine.html': {
    en: 'A practical guide to choosing a CNC tool vending machine by tool type, capacity, access method, software and workshop layout.',
    zh: '',
    ar: '',
  },
  'tool-vending-machine-roi-guide.html': {
    en: 'Calculate tool vending machine ROI by tracking tool consumption, stockouts, manual labor, regrinding returns and inventory savings.',
    zh: '',
    ar: '',
  },
  'mro-inventory-management-best-practices.html': {
    en: 'Use MRO inventory management best practices to control spare parts, PPE, tools and consumables with smart cabinets and reports.',
    zh: '',
    ar: '',
  },
  'grinding-wheel-storage-ppe-management.html': {
    en: 'Learn why grinding wheel storage needs dry, controlled cabinets and how PPE vending improves abrasive disc use in fabrication shops.',
    zh: '',
    ar: '',
  },
  'smart-locker-cabinet-vs-tool-room.html': {
    en: 'Compare smart locker cabinets with traditional tool rooms for speed, accountability, inventory visibility and 24/7 material access.',
    zh: '',
    ar: '',
  },
  'smart-cabinet-erp-mes-sap-integration.html': {
    en: 'See how smart cabinets connect with ERP, MES and SAP systems to share inventory data, employee usage records and replenishment reports.',
    zh: '',
    ar: '',
  },
};

// ============================================================================
// Managed-item landing page meta descriptions
// Key = the route slug under /managed-items/.
// ============================================================================
export const managedItemMeta: Record<string, Trilingual> = {
  'cnc-tool-management': {
    en: 'CNC tool management cabinets control inserts, end mills, drills, taps and holders with employee limits, return tracking and reports.',
    zh: '',
    ar: '',
  },
  'ppe-safety-supplies': {
    en: 'PPE inventory management cabinets track gloves, masks, goggles, respirators and safety gear to reduce waste and prevent stockouts.',
    zh: '',
    ar: '',
  },
  'fasteners-consumables': {
    en: 'Fastener and consumables cabinets manage screws, nuts, bolts, washers, rivets and small parts with automated pickup records.',
    zh: '',
    ar: '',
  },
  'documents-archives': {
    en: 'Document and archive cabinets protect files, drawings, contracts and work orders with secure access, numbered locations and audit trails.',
    zh: '',
    ar: '',
  },
  'employee-personal-storage': {
    en: 'Employee personal storage lockers provide secure compartments for bags, uniforms, devices and personal items in factories or offices.',
    zh: '',
    ar: '',
  },
  'reusable-tools-assets': {
    en: 'Reusable tools and asset cabinets track gauges, fixtures, hand tools and shared equipment through issue, return and location records.',
    zh: '',
    ar: '',
  },
  'office-supplies': {
    en: 'Office supplies cabinets manage stationery, printer toner, labels, chargers and shared office consumables with permission control.',
    zh: '',
    ar: '',
  },
  'food-pickup-meal-collection': {
    en: 'Food pickup and meal collection lockers support offices, campuses and canteens with QR pickup, heating, cooling and secure compartments.',
    zh: '',
    ar: '',
  },
  'chemical-liquid-management': {
    en: 'Chemical liquid management cabinets control reagents, samples and bottles with refrigerated storage, permissions and full pickup records.',
    zh: '',
    ar: '',
  },
  'grinding-wheels-abrasive-discs': {
    en: 'Grinding wheel storage cabinets manage abrasive discs, cut-off wheels and PPE with sealed compartments and humidity control options.',
    zh: '',
    ar: '',
  },
};

// ============================================================================
// Industry landing page meta descriptions
// Key = the route slug under /industries/.
// ============================================================================
export const industryMeta: Record<string, Trilingual> = {
  'cnc-machining-precision-parts': {
    en: 'CNC machining tool management solutions control cutting tools, gauges and MRO supplies for machine shops and precision parts factories.',
    zh: '',
    ar: '',
  },
  'general-manufacturing-smart-factory': {
    en: 'Smart factory inventory management cabinets help manufacturers control MRO supplies, PPE, tools and spare parts at the point of use.',
    zh: '',
    ar: '',
  },
  'metal-fabrication-aluminum-processing': {
    en: 'Metal fabrication smart cabinets manage abrasives, cutting discs, welding supplies, fasteners and PPE for high-usage workshops.',
    zh: '',
    ar: '',
  },
  'mold-injection-molding-tooling': {
    en: 'Mold and injection molding cabinets organize mold components, maintenance tools, nozzles, gauges and spare parts with traceable access.',
    zh: '',
    ar: '',
  },
  'electronics-semiconductor-manufacturing': {
    en: 'Electronics and semiconductor smart cabinets manage ESD tools, precision parts, cleanroom supplies and optical components securely.',
    zh: '',
    ar: '',
  },
  'automotive-ev-components': {
    en: 'Automotive and EV component cabinets control tools, fasteners, PPE and line-side MRO supplies for assembly, machining and maintenance.',
    zh: '',
    ar: '',
  },
  'medical-device-life-science-equipment': {
    en: 'Medical device smart cabinets manage controlled tools, samples, PPE and production supplies with permissions, traceability and audit logs.',
    zh: '',
    ar: '',
  },
  'new-materials-cable-functional-materials': {
    en: 'New materials and cable factories use smart cabinets to manage consumables, test tools, spare parts and production supplies.',
    zh: '',
    ar: '',
  },
  'aerospace-machining-tool-management': {
    en: 'Aerospace machining smart cabinets support secure tool issue, work order material pickup and local data modes for controlled workshops.',
    zh: '',
    ar: '',
  },
  'construction-ppe-management': {
    en: 'Construction PPE management lockers control helmets, gloves, safety glasses, respirators and worksite supplies with user records.',
    zh: '',
    ar: '',
  },
};

// ============================================================================
// Standalone landing page meta descriptions (3 core "Custom / Factory / Shipping")
// Key = the route segment under /[locale]/.
// ============================================================================
export const landingPageMeta: Record<string, Trilingual> = {
  'custom-smart-cabinet': {
    en: 'Custom smart cabinet solutions for CNC tools, PPE, documents, liquids and MRO supplies. Tailor size, access control, software and workflow.',
    zh: '',
    ar: '',
  },
  'factory-display': {
    en: 'View our smart cabinet factory, production workshop and quality process for CNC tool vending machines, PPE cabinets and industrial lockers.',
    zh: '',
    ar: '',
  },
  'shipping-delivery': {
    en: 'Learn about wooden box packaging and delivery options for smart cabinets, CNC tool vending machines and industrial vending systems.',
    zh: '',
    ar: '',
  },
};
