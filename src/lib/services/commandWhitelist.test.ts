import { describe, it, expect } from 'vitest';
import {
  validateAction,
  ALLOWED_ACTIONS,
  DOMAIN_RE,
  EMAIL_RE,
  PORT_MIN,
  PORT_MAX,
} from './commandWhitelist';

describe('commandWhitelist — security contract (V8 T5 / Q2)', () => {
  it('exposes exactly the white-listed actions (incl. certificate management)', () => {
    expect([...ALLOWED_ACTIONS].sort()).toEqual(
      [
        'reload-nginx',
        'renew-ssl',
        'restore-default-config',
        'restart-app',
        'update-nginx-config',
        'list-certificates',
        'renew-cert',
        'apply-cert',
        'upload-cert',
      ].sort()
    );
  });

  it('accepts every allowed action with no params', () => {
    // Only param-free actions are expected to pass with no params.
    // (update-nginx-config / renew-cert / apply-cert / upload-cert require
    //  domain/email and are validated separately below.)
    const NO_PARAM_ACTIONS = new Set([
      'restart-app',
      'reload-nginx',
      'renew-ssl',
      'restore-default-config',
      'list-certificates',
    ]);
    for (const action of ALLOWED_ACTIONS) {
      if (!NO_PARAM_ACTIONS.has(action)) continue;
      expect(validateAction(action).ok, `action ${action} should be allowed`).toBe(true);
    }
  });

  it('rejects any action not in the white-list', () => {
    const res = validateAction('rm -rf /');
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/Unknown or disallowed action/i);
  });

  it('rejects unknown parameter keys (defence in depth)', () => {
    const res = validateAction('restart-app', { evil: 'value' });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/Unexpected parameter/i);
  });

  it('rejects an invalid domain supplied to any action', () => {
    const res = validateAction('restart-app', { domain: 'not a domain!!' });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/Invalid domain/i);
  });

  it('rejects invalid / out-of-range ports', () => {
    expect(validateAction('reload-nginx', { port: 79 }).ok).toBe(false);
    expect(validateAction('reload-nginx', { port: 65536 }).ok).toBe(false);
    expect(validateAction('reload-nginx', { port: 'abc' }).ok).toBe(false);
    expect(validateAction('reload-nginx', { port: 3000.5 }).ok).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(validateAction('renew-ssl', { sslEmail: 'not-an-email' }).ok).toBe(false);
  });

  it('accepts valid optional params', () => {
    expect(validateAction('restart-app', { domain: 'www.example.com' }).ok).toBe(true);
    expect(validateAction('restart-app', { port: 8080 }).ok).toBe(true);
    expect(validateAction('restart-app', { sslEmail: 'a@b.com' }).ok).toBe(true);
  });

  it('requires domain+port+email for update-nginx-config', () => {
    expect(validateAction('update-nginx-config', { domain: 'www.example.com' }).ok).toBe(false);
    expect(validateAction('update-nginx-config', { domain: 'www.example.com', port: 3000 }).ok).toBe(false);
    expect(
      validateAction('update-nginx-config', { domain: 'www.example.com', port: 3000, sslEmail: 'a@b.com' }).ok
    ).toBe(true);
    expect(validateAction('update-nginx-config', { domain: 'bad', port: 3000, sslEmail: 'a@b.com' }).ok).toBe(false);
  });

  it('certificate actions validate their parameters', () => {
    // list-certificates takes no params
    expect(validateAction('list-certificates').ok).toBe(true);
    // renew-cert requires a valid domain
    expect(validateAction('renew-cert', { domain: 'www.example.com' }).ok).toBe(true);
    expect(validateAction('renew-cert', {}).ok).toBe(false);
    expect(validateAction('renew-cert', { domain: 'bad' }).ok).toBe(false);
    // apply-cert requires domain + email
    expect(validateAction('apply-cert', { domain: 'www.example.com', email: 'a@b.com' }).ok).toBe(true);
    expect(validateAction('apply-cert', { domain: 'www.example.com' }).ok).toBe(false);
    expect(validateAction('apply-cert', { domain: 'www.example.com', email: 'bad' }).ok).toBe(false);
    // upload-cert requires a valid domain (files validated in the route)
    expect(validateAction('upload-cert', { domain: 'www.example.com' }).ok).toBe(true);
    expect(validateAction('upload-cert', {}).ok).toBe(false);
  });

  it('treats empty / missing params as "not provided"', () => {
    expect(validateAction('restart-app', {}).ok).toBe(true);
    expect(validateAction('restart-app', { domain: '', port: null, sslEmail: undefined }).ok).toBe(true);
  });

  it('validates the regexes + bounds directly', () => {
    expect(DOMAIN_RE.test('example.com')).toBe(true);
    expect(DOMAIN_RE.test('sub.example.co.uk')).toBe(true);
    expect(DOMAIN_RE.test('bad_domain')).toBe(false);
    expect(DOMAIN_RE.test('example')).toBe(false);
    expect(EMAIL_RE.test('a@b.com')).toBe(true);
    expect(EMAIL_RE.test('a@b')).toBe(false);
    expect(PORT_MIN).toBe(80);
    expect(PORT_MAX).toBe(65535);
  });
});
