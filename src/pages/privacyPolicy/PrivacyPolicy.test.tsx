import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import PrivacyPolicy from './PrivacyPolicy'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../../components/privacyAndTosLayout/PrivacyAndTosLayout', () => ({
  PrivacyAndTosLayout: ({ title }: { title: string }) => (
    <div data-testid="mock-layout">{title}</div>
  ),
}));

describe('PrivacyPolicy component', () => {
  test('should render component correctly', () => {
    render(<PrivacyPolicy />);
    
    expect(screen.getByTestId('mock-layout')).toBeInTheDocument();
    
    expect(screen.getByText('pages.privacyPolicyStatic.title')).toBeInTheDocument();
  });
});