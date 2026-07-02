import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NavigationLink } from './NavigationLink';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock('../../utils/constants', () => ({
    MISSING_DATA_PLACEHOLDER: 'mock-missing-data',
}));

vi.mock('@mui/material', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@mui/material')>();
    return {
        ...actual,
        Tooltip: ({ children, title }: { children: React.ReactNode; title: string }) => (
            <div data-testid="mock-tooltip" data-title={title}>
                {children}
            </div>
        ),
    };
});

describe('NavigationLink Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the button with the provided label and set it as the tooltip title', () => {
        render(<NavigationLink label="Dashboard" path="/dashboard" />);

        const buttonElement = screen.getByRole('button', { name: 'Dashboard' });
        expect(buttonElement).toBeInTheDocument();

        const tooltipElement = screen.getByTestId('mock-tooltip');
        expect(tooltipElement).toHaveAttribute('data-title', 'Dashboard');
    });

    it('should use MISSING_DATA_PLACEHOLDER for the tooltip title if label is empty', () => {
        render(<NavigationLink label="" path="/dashboard" />);

        const tooltipElement = screen.getByTestId('mock-tooltip');
        expect(tooltipElement).toHaveAttribute('data-title', 'mock-missing-data');
    });

    it('should call navigate with the correct path and replace flag when the button is clicked', () => {
        render(<NavigationLink label="Settings" path="/settings" />);

        const buttonElement = screen.getByRole('button', { name: 'Settings' });
        fireEvent.click(buttonElement);

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/settings', { replace: true });
    });
});