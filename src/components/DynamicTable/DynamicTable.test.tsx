import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DynamicTable } from './DynamicTable';

vi.mock('../../hooks/useScopedTranslation', () => ({
    useScopedTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('./columnsConfig', () => ({
    columnsConfig: {
        textType: () => <span>Custom Cell Content</span>,
    },
}));

vi.mock('@pagopa/mui-italia', () => ({
    theme: {
        palette: {
            background: {
                paper: '#ffffff',
            },
        },
    },
}));

describe('DynamicTable Component', () => {
    const mockColumnsDef = [
        { field: 'id', headerName: 'table.id', cell: { type: 'textType' } },
        { field: 'name', headerName: 'table.name', cell: { type: 'textType' } }
    ];

    const mockRows = [
        { id: 1, name: 'Item 1' }
    ];

    it('should render circular progress when isLoading is true', () => {
        render(
            <DynamicTable
                isLoading={true}
                isEmpty={false}
                columnsDef={mockColumnsDef}
                rows={mockRows}
            />
        );

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByText('table.id')).not.toBeInTheDocument();
    });

    it('should render empty text when isEmpty is true and isLoading is false', () => {
        render(
            <DynamicTable
                isLoading={false}
                isEmpty={true}
                emptyText="table.emptyMessage"
                columnsDef={mockColumnsDef}
                rows={[]}
            />
        );

        expect(screen.getByText('table.emptyMessage')).toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('should render DataGrid with mapped columns and rows when loading and empty states are false', () => {
        render(
            <DynamicTable
                isLoading={false}
                isEmpty={false}
                columnsDef={mockColumnsDef}
                rows={mockRows}
            />
        );

        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.getByText('table.id')).toBeInTheDocument();
        expect(screen.getByText('table.name')).toBeInTheDocument();
    });
});