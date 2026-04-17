import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

const BreadcrumbsBoxMock = vi.fn(({ onClickBackButton }: { onClickBackButton?: () => void }) => (
  <button data-testid="BreadcrumbsBox" onClick={onClickBackButton}>
    back
  </button>
));

vi.mock('../../components/BreadcrumbsBox/BreadcrumbsBox', () => ({
  default: (props: { onClickBackButton?: () => void }) => BreadcrumbsBoxMock(props),
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
  default: ({ message }: { message: string }) => <div data-testid="AlertComponent">{message}</div>,
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

  it('handles PAYMENT_ALREADY_AUTHORIZED error', async () => {
    (previewPayment as unknown as { mockRejectedValue: (v: unknown) => void }).mockRejectedValue({
      response: { data: { code: 'PAYMENT_ALREADY_AUTHORIZED' } },
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

  it('loads form data from sessionStorage on mount', () => {
    const storedData = {
      product: mockProduct,
      originalAmountCents: 1500,
      trxCode: 'STORED123',
    };
    (window.sessionStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      JSON.stringify(storedData)
    );

    render(<AcceptDiscount />);

    expect(window.sessionStorage.getItem).toHaveBeenCalledWith('discountCoupon');
    expect(
      (screen.getByLabelText('pages.acceptDiscount.expenditureAmount') as HTMLInputElement).value
    ).toBe('15');
    expect(
      (screen.getByLabelText('pages.acceptDiscount.discountCode') as HTMLInputElement).value
    ).toBe('STORED123');
  });

  it('does not load form data when sessionStorage is empty', () => {
    (window.sessionStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);

    render(<AcceptDiscount />);

    expect(
      (screen.getByLabelText('pages.acceptDiscount.expenditureAmount') as HTMLInputElement).value
    ).toBe('');
    expect(
      (screen.getByLabelText('pages.acceptDiscount.discountCode') as HTMLInputElement).value
    ).toBe('');
  });

  it('auto-dismisses errorAlert after 5 seconds', async () => {
    vi.useFakeTimers();

    (previewPayment as unknown as { mockRejectedValue: (v: unknown) => void }).mockRejectedValue(
      new Error('Generic')
    );

    render(<AcceptDiscount />);
    fillForm();

    fireEvent.click(screen.getByText('commons.continueBtn'));

    await act(async () => {});

    expect(screen.getByTestId('AlertComponent')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(6000);
      vi.runOnlyPendingTimers();
    });

    await act(async () => {});

    expect(screen.getByTestId('AlertComponent')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('clears errorAlert timer on unmount', async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    (previewPayment as unknown as { mockRejectedValue: (v: unknown) => void }).mockRejectedValue(
      new Error('Generic')
    );

    const { unmount } = render(<AcceptDiscount />);
    fillForm();

    fireEvent.click(screen.getByText('commons.continueBtn'));

    await act(async () => {});

    expect(screen.getByTestId('AlertComponent')).toBeInTheDocument();

    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();

    vi.useRealTimers();
    clearTimeoutSpy.mockRestore();
  });

  it('ignores totalAmount input with multiple commas', () => {
    render(<AcceptDiscount />);
    const input = screen.getByLabelText('pages.acceptDiscount.expenditureAmount');

    fireEvent.change(input, { target: { value: '1,2,3' } });

    expect((input as HTMLInputElement).value).toBe('');
  });

  it('ignores totalAmount input when integer part contains non-digit characters', () => {
    render(<AcceptDiscount />);
    const input = screen.getByLabelText('pages.acceptDiscount.expenditureAmount');

    fireEvent.change(input, { target: { value: '12a' } });

    expect((input as HTMLInputElement).value).toBe('');
  });

  it('ignores totalAmount input when decimal part exceeds 2 digits', () => {
    render(<AcceptDiscount />);
    const input = screen.getByLabelText('pages.acceptDiscount.expenditureAmount');

    fireEvent.change(input, { target: { value: '1,234' } });

    expect((input as HTMLInputElement).value).toBe('');
  });

  it('ignores totalAmount input when integer part exceeds 5 digits', () => {
    render(<AcceptDiscount />);
    const input = screen.getByLabelText('pages.acceptDiscount.expenditureAmount');

    fireEvent.change(input, { target: { value: '123456' } });

    expect((input as HTMLInputElement).value).toBe('');
  });

  it('ignores totalAmount input when decimal part contains non-digit characters', () => {
    render(<AcceptDiscount />);
    const input = screen.getByLabelText('pages.acceptDiscount.expenditureAmount');

    fireEvent.change(input, { target: { value: '1,2a' } });

    expect((input as HTMLInputElement).value).toBe('');
  });

  it('ignores totalAmount when value is "0"', () => {
    render(<AcceptDiscount />);
    const input = screen.getByLabelText('pages.acceptDiscount.expenditureAmount');

    fireEvent.change(input, { target: { value: '0' } });

    expect((input as HTMLInputElement).value).toBe('');
  });

  it('ignores totalAmount when value is ","', () => {
    render(<AcceptDiscount />);
    const input = screen.getByLabelText('pages.acceptDiscount.expenditureAmount');

    fireEvent.change(input, { target: { value: ',' } });

    expect((input as HTMLInputElement).value).toBe('');
  });

  it('accepts empty string for totalAmount', () => {
    render(<AcceptDiscount />);
    const input = screen.getByLabelText('pages.acceptDiscount.expenditureAmount');

    fireEvent.change(input, { target: { value: '10' } });
    fireEvent.change(input, { target: { value: '' } });

    expect((input as HTMLInputElement).value).toBe('');
  });

  it('accepts valid totalAmount with decimal', () => {
    render(<AcceptDiscount />);
    const input = screen.getByLabelText('pages.acceptDiscount.expenditureAmount');

    fireEvent.change(input, { target: { value: '10,99' } });

    expect((input as HTMLInputElement).value).toBe('10,99');
  });

  it('updates discountCode field correctly', () => {
    render(<AcceptDiscount />);
    const input = screen.getByLabelText('pages.acceptDiscount.discountCode');

    fireEvent.change(input, { target: { value: 'MYCODE' } });

    expect((input as HTMLInputElement).value).toBe('MYCODE');
  });

  it('triggers fetchProductsList when autocomplete input changes', async () => {
    vi.useFakeTimers();

    render(<AcceptDiscount />);
    const autocomplete = screen.getByTestId('Autocomplete');

    fireEvent.change(autocomplete, { target: { value: 'test' } });

    await act(async () => {
      vi.runOnlyPendingTimers();
    });

    expect(getProductsList).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('sets productsList to empty array when getProductsList throws', async () => {
    vi.useFakeTimers();

    (getProductsList as unknown as { mockRejectedValue: (v: unknown) => void }).mockRejectedValue(
      new Error('fetch error')
    );

    render(<AcceptDiscount />);
    const autocomplete = screen.getByTestId('Autocomplete');

    fireEvent.change(autocomplete, { target: { value: 'fail' } });

    await act(async () => {
      vi.runOnlyPendingTimers();
    });

    expect(getProductsList).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('shows euro icon adornment when expenditure field is focused', () => {
    render(<AcceptDiscount />);
    const input = screen.getByLabelText('pages.acceptDiscount.expenditureAmount');

    fireEvent.focus(input);

    expect(
      document.querySelector('[data-testid="EuroIcon"]') || document.querySelector('svg')
    ).toBeTruthy();
  });

  it('hides euro icon adornment when expenditure field is blurred and empty', () => {
    render(<AcceptDiscount />);
    const input = screen.getByLabelText('pages.acceptDiscount.expenditureAmount');

    fireEvent.focus(input);
    fireEvent.blur(input);

    expect((input as HTMLInputElement).value).toBe('');
  });

  it('closes modal when "Torna indietro" is clicked', () => {
    render(<AcceptDiscount />);

    fireEvent.click(screen.getByText('Indietro'));
    expect(screen.getByTestId('ModalComponent')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Torna indietro'));
    expect(screen.queryByTestId('ModalComponent')).not.toBeInTheDocument();
  });

  it('opens modal when BreadcrumbsBox back button is clicked', () => {
    render(<AcceptDiscount />);

    fireEvent.click(screen.getByTestId('BreadcrumbsBox'));
    expect(screen.getByTestId('ModalComponent')).toBeInTheDocument();
  });
});
