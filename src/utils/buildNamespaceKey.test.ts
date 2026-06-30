import { describe, expect, it } from 'vitest';
import { buildNamespaceKey } from './buildNamespaceKey';

describe('buildNamespaceKey', () => {
  it('builds a camelCase namespace key with the start year', () => {
    expect(buildNamespaceKey('Bonus Elettrodomestici', '2025-09-01')).toBe(
      'bonusElettrodomestici2025'
    );
  });

  it('normalizes punctuation and numbers in the initiative name', () => {
    expect(buildNamespaceKey('Bonus Decoder 2026!', '2026-01-15')).toBe(
      'bonusDecoder20262026'
    );
  });

  it('returns an empty key when name or date is missing', () => {
    expect(buildNamespaceKey('', '2026-01-15')).toBe('');
    expect(buildNamespaceKey('Bonus Decoder', '')).toBe('');
  });

  it('returns an empty key when the name has no supported words', () => {
    expect(buildNamespaceKey('!!!', '2026-01-15')).toBe('');
  });
});
