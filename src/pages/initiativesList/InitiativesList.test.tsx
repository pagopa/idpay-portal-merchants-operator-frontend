import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InitiativesList } from './InitiativesList';
import { useAppSelector } from '../../redux/hooks';
import { initiativesListSelector } from '../../redux/slices/initiativesSlice';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import { DynamicTable } from '../../components/DynamicTable/DynamicTable';
import italianCopy from '../../locale/it/common.json';
import italianConfig from '../../locale/it/config.json';
import type { ChangeEventHandler, ReactNode } from 'react';

vi.mock('@mui/system', () => ({
  Box: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@mui/material', () => ({
  InputAdornment: () => null,
  TextField: ({ onChange, ...props }: {
    onChange: ChangeEventHandler<HTMLInputElement>;
    'data-testid': string;
  }) => <div data-testid={props['data-testid']}><input onChange={onChange} /></div>,
}));

vi.mock('@mui/icons-material/Search', () => ({ default: () => null }));

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
  DynamicTable: vi.fn(({ rows }: { rows: any[] }) => (
    <div data-testid="dynamic-table">{rows.length}</div>
  )),
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

  it('passes a status comparator using the Italian chip labels to the grid', () => {
    const columns = italianConfig.commons.pages.initiativesList.initiativeTable.columns;
    const labels = italianCopy.commons.statusEnum.initiative;
    const statuses = italianConfig.commons.statusEnum.initiative;
    vi.mocked(useScopedTranslation).mockReturnValue({
      t: (key) => labels[key.split('.').at(-1) as keyof typeof labels] ?? key,
      config: ((key: string) => key.endsWith('.columns')
        ? columns
        : statuses[key.split('.').at(-1) as keyof typeof statuses]) as ReturnType<typeof useScopedTranslation>['config'],
    });
    vi.mocked(useAppSelector).mockReturnValue([
      { initiativeId: '1', initiativeName: 'Closed initiative', status: 'CLOSED' },
      { initiativeId: '2', initiativeName: 'Published initiative', status: 'PUBLISHED' },
    ]);

    render(<InitiativesList />);

    const props = vi.mocked(DynamicTable).mock.calls.at(-1)![0];
    const compare = props.columnsDef.find((column) => column.field === 'status')!.sortComparator!;
    const input = ['CLOSED', 'PUBLISHED'];
    const ascending = [...input].sort((a, b) => compare(a, b, undefined!, undefined!));
    const descending = [...input].sort((a, b) => -compare(a, b, undefined!, undefined!));
    expect(ascending).toEqual(['PUBLISHED', 'CLOSED']);
    expect(descending).toEqual(['CLOSED', 'PUBLISHED']);
    expect(compare('PUBLISHED', 'PUBLISHED', undefined!, undefined!)).toBe(0);
    expect(props.rows.map((row) => row.status)).toEqual(['CLOSED', 'PUBLISHED']);
  });
});
