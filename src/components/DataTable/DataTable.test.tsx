// DataTable.test.tsx
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DataTable from './DataTable';

vi.mock('../../utils/constants', () => ({
  MISSING_DATA_PLACEHOLDER: '--',
}));


vi.mock('@mui/x-data-grid', async (importOriginal) => {
    const original: any = await importOriginal();
    return {
      ...original,
      DataGrid: vi.fn((props: any) => {
        (globalThis as any).lastDataGridProps = props;
  
        if (!props.rows || !props.rows.length || !props.columns || !props.columns.length) {
          return <div data-testid="mock-data-grid-empty">No Data</div>;
        }
  
        return (
          <div data-testid="mock-data-grid">
            {props.rows.map((row: any) => (
              <div role="row" key={row.id} data-testid={`row-${row.id}`}>
                {props.columns.map((column: any) => (
                  <div role="gridcell" key={column.field} data-testid={`cell-${column.field}`}>
                    {column.renderCell ? column.renderCell({ ...column, row, value: row[column.field] }) : row[column.field]}
                  </div>
                ))}
                {props.columns.find((col: any) => col.field === 'actions')?.renderCell?.({ row })}
              </div>
            ))}
          </div>
        );
      }),
    };
  });

vi.mock('@mui/material', async (importOriginal) => {
  const original: any = await importOriginal();
  return {
    ...original,
    Box: ({ children }: any) => <div data-testid="mock-box">{children}</div>,
    IconButton: ({ onClick, children }: any) => (
      <button data-testid="mock-icon-btn" onClick={onClick}>
        {children}
      </button>
    ),
  };
});

describe('DataTable', () => {
  const mockColumns = [{ field: 'name', headerName: 'Name' }];
  const mockRows = [{ id: 1, name: 'mario' }];

  it('renders DataGrid when rows and columns are provided', () => {
    render(
      <DataTable
        rows={mockRows}
        columns={mockColumns}
        paginationModel={{ pageNo: 0, pageSize: 10, totalElements: 1 }}
      />
    );

    expect(screen.getByTestId('mock-data-grid')).toBeInTheDocument();
    const rowElement: any = screen.getByText('mario').closest('[role="row"]');
    expect(rowElement).toBeInTheDocument();
    
    const emailCell = within(rowElement!).getByText('mario');
    expect(emailCell).toBeInTheDocument();
  });

  it('renders placeholder for empty cell values', () => {
    const rows = [{ id: 1, name: '' }];

    render(
      <DataTable
        rows={rows}
        columns={mockColumns}
        paginationModel={{ pageNo: 0, pageSize: 10, totalElements: 1 }}
      />
    );

    expect(screen.getByTestId('cell-name')).toHaveTextContent('--');
  });

  it('calls handleRowAction when action button is clicked', () => {
    const handleRowAction = vi.fn();

    render(
      <DataTable
        rows={mockRows}
        columns={mockColumns}
        handleRowAction={handleRowAction}
        paginationModel={{ pageNo: 0, pageSize: 10, totalElements: 1 }}
      />
    );

    const btns = screen.getAllByTestId('mock-icon-btn');
    fireEvent.click(btns[0]);
    
    expect(handleRowAction).toHaveBeenCalledWith(mockRows[0]);
  });


});
