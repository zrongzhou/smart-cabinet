'use client';

/**
 * JsonLd Component - Renders JSON-LD structured data in <script type="application/ld+json">
 *
 * Usage:
 *   <JsonLd data={jsonLdOrganization()} />
 *   <JsonLd data={jsonLdProduct(product)} />
 */

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
