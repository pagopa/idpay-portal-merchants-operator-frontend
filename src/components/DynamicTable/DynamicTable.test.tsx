import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DynamicTable } from './DynamicTable';
import { renderFields } from '../../utils/renderFields';

vi.mock('../../hooks/useScopedTranslation', () => ({
    useScopedTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('../../utils/renderFields', () => ({
    renderFields: vi.fn(() => ({
        textType: () => <span data-testid="custom-cell">Custom Cell Content</span>,
    })),
}));

vi.mock('@pagopa/mui-italia', () => ({
    theme: {
        palette: {
            background: { paper: '#ffffff' },
            grey: { 100: '#f5f5f5' },
        },
    },
}));

describe('DynamicTable Component', () => {
    const mockColumnsDef = [
        { field: 'id', headerName: 'table.id', cell: { type: 'textType', tooltip: true } },
        { field: 'name', headerName: 'table.name', cell: { type: 'textType' } }
    ];

    const mockRows = [
        { id: 1, name: 'Item 1' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render circular progress when isLoading is true', () => {
        render(
            <DynamicTable
                isLoading={true}
                isEmpty={false}
                columnsDef={mockColumnsDef as any}
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
                columnsDef={mockColumnsDef as any}
                rows={[]}
            />
        );

        expect(screen.getByText('table.emptyMessage')).toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('should render DataGrid with mapped columns and correctly call renderFields', () => {
        render(
            <DynamicTable
                isLoading={false}
                isEmpty={false}
                columnsDef={mockColumnsDef as any}
                rows={mockRows}
                rowsDividerColor="#000000"
            />
        );

        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        
        expect(screen.getByText('table.id')).toBeInTheDocument();
        expect(screen.getByText('table.name')).toBeInTheDocument();

        expect(renderFields).toHaveBeenCalledWith({tooltip: true});
        expect(renderFields).toHaveBeenCalledWith({tooltip: undefined});
    });
});