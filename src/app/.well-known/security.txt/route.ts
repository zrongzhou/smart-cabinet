/**
 * RFC 9116 security.txt
 * Served at /.well-known/security.txt
 */
export const dynamic = 'force-static';

const body = `Canonical: https://www.wstoolcabinet.com/.well-known/security.txt
Contact: mailto:1649090134@qq.com
Expires: 2027-07-24T00:00:00.000Z
Preferred-Languages: en, zh
`;

export function GET(): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
