import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { fieldsConfig } from './fieldsConfig';
import { checkTooltipValue } from './helpers';

vi.mock('../../utils/helpers', () => ({
    checkTooltipValue: vi.fn(() => 'mocked-tooltip-value'),
}));

vi.mock('../NavigationLink/NavigationLink', () => ({
    NavigationLink: ({ label, path }: { label: string; path: string }) => (
        <a href={path} data-testid="navigation-link">
            {label}
        </a>
    ),
}));

vi.mock('../StatusChip/StatusChip', () => ({
    StatusChip: ({ field, value }: { field: string; value: string }) => (
        <span data-testid="status-chip" data-field={field}>
            {value}
        </span>
    ),
}));

describe('fieldsConfig', () => {
    it('should call checkTooltipValue when text function is executed', () => {
        const mockParams = { value: 'text-value' };
        const result = fieldsConfig.text(mockParams);

        expect(checkTooltipValue).toHaveBeenCalledWith(mockParams);
        expect(result).toBe('mocked-tooltip-value');
    });

    it('should render NavigationLink with correct props when link function is executed', () => {
        const mockParams = {
            value: 'Go to Dashboard',
            row: { route: '/dashboard' },
        };

        render(fieldsConfig.link(mockParams));

        const linkElement = screen.getByTestId('navigation-link');
        expect(linkElement).toBeInTheDocument();
        expect(linkElement).toHaveTextContent('Go to Dashboard');
        expect(linkElement).toHaveAttribute('href', '/dashboard');
    });

    it('should render StatusChip with lowercased value when chip function is executed', () => {
        const mockParams = {
            value: 'PENDING',
            row: { key: 'status-key' },
        };

        render(fieldsConfig.chip(mockParams));

        const chipElement = screen.getByTestId('status-chip');
        expect(chipElement).toBeInTheDocument();
        expect(chipElement).toHaveTextContent('pending');
        expect(chipElement).toHaveAttribute('data-field', 'status-key');
    });
});