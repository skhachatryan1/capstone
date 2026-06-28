import { describe, it, expect } from 'vitest';
import jwtAccess from '../../src/services/jwt_Access.service.js';

describe('JWTAccess', () => {
  it('creates a non-empty token string', () => {
    const token = jwtAccess.create(1);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('has three dot-separated parts (JWT format)', () => {
    const token = jwtAccess.create(1);
    expect(token.split('.').length).toBe(3);
  });

  it('verifies a valid token and returns the correct userId', () => {
    const token = jwtAccess.create(42);
    const decoded = jwtAccess.verify(token);
    expect(decoded.userId).toBe(42);
  });

  it('throws on a completely invalid token', () => {
    expect(() => jwtAccess.verify('not.a.token')).toThrow();
  });

  it('throws on a tampered token', () => {
    const token = jwtAccess.create(1);
    const [h, p, s] = token.split('.');
    expect(() => jwtAccess.verify(`${h}.${p}.tamperedSignature`)).toThrow();
  });

  it('tokens for different user ids are different', () => {
    expect(jwtAccess.create(1)).not.toBe(jwtAccess.create(2));
  });
});
