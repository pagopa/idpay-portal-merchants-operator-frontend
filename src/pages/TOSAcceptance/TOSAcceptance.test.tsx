import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TOSAcceptance from './TOSAcceptance';
import { BASE_ROUTE } from '../../utils/constants';

vi.mock('../../hooks/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../../components/Header/Header', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('../../components/Footer/CustomFooter', () => ({
  CustomFooter: () => <div data-testid="mock-footer">Footer</div>,
}));

vi.mock('@pagopa/mui-italia', () => ({
  TOSAgreement: ({ productName, description, onConfirm }: any) => (
    <div data-testid="mock-tos-agreement">
      <h1>{productName}</h1>
      <div>{description}</div>
      <button data-testid="confirm-button" onClick={onConfirm}>
        Confirm
      </button>
    </div>
  ),
}));

describe('TOSAcceptance Component', () => {
  const mockAcceptTOS = vi.fn();
  const defaultProps = {
    acceptTOS: mockAcceptTOS,
    tosRoute: '/tos',
    privacyRoute: '/privacy',
    firstAcceptance: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Header, CustomFooter, and TOSAgreement layout', () => {
    render(<TOSAcceptance {...defaultProps} />);

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getByTestId('mock-tos-agreement')).toBeInTheDocument();
    expect(screen.getByText('commons.pages.tos.title', { exact: false })).toBeInTheDocument();
  });

  it('renders content for initial acceptance', () => {
    render(<TOSAcceptance {...defaultProps} firstAcceptance={true} />);

    expect(screen.getByText('commons.pages.tos.termsDescription', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('commons.pages.tos.termsDescription2', { exact: false })).toBeInTheDocument();

    const tosLink = screen.getByRole('link', { name: 'commons.pages.tos.linkTos' });
    expect(tosLink).toBeInTheDocument();
    expect(tosLink).toHaveAttribute('href', BASE_ROUTE + defaultProps.tosRoute);
    expect(tosLink).toHaveAttribute('target', '_blank');

    const privacyLink = screen.getByRole('link', { name: 'commons.pages.tos.linkPrivacy' });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', BASE_ROUTE + defaultProps.privacyRoute);
    expect(privacyLink).toHaveAttribute('target', '_blank');
  });

  it('renders content when terms have changed', () => {
    render(<TOSAcceptance {...defaultProps} firstAcceptance={false} />);

    expect(screen.getByText('commons.pages.tos.termsDescriptionChanged', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('commons.pages.tos.and', { exact: false })).toBeInTheDocument();

    const tosLink = screen.getByRole('link', { name: 'commons.pages.tos.linkTos' });
    expect(tosLink).toHaveAttribute('href', BASE_ROUTE + defaultProps.tosRoute);

    const privacyLink = screen.getByRole('link', { name: 'commons.pages.tos.linkPrivacy' });
    expect(privacyLink).toHaveAttribute('href', BASE_ROUTE + defaultProps.privacyRoute);
  });

  it('calls acceptTOS callback when confirmation button is clicked', async () => {
    const user = userEvent.setup();
    render(<TOSAcceptance {...defaultProps} />);

    const confirmButton = screen.getByTestId('confirm-button');
    await user.click(confirmButton);

    expect(mockAcceptTOS).toHaveBeenCalledTimes(1);
  });
});