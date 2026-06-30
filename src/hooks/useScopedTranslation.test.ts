import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useScopedTranslation } from './useScopedTranslation';

const mocks = vi.hoisted(() => ({
  currentInitiative: {
    initiativeId: 'initiative-1',
    initiativeName: 'Bonus Elettrodomestici',
    startDate: '2025-09-01',
  },
  hasResourceBundle: vi.fn(),
  translation: vi.fn((key: string) => key),
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ initiativeId: 'initiative-1' }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mocks.translation,
  }),
}));

vi.mock('../redux/hooks', () => ({
  useAppSelector: () => mocks.currentInitiative,
}));

vi.mock('../locale', () => ({
  DEFAULT_LANG: 'it',
  i18n: {
    hasResourceBundle: mocks.hasResourceBundle,
  },
}));

describe('useScopedTranslation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.currentInitiative = {
      initiativeId: 'initiative-1',
      initiativeName: 'Bonus Elettrodomestici',
      startDate: '2025-09-01',
    };
    mocks.translation.mockImplementation((key: string) => key);
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

  it('uses common namespaces for commons keys', () => {
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
});
