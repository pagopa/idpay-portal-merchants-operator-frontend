import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SummaryAcceptDiscount from './SummaryAcceptDiscount';
import { BrowserRouter } from 'react-router-dom';
import { authPaymentBarCode } from '../../services/merchantService';

// Mock dipendenze
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, 
  }),
}));

vi.mock('../../services/merchantService', () => ({
  authPaymentBarCode: vi.fn(),
}));

vi.mock('../../components/BreadcrumbsBox/BreadcrumbsBox', () => ({
  default: () => <div data-testid="breadcrumbs-box" />,
}));

vi.mock('../../components/errorAlert/ErrorAlert', () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="error-alert">{message}</div>
  ),
}));

const renderWithRouter = (ui: React.ReactNode) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('SummaryAcceptDiscount', () => {
  const mockData = {
    userId: 'ABCDEF12G34H567I',
    productName: 'Prodotto Test',
    trxCode: 'DISCOUNT123',
    trxDate: '2023-09-10T12:00:00Z',
    originalAmountCents: 1000,
    rewardCents: 200,
    residualAmountCents: 800,
    productGtin: 'GTIN12345',
  };

  beforeEach(() => {
    sessionStorage.setItem('discountCoupon', JSON.stringify(mockData));
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('should render breadcrumb and title', () => {
    renderWithRouter(<SummaryAcceptDiscount />);
    expect(screen.getByTestId('breadcrumbs-box')).toBeInTheDocument();
    expect(screen.getByText('pages.acceptDiscount.summary')).toBeInTheDocument();
  });

  it('should show coupon data saved in sessionStorage', () => {
    renderWithRouter(<SummaryAcceptDiscount />);
    expect(screen.getByText(mockData.userId)).toBeInTheDocument();
    expect(screen.getByText(mockData.productName)).toBeInTheDocument();
    expect(screen.getByText(mockData.trxCode)).toBeInTheDocument();
    expect(screen.getByText('10,00 €')).toBeInTheDocument();
    expect(screen.getByText('2,00 €')).toBeInTheDocument();
    expect(screen.getByText('8,00 €')).toBeInTheDocument();
  });

  it('should call authPaymentBarCode when clicking on "Authorize"', async () => {
    renderWithRouter(<SummaryAcceptDiscount />);
    const button = screen.getByRole('button', {
      name: 'pages.acceptDiscount.title',
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(authPaymentBarCode).toHaveBeenCalledWith({
        trxCode: mockData.trxCode,
        amountCents: mockData.originalAmountCents,
        additionalProperties: { productGtin: mockData.productGtin },
      });
    });
  });

  it('should show error alert when authPaymentBarCode fails', async () => {
    (authPaymentBarCode as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Errore')
    );

    renderWithRouter(<SummaryAcceptDiscount />);
    const button = screen.getByRole('button', {
      name: 'pages.acceptDiscount.title',
    });
    fireEvent.click(button);

    expect(await screen.findByTestId('alert')).toBeInTheDocument();
  });

});
