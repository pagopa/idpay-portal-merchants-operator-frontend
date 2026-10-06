import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { NavigationLink } from './NavigationLink';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock('@mui/material', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@mui/material')>();
    return {
        ...actual,
        Tooltip: ({ children, title }: { children: React.ReactNode; title: any }) => (
            <div data-testid="mock-tooltip" data-title={title ? title.toString() : 'false'}>
                {children}
            </div>
        ),
    };
});

vi.mock('@pagopa/mui-italia', () => ({
    theme: {
        palette: {
            primary: { main: '#000' },
        },
        typography: {
            fontWeightMedium: 500,
        },
    },
}));

describe('NavigationLink Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the label and not set tooltip title when tooltip prop is false', () => {
        render(<NavigationLink label="Dashboard" path="/dashboard" />);

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('mock-tooltip')).toHaveAttribute('data-title', 'false');
    });

    it('should set the label as the tooltip title when tooltip prop is true', () => {
        render(<NavigationLink label="Dashboard" path="/dashboard" tooltip />);

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('mock-tooltip')).toHaveAttribute('data-title', 'Dashboard');
    });

    it('should call navigate with correct path and replace flag when clicked', () => {
        render(<NavigationLink label="Settings" path="/settings" />);

        const textElement = screen.getByText('Settings');
        fireEvent.click(textElement);

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/settings', { replace: true });
    });

    it('should render placeholder and set it as tooltip title when label is missing', () => {
        render(<NavigationLink label="" path="/dashboard" tooltip />);

        expect(screen.getByText(MISSING_DATA_PLACEHOLDER)).toBeInTheDocument();
        expect(screen.getByTestId('mock-tooltip')).toHaveAttribute('data-title', MISSING_DATA_PLACEHOLDER);
    });
});