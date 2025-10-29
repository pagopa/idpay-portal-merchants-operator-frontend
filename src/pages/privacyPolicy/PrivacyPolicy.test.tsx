import { describe, vi } from "vitest";
import { fireEvent, render, screen } from '@testing-library/react';
import PrivacyPolicy from './PrivacyPolicy';

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../../hooks/useOneTrustNotice');
vi.mock('../../components/OneTrustContentWrapper', () => (props: { idSelector: string }) => (
  <div data-testid="onetrust-wrapper" data-idselector={props.idSelector} />
));

vi.mock('../../../utils/env', () => ({
  ENV: {
    ONE_TRUST: {
      PRIVACY_POLICY_JSON_URL: 'mock-privacy-policy-url',
      PRIVACY_POLICY_ID: 'mock-privacy-policy-id',
    },
  },
}));

vi.mock('../../../routes', () => ({
  PRIVACY_POLICY: '/mock-privacy-route',
}));

describe('PrivacyPolicy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render component and navigate back', () => {
    render(<PrivacyPolicy />);

    const backButton = screen.getByTestId('back-stores-button');

    fireEvent.click(backButton);
  });
});
