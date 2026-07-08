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
            if (key === 'templates.categories') {
                return [
                    { value: 'REFRIGERATINGAPPL', label: 'templates.categories.refrigeratingappl' },
                    { value: 'OVENS', label: 'templates.categories.ovens' }
                ];
            }
            return [];
        }
    })
}));

vi.mock('../FiltersForm/FiltersForm', () => ({
    default: ({ children, onFiltersApplied, onFiltersReset }: any) => (
        <form 
            data-testid="mock-filters-form" 
            onSubmit={(e) => { 
                e.preventDefault(); 
                onFiltersApplied(); 
            }}
        >
            {children}
            <button type="submit" data-testid="apply-btn">Apply</button>
            <button type="button" onClick={onFiltersReset} data-testid="reset-btn">Reset</button>
        </form>
    )
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
    const mockOnFiltersApply = vi.fn();
    const mockOnFiltersReset = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should correctly render all filter fields', () => {
        render(
            <DynamicFilters 
                filters={{}} 
                filtersDef={mockFiltersDef} 
                onFiltersApply={mockOnFiltersApply} 
                onFiltersReset={mockOnFiltersReset} 
            />
        );

        expect(screen.getByLabelText('pages.products.filters.eprelCode')).toBeInTheDocument();
        // Usiamo getAllByText perché MUI renderizza la label due volte (nella label vera e propria e nel legend dell'outline)
        expect(screen.getAllByText('pages.products.filters.category').length).toBeGreaterThan(0);
    });

    it('should validate text input with regex and show/hide error message correctly', async () => {
        render(
            <DynamicFilters 
                filters={{}} 
                filtersDef={mockFiltersDef} 
                onFiltersApply={mockOnFiltersApply} 
                onFiltersReset={mockOnFiltersReset} 
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
                onFiltersApply={mockOnFiltersApply} 
                onFiltersReset={mockOnFiltersReset} 
            />
        );

        const textInput = screen.getByLabelText('pages.products.filters.eprelCode');

        fireEvent.paste(textInput, { clipboardData: { getData: () => '12 34 56' } });

        expect(textInput).toHaveValue('123456');
        expect(screen.queryByText('pages.products.filters.errors.eprelCode')).not.toBeInTheDocument();
    });

    it('should update select field and format draftFilters', async () => {
        render(
            <DynamicFilters 
                filters={{}} 
                filtersDef={mockFiltersDef} 
                onFiltersApply={mockOnFiltersApply} 
                onFiltersReset={mockOnFiltersReset} 
            />
        );

        // Selezioniamo il primo elemento text trovato per evitare l'errore di elementi multipli
        const selectLabel = screen.getAllByText('pages.products.filters.category')[0];
        const selectContainer = selectLabel.parentElement?.querySelector('[role="combobox"]');
        
        expect(selectContainer).toBeInTheDocument();
        fireEvent.mouseDown(selectContainer!);

        const option = screen.getByText('templates.categories.refrigeratingappl');
        fireEvent.click(option);

        fireEvent.click(screen.getByTestId('apply-btn'));

        await waitFor(() => {
            expect(mockOnFiltersApply).toHaveBeenCalledWith({ category: 'REFRIGERATINGAPPL' });
        });
    });

    it('should properly apply text filters removing empty values', async () => {
        render(
            <DynamicFilters 
                filters={{ category: 'OVENS' }} 
                filtersDef={mockFiltersDef} 
                onFiltersApply={mockOnFiltersApply} 
                onFiltersReset={mockOnFiltersReset} 
            />
        );

        const textInput = screen.getByLabelText('pages.products.filters.eprelCode');
        await userEvent.type(textInput, '987');

        fireEvent.click(screen.getByTestId('apply-btn'));

        await waitFor(() => {
            expect(mockOnFiltersApply).toHaveBeenCalledWith({ 
                category: 'OVENS', 
                eprelCode: '987' 
            });
        });
    });

    it('should trigger onFiltersReset callback when reset button is clicked', () => {
        render(
            <DynamicFilters 
                filters={{}} 
                filtersDef={mockFiltersDef} 
                onFiltersApply={mockOnFiltersApply} 
                onFiltersReset={mockOnFiltersReset} 
            />
        );

        fireEvent.click(screen.getByTestId('reset-btn'));
        expect(mockOnFiltersReset).toHaveBeenCalledTimes(1);
    });

    it('should update draft filters if initial filters prop changes', () => {
        const { rerender } = render(
            <DynamicFilters 
                filters={{}} 
                filtersDef={mockFiltersDef} 
                onFiltersApply={mockOnFiltersApply} 
                onFiltersReset={mockOnFiltersReset} 
            />
        );

        const textInput = screen.getByLabelText('pages.products.filters.eprelCode');
        expect(textInput).toHaveValue('');

        rerender(
            <DynamicFilters 
                filters={{ eprelCode: '111' }} 
                filtersDef={mockFiltersDef} 
                onFiltersApply={mockOnFiltersApply} 
                onFiltersReset={mockOnFiltersReset} 
            />
        );

        expect(textInput).toHaveValue('111');
    });
});