import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import TOS from './TOS';
import { useOneTrustNotice } from '../../hooks/useOneTrustNotice';

vi.mock('../../hooks/useOneTrustNotice', () => ({
  useOneTrustNotice: vi.fn(),
}));

vi.mock('../../hooks/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => (key === 'pages.tos.backHome' ? 'Torna alla home' : key),
  }),
}));

describe('TOS component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv(
      'VITE_ONE_TRUST_TOS_JSON_URL',
      'https://privacyportalde-cdn.onetrust.com/storage-container/test/privacy-notice.json'
    );
  });

  test('renders the OneTrust notice container and back link', () => {
    render(<TOS />);

    const notice = document.getElementById(
      'otnotice-cadd2394-571d-42e0-90bd-8b0521ba33f7'
    );
    const backHomeLink = screen.getByRole('link', { name: 'Torna alla home' });

    expect(notice).toBeTruthy();
    expect(notice?.classList.contains('otnotice')).toBe(true);
    expect(backHomeLink.getAttribute('href')).toBe('/');
  });

  test('initializes the OneTrust notice with the configured URL and route prefix', () => {
    render(<TOS />);

    expect(useOneTrustNotice).toHaveBeenCalledWith(
      expect.stringContaining('/storage-container/'),
      false,
      expect.any(Function),
      '/terms-of-service'
    );
  });
});
