import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useScopedTranslation } from './useScopedTranslation';

const mocks = vi.hoisted(() => ({
  hasResourceBundle: vi.fn(),
  translation: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: () => ({ initiativeId: 'bonus-elettrodomestici-2025' }),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mocks.translation,
  }),
}));

vi.mock('../locale', () => ({
  DEFAULT_LANG: 'it',
  i18n: {
    hasResourceBundle: mocks.hasResourceBundle,
  },
}));

vi.mock('../utils/constants', () => ({
  BONUS_ELETTRODOMESTICI_2025: 'bonus-elettrodomestici-2025',
  BONUS_DECODER_2026: 'bonus-decoder-2026',
}));

describe('useScopedTranslation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.translation.mockImplementation((key: string) => `translated_${key}`);
  });

  it('uses initiative copy and config namespaces when resource bundles exist', () => {
    mocks.hasResourceBundle.mockReturnValue(true);

    const { result } = renderHook(() => useScopedTranslation());

    result.current.t('page.title');
    result.current.config('page.options');

    expect(mocks.translation).toHaveBeenNthCalledWith(1, 'page.title', {
      ns: 'bonusElettrodomestici2025/copy',
    });
    expect(mocks.translation).toHaveBeenNthCalledWith(2, 'page.options', {
      ns: 'bonusElettrodomestici2025/config',
      returnObjects: true,
    });
  });

  it('falls back to default namespaces when initiative bundles do not exist', () => {
    mocks.hasResourceBundle.mockReturnValue(false);

    const { result } = renderHook(() => useScopedTranslation());

    result.current.t('page.title');
    result.current.config('page.options');

    expect(mocks.translation).toHaveBeenNthCalledWith(1, 'page.title', {
      ns: 'default/copy',
    });
    expect(mocks.translation).toHaveBeenNthCalledWith(2, 'page.options', {
      ns: 'default/config',
      returnObjects: true,
    });
  });

  it('uses common namespaces for commons keys directly', () => {
    mocks.hasResourceBundle.mockReturnValue(true);

    const { result } = renderHook(() => useScopedTranslation());

    result.current.t('commons.status');
    result.current.config('commons.status');

    expect(mocks.translation).toHaveBeenNthCalledWith(1, 'commons.status', {
      ns: 'common',
    });
    expect(mocks.translation).toHaveBeenNthCalledWith(2, 'commons.status', {
      ns: 'config',
      returnObjects: true,
    });
  });

  it('falls back to common namespace if specific translation is missing', () => {
    mocks.hasResourceBundle.mockReturnValue(true);
    
    mocks.translation.mockImplementation((key: string) => key); 

    const { result } = renderHook(() => useScopedTranslation());

    result.current.t('missing.key');
    expect(mocks.translation).toHaveBeenNthCalledWith(1, 'missing.key', {
      ns: 'bonusElettrodomestici2025/copy',
    });
    expect(mocks.translation).toHaveBeenNthCalledWith(2, 'missing.key', {
      ns: 'common',
    });
  });
});