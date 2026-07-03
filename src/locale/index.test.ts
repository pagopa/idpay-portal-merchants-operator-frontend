import { describe, it, expect, vi, beforeEach } from 'vitest';
import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import { DEFAULT_LANG, initI18n } from '.';

vi.mock('@pagopa/selfcare-common-frontend/lib/locale/locale-utils', () => {
  const i18nMock = {
    use: vi.fn().mockReturnThis(),
    init: vi.fn().mockResolvedValue(undefined), 
    addResourceBundle: vi.fn(),
  };
  return { default: i18nMock };
});

vi.mock('react-i18next', () => ({
  initReactI18next: 'mock-initReactI18next',
  useTranslation: vi.fn(),
}));

vi.mock('./it/common.json', () => ({ default: { commonKey: 'val' } }));
vi.mock('./it/config.json', () => ({ default: { configKey: 'val' } }));
vi.mock('./it/default/copy.json', () => ({ default: { defaultCopy: 'val' } }));
vi.mock('./it/default/config.json', () => ({ default: { defaultConfig: 'val' } }));

vi.mock('./it/bonusElettrodomestici2025/copy.json', () => ({ default: { bonusElettrodomestici2025Copy: 'test' } }));
vi.mock('./it/bonusElettrodomestici2025/config.json', () => ({ default: { bonusElettrodomestici2025Config: 'test' } }));

describe('initI18n', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call i18n.use and i18n.init', async () => {
    const namespaces = ['bonusElettrodomestici2025'];

    await initI18n(namespaces);

    expect(i18n.use).toHaveBeenCalledWith('mock-initReactI18next');
    
    expect(i18n.init).toHaveBeenCalledWith(
      expect.objectContaining({
        lng: DEFAULT_LANG,
        fallbackLng: DEFAULT_LANG,
        defaultNS: 'common',
        ns: ['bonusElettrodomestici2025/copy', 'bonusElettrodomestici2025/config'], 
        fallbackNS: 'default',
        interpolation: { escapeValue: false },
        react: { useSuspense: false }
      })
    );
  });

  it('should dynamically import namespaces', async () => {
    const namespaces = ['bonusElettrodomestici2025'];

    await initI18n(namespaces);

    expect(i18n.addResourceBundle).toHaveBeenCalledTimes(2);

    expect(i18n.addResourceBundle).toHaveBeenCalledWith(
      DEFAULT_LANG,
      'bonusElettrodomestici2025/copy',
      { bonusElettrodomestici2025Copy: 'test' },
      true,
      true
    );

    expect(i18n.addResourceBundle).toHaveBeenCalledWith(
      DEFAULT_LANG,
      'bonusElettrodomestici2025/config',
      { bonusElettrodomestici2025Config: 'test' },
      true,
      true
    );
  });

  it('should handle empty array', async () => {
    await initI18n([]);

    expect(i18n.init).toHaveBeenCalledWith(
      expect.objectContaining({
        ns: [],
      })
    );
    expect(i18n.addResourceBundle).not.toHaveBeenCalled();
  });
});