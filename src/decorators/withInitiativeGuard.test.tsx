import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { useParams, Navigate } from 'react-router-dom';
import { currentInitiativeSelector, initiativesListSelector } from '../redux/slices/initiativesSlice';
import ROUTES from '../routes';
import WithInitiativeGuard from './withInitiativeGuard';

vi.mock('react-router-dom', () => ({
    useParams: vi.fn(),
    Navigate: vi.fn(() => null),
}));

vi.mock('../redux/hooks', () => ({
    useAppSelector: vi.fn((selectorFn) => selectorFn({})),
}));

vi.mock('../redux/slices/initiativesSlice', () => ({
    initiativesListSelector: vi.fn(),
    currentInitiativeSelector: vi.fn(),
}));

vi.mock('../routes', () => ({
    default: {
        INITIATIVES_LIST: '/initiatives-list',
    },
}));

describe('WithInitiativeGuard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const Child = () => <div>Protected Content</div>;

    it('renders children when no initiativeId is present', () => {
        (useParams as Mock).mockReturnValue({});
        (initiativesListSelector as Mock).mockReturnValue([]);
        (currentInitiativeSelector as Mock).mockReturnValue(undefined);

        render(
            <WithInitiativeGuard>
                <Child />
            </WithInitiativeGuard>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        expect(Navigate).not.toHaveBeenCalled();
    });

    it('renders children when route is valid', () => {
        (useParams as Mock).mockReturnValue({ initiativeId: '123' });
        (initiativesListSelector as Mock).mockReturnValue([{ id: '1' }, { id: '2' }]);
        (currentInitiativeSelector as Mock).mockReturnValue({ id: '123' });

        render(
            <WithInitiativeGuard>
                <Child />
            </WithInitiativeGuard>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        expect(Navigate).not.toHaveBeenCalled();
    });

    it('redirects when selectedInitiative is missing', () => {
        (useParams as Mock).mockReturnValue({ initiativeId: '999' });
        (initiativesListSelector as Mock).mockReturnValue([{ id: '1' }, { id: '2' }]);
        (currentInitiativeSelector as Mock).mockReturnValue(undefined);

        render(
            <WithInitiativeGuard>
                <Child />
            </WithInitiativeGuard>
        );

        expect(Navigate).toHaveBeenCalledWith(
            expect.objectContaining({ to: ROUTES.INITIATIVES_LIST, replace: true }),
            {}
        );
    });
});