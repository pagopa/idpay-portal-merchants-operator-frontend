import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { DynamicFilters } from './DynamicFilters';
import { FilterConfigDef } from '../../utils/types';

vi.mock('../../hooks/useScopedTranslation', () => ({
    useScopedTranslation: () => ({
        t: (key: string) => key,
        config: (key: string) => {
            if (key === 'categories' || key === 'templates.categories') {
                return [
                    { value: 'REFRIGERATINGAPPL', label: 'templates.categories.refrigeratingappl' },
                    { value: 'OVENS', label: 'templates.categories.ovens' }
                ];
            }
            return [];
        }
    })
}));

vi.mock('../StatusChip/StatusChip', () => ({
    StatusChip: () => <span data-testid="status-chip" />
}));

const mockFiltersDef: Array<FilterConfigDef> = [
    {
        id: "category",
        type: "select",
        label: "pages.products.filters.category",
        template: "categories"
    },
    {
        id: "eprelCode",
        type: "text",
        label: "pages.products.filters.eprelCode",
        regEx: "^[0-9]{1,12}$",
        message: "pages.products.filters.errors.eprelCode",
        pattern: {
            value: "\\s+",
            flag: "g"
        },
        inputProps: {
            maxLength: 12
        }
    }
];

describe('DynamicFilters Component', () => {
    const mockSetFilters = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should correctly render all filter fields', () => {
        render(
            <DynamicFilters
                filters={{}}
                filtersDef={mockFiltersDef}
                setFilters={mockSetFilters}
            />
        );

        expect(screen.getByLabelText('pages.products.filters.eprelCode')).toBeInTheDocument();
        expect(screen.getAllByText('pages.products.filters.category').length).toBeGreaterThan(0);
    });

    it('should validate text input with regex and show/hide error message correctly', async () => {
        render(
            <DynamicFilters
                filters={{}}
                filtersDef={mockFiltersDef}
                setFilters={mockSetFilters}
            />
        );

        const textInput = screen.getByLabelText('pages.products.filters.eprelCode');

        await userEvent.type(textInput, 'abc');
        expect(screen.getByText('pages.products.filters.errors.eprelCode')).toBeInTheDocument();

        await userEvent.clear(textInput);
        await userEvent.type(textInput, '12345');
        expect(screen.queryByText('pages.products.filters.errors.eprelCode')).not.toBeInTheDocument();
    });

    it('should handle onPaste event with pattern replacement and validation', () => {
        render(
            <DynamicFilters
                filters={{}}
                filtersDef={mockFiltersDef}
                setFilters={mockSetFilters}
            />
        );

        const textInput = screen.getByLabelText('pages.products.filters.eprelCode');

        fireEvent.paste(textInput, {
            clipboardData: { getData: () => '12 34 56' },
            preventDefault: vi.fn()
        });

        expect(textInput).toHaveValue('123456');
        expect(screen.queryByText('pages.products.filters.errors.eprelCode')).not.toBeInTheDocument();
    });

    it('should update select field and format draftFilters', async () => {
        render(
            <DynamicFilters
                filters={{}}
                filtersDef={mockFiltersDef}
                setFilters={mockSetFilters}
            />
        );

        const selectContainer = screen.getByRole('combobox');
        await userEvent.click(selectContainer);

        const option = await screen.findByText('templates.categories.refrigeratingappl');
        await userEvent.click(option);

        await userEvent.click(screen.getByTestId('apply-filters-test'));

        await waitFor(() => {
            expect(mockSetFilters).toHaveBeenCalledWith({ category: 'REFRIGERATINGAPPL' });
        });
    });

    it('should properly apply text filters removing empty values', async () => {
        render(
            <DynamicFilters
                filters={{ category: 'OVENS' }}
                filtersDef={mockFiltersDef}
                setFilters={mockSetFilters}
            />
        );

        const textInput = screen.getByLabelText('pages.products.filters.eprelCode');
        await userEvent.type(textInput, '987');

        fireEvent.click(screen.getByTestId('apply-filters-test'));

        await waitFor(() => {
            expect(mockSetFilters).toHaveBeenCalledWith({
                category: 'OVENS',
                eprelCode: '987'
            });
        });
    });

    it('should trigger setFilters with empty object when reset button is clicked', () => {
        render(
            <DynamicFilters
                filters={{ category: 'OVENS' }}
                filtersDef={mockFiltersDef}
                setFilters={mockSetFilters}
            />
        );

        fireEvent.click(screen.getByTestId('reset-filters-test'));
        expect(mockSetFilters).toHaveBeenCalledWith({});
    });

    it('should update draft filters if initial filters prop changes', () => {
        const { rerender } = render(
            <DynamicFilters
                filters={{}}
                filtersDef={mockFiltersDef}
                setFilters={mockSetFilters}
            />
        );

        const textInput = screen.getByLabelText('pages.products.filters.eprelCode');
        expect(textInput).toHaveValue('');

        rerender(
            <DynamicFilters
                filters={{ eprelCode: '111' }}
                filtersDef={mockFiltersDef}
                setFilters={mockSetFilters}
            />
        );

        expect(textInput).toHaveValue('111');
    });

    it('should disable apply button when there are validation errors', async () => {
        render(
            <DynamicFilters
                filters={{ category: 'OVENS' }}
                filtersDef={mockFiltersDef}
                setFilters={mockSetFilters}
            />
        );

        const textInput = screen.getByLabelText('pages.products.filters.eprelCode');

        await userEvent.type(textInput, 'abc');
        expect(screen.getByTestId('apply-filters-test')).toBeDisabled();
    });
});