import { describe, it, expect } from 'vitest';

describe('Example Test Suite', () => {
  it('should pass - basic math', () => {
    expect(1 + 1).toBe(2);
  });

  it('should pass - string operations', () => {
    expect('hello' + ' ' + 'world').toBe('hello world');
  });

  it('should pass - array operations', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });
});
