import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { useParams, Navigate, matchPath } from 'react-router-dom';
import {
  currentInitiativeSelector,
  initiativesListSelector,
  setCurrentInitiativeId,
} from '../redux/slices/initiativesSlice';
import { useInitiativeStatusAction } from '../hooks/useInitiativeStatusAction';
import { useScopedTranslation } from '../hooks/useScopedTranslation';
import ROUTES from '../routes';
import WithInitiativeGuard from './withInitiativeGuard';

const mockDispatch = vi.fn();

vi.mock('../hooks/useScopedTranslation', () => ({
  useScopedTranslation: vi.fn(() => ({
    config: vi.fn(() => []),
  })),
}));

vi.mock('../hooks/useInitiativeStatusAction', () => ({
  useInitiativeStatusAction: vi.fn(() => ({
    isActionPermitted: true,
  })),
}));

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
  Navigate: vi.fn(() => null),
  useLocation: vi.fn(() => ({ pathname: '/test' })),
  matchPath: vi.fn(),
}));

vi.mock('../redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: vi.fn((selectorFn) => selectorFn({})),
}));

vi.mock('../redux/slices/initiativesSlice', () => ({
  initiativesListSelector: vi.fn(() => []),
  currentInitiativeSelector: vi.fn(),
  setCurrentInitiativeId: vi.fn((id) => ({
    type: 'initiatives/setCurrentInitiativeId',
    payload: id,
  })),
}));

vi.mock('../routes', () => ({
  default: {
    INITIATIVES_LIST: '/initiatives-list',
    CLOSED_ROUTE: '/closed-route',
  },
}));

describe('WithInitiativeGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (initiativesListSelector as Mock).mockReturnValue([]);
    (useInitiativeStatusAction as Mock).mockReturnValue({ isActionPermitted: true });
    (useScopedTranslation as Mock).mockReturnValue({
      config: vi.fn(() => []),
    });
  });

  const Child = () => <div>Protected Content</div>;

  it('renders children and dispatches setCurrentInitiativeId when no initiativeId is present', () => {
    (useParams as Mock).mockReturnValue({});
    (currentInitiativeSelector as Mock).mockReturnValue(undefined);

    render(
      <WithInitiativeGuard>
        <Child />
      </WithInitiativeGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockDispatch).toHaveBeenCalledWith(setCurrentInitiativeId(undefined));
    expect(Navigate).not.toHaveBeenCalled();
  });

  it('renders children when route and initiative are valid', () => {
    (useParams as Mock).mockReturnValue({ initiativeId: '123' });
    (initiativesListSelector as Mock).mockReturnValue([{ initiativeId: '123' }]);
    (currentInitiativeSelector as Mock).mockReturnValue({ initiativeId: '123' });

    render(
      <WithInitiativeGuard>
        <Child />
      </WithInitiativeGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockDispatch).toHaveBeenCalledWith(setCurrentInitiativeId('123'));
    expect(Navigate).not.toHaveBeenCalled();
  });

  it('redirects when initiativeId is present but selectedInitiative is missing', () => {
    (useParams as Mock).mockReturnValue({ initiativeId: '999' });
    (initiativesListSelector as Mock).mockReturnValue([{ initiativeId: '123' }]);
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

  it('redirects when action is not permitted and route is matched in forbidden routes', () => {
    (useParams as Mock).mockReturnValue({ initiativeId: '123' });
    (initiativesListSelector as Mock).mockReturnValue([{ initiativeId: '123' }]);
    (currentInitiativeSelector as Mock).mockReturnValue({ initiativeId: '123' });
    (useInitiativeStatusAction as Mock).mockReturnValue({ isActionPermitted: false });
    (useScopedTranslation as Mock).mockReturnValue({
      config: vi.fn(() => ['CLOSED_ROUTE']),
    });
    (matchPath as Mock).mockReturnValue({ path: '/closed-route' });

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