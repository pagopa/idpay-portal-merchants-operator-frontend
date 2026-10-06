import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InitiativesList } from './InitiativesList';
import { useAppSelector } from '../../redux/hooks';
import { initiativesListSelector } from '../../redux/slices/initiativesSlice';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';

vi.mock('../../redux/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('../../redux/slices/initiativesSlice', () => ({
  initiativesListSelector: vi.fn(),
}));

vi.mock('../../hooks/useScopedTranslation', () => ({
  useScopedTranslation: vi.fn(),
}));

vi.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  TitleBox: () => <div data-testid="title-box" />,
}));

vi.mock('../../components/DynamicTable/DynamicTable', () => ({
  DynamicTable: ({ rows }: { rows: any[] }) => (
    <div data-testid="dynamic-table">{rows.length}</div>
  ),
}));

const mockInitiatives = [
  { initiativeId: '1', initiativeName: 'First Initiative' },
  { initiativeName: 'Second Initiative', initiativeId: '2' },
];

describe('InitiativesList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useAppSelector as any).mockReturnValue(mockInitiatives);
    (useScopedTranslation as any).mockReturnValue({
      t: (key: string) => key,
      config: vi.fn().mockReturnValue([]),
    });
  });

  it('renders correctly with the title and search input', () => {
    render(<InitiativesList />);
    
    expect(screen.getByTestId('title-box')).toBeInTheDocument();
    expect(screen.getByTestId('search-initiatives')).toBeInTheDocument();
    expect(screen.getByTestId('dynamic-table')).toHaveTextContent('2');
  });

  it('filters initiatives based on search input', () => {
    render(<InitiativesList />);

    const searchInput = screen.getByTestId('search-initiatives').querySelector('input');
    
    fireEvent.change(searchInput!, { target: { value: 'First' } });
    
    expect(screen.getByTestId('dynamic-table')).toHaveTextContent('1');

    fireEvent.change(searchInput!, { target: { value: 'NonExistent' } });
    expect(screen.getByTestId('dynamic-table')).toHaveTextContent('0');
  });

  it('resets the list when search input is cleared', () => {
    render(<InitiativesList />);

    const searchInput = screen.getByTestId('search-initiatives').querySelector('input');
    
    fireEvent.change(searchInput!, { target: { value: 'First' } });
    expect(screen.getByTestId('dynamic-table')).toHaveTextContent('1');

    fireEvent.change(searchInput!, { target: { value: '' } });
    expect(screen.getByTestId('dynamic-table')).toHaveTextContent('2');
  });
});