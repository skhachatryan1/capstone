import { describe, it, expect } from 'vitest';
import hashService from '../../src/services/hash.service.js';

describe('HashService', () => {
  const password = 'MyPassword#1';

  it('produces a hash that differs from the original', async () => {
    const hash = await hashService.hash(password);
    expect(hash).not.toBe(password);
  });

  it('produces a bcrypt hash (starts with $2)', async () => {
    const hash = await hashService.hash(password);
    expect(hash.startsWith('$2')).toBe(true);
  });

  it('returns true when comparing a correct password to its hash', async () => {
    const hash = await hashService.hash(password);
    expect(await hashService.compare(password, hash)).toBe(true);
  });

  it('returns false when comparing a wrong password', async () => {
    const hash = await hashService.hash(password);
    expect(await hashService.compare('WrongPass#1', hash)).toBe(false);
  });

  it('two hashes of the same password are different (unique salts)', async () => {
    const h1 = await hashService.hash(password);
    const h2 = await hashService.hash(password);
    expect(h1).not.toBe(h2);
  });
});
