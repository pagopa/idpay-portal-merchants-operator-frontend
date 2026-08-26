import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AcceptDiscount from './AcceptDiscount';
import { getInitiativeProductsList, previewPayment } from '../../services/merchantService';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ initiativeId: 'test-initiative-123' }),
  generatePath: (path: string, params: Record<string, string>) => `${path}/${params.initiativeId}`,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../../services/merchantService', () => ({
  getInitiativeProductsList: vi.fn(),
  previewPayment: vi.fn(),
}));

vi.mock('../../components/Autocomplete/AutocompleteComponent', () => ({
  default: ({ onChange, onChangeDebounce, value, inputError }: any) => (
    <div>
      <input
        data-testid="autocomplete-input"
        value={value ? value.productName : ''}
        onChange={(e) => {
          onChangeDebounce(e.target.value);
          onChange({ gtinCode: 'GTIN123', productName: e.target.value });
        }}
      />
      {inputError && <span data-testid="autocomplete-error">Product Error</span>}
    </div>
  ),
}));

vi.mock('../../components/BreadcrumbsBox/BreadcrumbsBox', () => ({
  default: ({ onClickBackButton }: any) => (
    <button data-testid="breadcrumbs-back" onClick={onClickBackButton}>
      Back
    </button>
  ),
}));

vi.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  TitleBox: ({ title, subTitle }: any) => (
    <div>
      <h1>{title}</h1>
      <h2>{subTitle}</h2>
    </div>
  ),
}));

vi.mock('../../components/Modal/ModalComponent', () => ({
  default: ({ open, children, onClose }: any) =>
    open ? (
      <div data-testid="modal-component">
        {children}
        <button data-testid="modal-close-btn" onClick={onClose}>
          Close Modal
        </button>
      </div>
    ) : null,
}));

vi.mock('../../components/Alert/AlertComponent', () => ({
  default: ({ isOpen, message }: any) =>
    isOpen ? <div data-testid="alert-component">{message}</div> : null,
}));

describe('AcceptDiscount Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('renders initial state correctly', () => {
    render(<AcceptDiscount />);

    expect(screen.getByText('pages.acceptDiscount.title')).toBeInTheDocument();
    expect(screen.getByText('pages.acceptDiscount.subtitle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'commons.continueBtn' })).toBeInTheDocument();
  });

  it('restores data from sessionStorage on mount', () => {
    const savedDiscountData = {
      product: { gtinCode: '98765', productName: 'Saved Product' },
      originalAmountCents: 2550,
      trxCode: 'SAVED_CODE_123',
    };

    sessionStorage.setItem('discountCoupon', JSON.stringify(savedDiscountData));

    render(<AcceptDiscount />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('Saved Product');
    expect(inputs[1]).toHaveValue('25,5');
    expect(inputs[2]).toHaveValue('SAVED_CODE_123');
  });

  it('displays validation errors when submitting an empty form', async () => {
    render(<AcceptDiscount />);

    const submitBtn = screen.getByRole('button', { name: 'commons.continueBtn' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId('autocomplete-error')).toBeInTheDocument();
    });
  });

  it('restricts invalid decimal input formats for totalAmount', () => {
    render(<AcceptDiscount />);

    const inputs = screen.getAllByRole('textbox');
    const amountInput = inputs[1];

    fireEvent.change(amountInput, { target: { value: '0' } });
    expect(amountInput).toHaveValue('');

    fireEvent.change(amountInput, { target: { value: ',' } });
    expect(amountInput).toHaveValue('');

    fireEvent.change(amountInput, { target: { value: '12,345' } });
    expect(amountInput).toHaveValue('');

    fireEvent.change(amountInput, { target: { value: '123456' } });
    expect(amountInput).toHaveValue('');

    fireEvent.change(amountInput, { target: { value: '15,50' } });
    expect(amountInput).toHaveValue('15,50');
  });

  it('fetches products list on typing in autocomplete', async () => {
    vi.mocked(getInitiativeProductsList).mockResolvedValueOnce({
      content: [{ gtinCode: '111', productName: 'Fetched Product' }],
    });

    render(<AcceptDiscount />);

    const autocompleteInput = screen.getByTestId('autocomplete-input');
    fireEvent.change(autocompleteInput, { target: { value: 'Product Search' } });

    await waitFor(() => {
      expect(getInitiativeProductsList).toHaveBeenCalledWith('test-initiative-123', {
        fullProductName: 'Product Search',
        size: 50,
      });
    });
  });

  it('handles products list fetch failure silently', async () => {
    vi.mocked(getInitiativeProductsList).mockRejectedValueOnce(new Error('Network error'));

    render(<AcceptDiscount />);

    const autocompleteInput = screen.getByTestId('autocomplete-input');
    fireEvent.change(autocompleteInput, { target: { value: 'Error Test' } });

    await waitFor(() => {
      expect(getInitiativeProductsList).toHaveBeenCalled();
    });
  });

  it('submits valid form data, sets sessionStorage, and navigates', async () => {
    const mockResponse = { id: 'preview-1', amountCents: 1000 };
    vi.mocked(previewPayment).mockResolvedValueOnce(mockResponse);

    render(<AcceptDiscount />);

    const autocompleteInput = screen.getByTestId('autocomplete-input');
    fireEvent.change(autocompleteInput, { target: { value: 'Sample Item' } });

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[1], { target: { value: '10,00' } });
    fireEvent.change(inputs[2], { target: { value: 'DISCOUNT20' } });

    const submitBtn = screen.getByRole('button', { name: 'commons.continueBtn' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(previewPayment).toHaveBeenCalledWith('test-initiative-123', {
        productGtin: 'GTIN123',
        productName: 'Sample Item',
        amountCents: 1000,
        discountCode: 'DISCOUNT20',
      });
      expect(sessionStorage.getItem('discountCoupon')).not.toBeNull();
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('handles invalid discount code response from previewPayment API', async () => {
    const errorResponse = {
      response: {
        data: {
          code: 'PAYMENT_NOT_FOUND_OR_EXPIRED',
        },
      },
    };
    vi.mocked(previewPayment).mockRejectedValueOnce(errorResponse);

    render(<AcceptDiscount />);

    const autocompleteInput = screen.getByTestId('autocomplete-input');
    fireEvent.change(autocompleteInput, { target: { value: 'Sample Item' } });

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[1], { target: { value: '10,00' } });
    fireEvent.change(inputs[2], { target: { value: 'EXPIRED_CODE' } });

    const submitBtn = screen.getByRole('button', { name: 'commons.continueBtn' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('pages.acceptDiscount.invalidDiscountCode')).toBeInTheDocument();
    });
  });

  it('displays generic error alert on previewPayment system error', async () => {
    vi.mocked(previewPayment).mockRejectedValueOnce(new Error('Internal error'));

    render(<AcceptDiscount />);

    const autocompleteInput = screen.getByTestId('autocomplete-input');
    fireEvent.change(autocompleteInput, { target: { value: 'Sample Item' } });

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[1], { target: { value: '10,00' } });
    fireEvent.change(inputs[2], { target: { value: 'ANY_CODE' } });

    const submitBtn = screen.getByRole('button', { name: 'commons.continueBtn' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId('alert-component')).toBeInTheDocument();
    });
  });

  it('opens and closes exit modal upon user interactions', async () => {
    render(<AcceptDiscount />);

    const backBtn = screen.getByText('Indietro');
    fireEvent.click(backBtn);

    expect(screen.getByTestId('modal-component')).toBeInTheDocument();

    const returnBtn = screen.getByText('Torna indietro');
    fireEvent.click(returnBtn);

    expect(screen.queryByTestId('modal-component')).not.toBeInTheDocument();
  });

  it('clears sessionStorage and navigates when confirming exit from modal', async () => {
    sessionStorage.setItem('discountCoupon', '{"test": "data"}');

    render(<AcceptDiscount />);

    const breadcrumbsBack = screen.getByTestId('breadcrumbs-back');
    fireEvent.click(breadcrumbsBack);

    expect(screen.getByTestId('modal-component')).toBeInTheDocument();

    const exitBtn = screen.getByText('Esci');
    fireEvent.click(exitBtn);

    expect(sessionStorage.getItem('discountCoupon')).toBeNull();
    expect(mockNavigate).toHaveBeenCalled();
  });
});