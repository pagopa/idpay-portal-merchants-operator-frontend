import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { REQUIRED_FIELD_ERROR } from '../../utils/constants';
import ROUTES from '../../routes';
import { getProductsList, previewPayment } from '../../services/merchantService';
import { ProductDTO } from '../../api/generated/data-contracts';
import AcceptDiscount from './AcceptDiscount';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../services/merchantService', () => ({
  getProductsList: vi.fn(),
  previewPayment: vi.fn(),
}));

vi.mock('../../components/BreadcrumbsBox/BreadcrumbsBox', () => ({
  default: () => <div data-testid="BreadcrumbsBox" />,
}));

vi.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  TitleBox: () => <div data-testid="TitleBox" />,
}));

vi.mock('./AcceptDiscountCard', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../components/Modal/ModalComponent', () => ({
  default: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div data-testid="ModalComponent">{children}</div> : null,
}));

vi.mock('../../components/Autocomplete/AutocompleteComponent', () => ({
  default: ({
    onChangeDebounce,
    onChange,
    value,
  }: {
    onChangeDebounce: (v: string) => void;
    onChange: (v: ProductDTO) => void;
    value: ProductDTO | null;
  }) => (
    <input
      data-testid="Autocomplete"
      value={value?.fullProductName || ''}
      onChange={(e) => onChangeDebounce(e.target.value)}
      onBlur={() =>
        onChange({ gtinCode: '123', productName: 'Prodotto', fullProductName: 'Prodotto' })
      }
    />
  ),
}));

vi.mock('../../components/Alert/AlertComponent', () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="AlertComponent">{message}</div>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
  }),
}));

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

const mockProduct: ProductDTO = {
  gtinCode: '123',
  productName: 'Prodotto',
  fullProductName: 'Prodotto',
} as ProductDTO;

const fillForm = () => {
  fireEvent.change(screen.getByLabelText('pages.acceptDiscount.expenditureAmount'), {
    target: { value: '10' },
  });
  fireEvent.change(screen.getByLabelText('pages.acceptDiscount.discountCode'), {
    target: { value: 'ABC123' },
  });
  fireEvent.blur(screen.getByTestId('Autocomplete'));
};

describe('AcceptDiscount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getProductsList as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({
      content: [mockProduct],
    });
  });

  it('renders correctly', () => {
    render(<AcceptDiscount />);
    expect(screen.getByTestId('BreadcrumbsBox')).toBeInTheDocument();
    expect(screen.getByLabelText('pages.acceptDiscount.expenditureAmount')).toBeInTheDocument();
    expect(screen.getByLabelText('pages.acceptDiscount.discountCode')).toBeInTheDocument();
  });

  it('shows required errors when fields are empty', async () => {
    render(<AcceptDiscount />);
    fireEvent.click(screen.getByText('commons.continueBtn'));

    await waitFor(() => {
      expect(screen.getAllByText(REQUIRED_FIELD_ERROR).length).toBeGreaterThan(0);
    });
  });

  it('handles previewPayment success', async () => {
    (previewPayment as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({
      originalAmountCents: 1000,
      trxCode: 'ABC123',
    });

    render(<AcceptDiscount />);
    fillForm();

    fireEvent.click(screen.getByText('commons.continueBtn'));

    await waitFor(() => {
      expect(previewPayment).toHaveBeenCalled();
    });

    expect(window.sessionStorage.setItem).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/accetta-buono-sconto/riepilogo');
  });

  it('handles discountCodeWrong error', async () => {
    (previewPayment as unknown as { mockRejectedValue: (v: unknown) => void }).mockRejectedValue({
      response: { data: { code: 'PAYMENT_NOT_FOUND_OR_EXPIRED' } },
    });

    render(<AcceptDiscount />);
    fillForm();

    fireEvent.click(screen.getByText('commons.continueBtn'));

    await waitFor(() => {
      expect(screen.getByText('Codice sconto non valido')).toBeInTheDocument();
    });
  });

  it('handles generic previewPayment error', async () => {
    (previewPayment as unknown as { mockRejectedValue: (v: unknown) => void }).mockRejectedValue(
      new Error('Generic')
    );

    render(<AcceptDiscount />);
    fillForm();

    fireEvent.click(screen.getByText('commons.continueBtn'));

    await waitFor(() => {
      expect(screen.getByTestId('AlertComponent')).toBeInTheDocument();
    });
  });

  it('handles exit flow', () => {
    render(<AcceptDiscount />);
    fireEvent.click(screen.getByText('Indietro'));
    fireEvent.click(screen.getByText('Esci'));

    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('discountCoupon');
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.BUY_MANAGEMENT);
  });
});
