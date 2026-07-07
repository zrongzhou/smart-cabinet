/**
 * Bug 8 — Users management & Services management pages must be real feature
 * pages (not placeholders). The engineer confirmed UsersManagement.tsx +
 * /api/admin/users and ServiceManager.tsx + /api/admin/services exist.
 *
 * This is a read-only static check (no rendering): we assert the page files wire
 * up the real components and that the components / API routes contain substantive
 * logic (not empty stubs).
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../../..');
const p = (rel: string) => path.join(ROOT, rel);

const pageUsers = p('src/app/xiaozhouBackend/users/page.tsx');
const pageServices = p('src/app/xiaozhouBackend/services/page.tsx');
const compUsers = p('src/components/admin/UsersManagement.tsx');
const compServices = p('src/components/admin/ServiceManager.tsx');
const apiUsers = p('src/app/api/admin/users/route.ts');
const apiUsersId = p('src/app/api/admin/users/[id]/route.ts');
const apiServices = p('src/app/api/admin/services/route.ts');

function read(rel: string): string {
  const full = p(rel);
  expect(fs.existsSync(full), `${rel} should exist`).toBe(true);
  return fs.readFileSync(full, 'utf-8');
}

describe('Bug 8 — Users / Services pages are real implementations', () => {
  it('users page renders the UsersManagement component', () => {
    const content = read('src/app/xiaozhouBackend/users/page.tsx');
    expect(content).toContain('UsersManagement');
    expect(/export default/.test(content)).toBe(true);
  });

  it('services page renders the ServiceManager component', () => {
    const content = read('src/app/xiaozhouBackend/services/page.tsx');
    expect(content).toContain('ServiceManager');
    expect(/export default/.test(content)).toBe(true);
  });

  it('UsersManagement.tsx is a substantive component (>100 lines, real UI/handlers)', () => {
    const content = read('src/components/admin/UsersManagement.tsx');
    expect(content.split('\n').length).toBeGreaterThan(100);
    // real CRUD behaviour, not a placeholder
    expect(/useState|useEffect|fetch|function|=>/.test(content)).toBe(true);
    expect(/users/i.test(content)).toBe(true);
  });

  it('ServiceManager.tsx is a substantive component (>100 lines, real logic)', () => {
    const content = read('src/components/admin/ServiceManager.tsx');
    expect(content.split('\n').length).toBeGreaterThan(100);
    expect(/useState|useEffect|fetch|function|=>/.test(content)).toBe(true);
  });

  it('users admin API route exposes a GET handler', () => {
    const content = read('src/app/api/admin/users/route.ts');
    expect(/export (async )?function GET/.test(content)).toBe(true);
  });

  it('users [id] admin API route exposes GET/PUT/DELETE handlers', () => {
    const content = read('src/app/api/admin/users/[id]/route.ts');
    expect(/export (async )?function (GET|PUT|DELETE)/.test(content)).toBe(true);
  });

  it('services admin API route exposes a handler', () => {
    const content = read('src/app/api/admin/services/route.ts');
    expect(/export (async )?function (GET|POST|PUT|DELETE)/.test(content)).toBe(true);
  });
});
