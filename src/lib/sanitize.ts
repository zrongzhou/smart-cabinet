import sanitize from 'sanitize-html';
import type { IOptions } from 'sanitize-html';

/**
 * Server/client-safe HTML sanitizer used to neutralise stored-XSS before
 * content sourced from the database (product descriptions, blog bodies, FAQ
 * blocks) is injected via `dangerouslySetInnerHTML`.
 *
 * Allow-list is intentionally tight: formatting + safe links/images only.
 * `a` links are forced to `rel="noopener noreferrer"` + `target="_blank"` to
 * prevent reverse-tabnabbing, and only http/https/mailto schemes are allowed
 * so `javascript:` URLs are dropped.
 */

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  'ul',
  'ol',
  'li',
  'a',
  'span',
  'div',
  'h1',
  'h2',
  'h3',
  'img',
  'blockquote',
];

const ALLOWED_ATTRIBUTES: IOptions['allowedAttributes'] = {
  a: ['href', 'target', 'rel', 'class'],
  img: ['src', 'alt', 'width', 'height', 'class', 'loading'],
  '*': ['class'],
};

/** Sanitize an HTML string, returning safe markup (empty string if input is not a string). */
export function sanitizeHtml(html: unknown): string {
  if (typeof html !== 'string') return '';
  return sanitize(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
      a: sanitize.simpleTransform('a', {
        rel: 'noopener noreferrer',
        target: '_blank',
      }),
    },
  });
}

export default sanitizeHtml;
