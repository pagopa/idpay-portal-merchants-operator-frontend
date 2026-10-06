import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import PrivacyPolicy from './PrivacyPolicy';
import { useOneTrustNotice } from '../../hooks/useOneTrustNotice';

vi.mock('../../hooks/useOneTrustNotice', () => ({
  useOneTrustNotice: vi.fn(),
}));

vi.mock('../../hooks/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => (key === 'pages.tos.backHome' ? 'Torna alla home' : key),
  }),
}));

describe('PrivacyPolicy component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv(
      'VITE_ONE_TRUST_PRIVACY_POLICY_JSON_URL',
      'https://privacyportalde-cdn.onetrust.com/storage-container/test/privacy-notice.json'
    );
  });

  test('renders the OneTrust notice container and back link', () => {
    render(<PrivacyPolicy />);

    const notice = document.querySelector('.otnotice');
    const backHomeLink = screen.getByRole('link', { name: 'commons.pages.tos.backHome' });

    expect(notice).toBeTruthy();
    expect(notice?.classList.contains('otnotice')).toBe(true);
    expect(backHomeLink.getAttribute('href')).toBe('/');
  });

  test('initializes the OneTrust notice with the configured URL and route prefix', () => {
    render(<PrivacyPolicy />);

    expect(useOneTrustNotice).toHaveBeenCalledWith(
      expect.stringContaining('/storage-container/'),
      false,
      expect.any(Function),
      '/privacy-policy'
    );
  });
});
