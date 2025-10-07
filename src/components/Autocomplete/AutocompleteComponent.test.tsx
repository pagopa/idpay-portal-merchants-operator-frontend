import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AutocompleteComponent from './AutocompleteComponent';
// import { ProductDTO } from '../../api/generated/merchants/ProductDTO';
// import { REQUIRED_FIELD_ERROR } from '../../utils/constants';

// --- Mocks ---

// Mock of react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'pages.acceptDiscount.noOptionsText') return 'Nessuna opzione';
      if (key === 'pages.acceptDiscount.loadingText') return 'Caricamento...';
      return key;
    },
  }),
}));

vi.mock('../../utils/constants', () => ({
  REQUIRED_FIELD_ERROR: 'Questo campo è obbligatorio',
}));



describe('AutocompleteComponent', () => {

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render correctly with the initial label', () => {
    render(<AutocompleteComponent options={[]} />);
    expect(screen.getByLabelText('Cerca')).toBeInTheDocument();
  });

  it('should not call onChangeDebounce or show loader for input less than 3 characters', async () => {
    const onChangeDebounce = vi.fn();
    render(<AutocompleteComponent options={[]} onChangeDebounce={onChangeDebounce} />);
    
    const input = screen.getByLabelText('Cerca');
    fireEvent.change(input, { target: { value: 'ab' } });
    vi.advanceTimersByTime(1000);

    expect(onChangeDebounce).not.toHaveBeenCalled();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });


});
