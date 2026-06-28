import { describe, it, expect } from 'vitest';
import helper from '../../src/lib/helper.js';

describe('helper.checkFields', () => {
  it('returns true when all required fields are present and non-empty', () => {
    expect(helper.checkFields({ name: 'Alice', age: 25 }, ['name', 'age'])).toBe(true);
  });

  it('returns false when a field is missing from the object', () => {
    expect(helper.checkFields({ name: 'Alice' }, ['name', 'age'])).toBe(false);
  });

  it('returns false when a field is an empty string', () => {
    expect(helper.checkFields({ name: '', age: 25 }, ['name', 'age'])).toBe(false);
  });

  it('returns false when a field is null', () => {
    expect(helper.checkFields({ name: null, age: 25 }, ['name', 'age'])).toBe(false);
  });

  it('returns false when a field is whitespace only', () => {
    expect(helper.checkFields({ name: '   ', age: 25 }, ['name', 'age'])).toBe(false);
  });

  it('returns true when required fields array is empty', () => {
    expect(helper.checkFields({}, [])).toBe(true);
  });

  it('returns false when a field is undefined', () => {
    expect(helper.checkFields({ name: undefined }, ['name'])).toBe(false);
  });
});
