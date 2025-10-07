import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../Header/Header', () => ({
  default: () => <div data-testid="header-mock" />,
}));
vi.mock('../SideMenu/SideMenu', () => ({
  default: () => <div data-testid="side-menu-mock" />,
}));
vi.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  Footer: () => <div data-testid="footer-mock" />,
}));

vi.mock('../../routes', () => ({
  default: {
    HOME: '/home',
    PROFILE: '/profilo',
    BUY_MANAGEMENT: '/gestione-acquisti',
    REFUNDS_MANAGEMENT: '/gestione-rimborsi',
    SOME_OTHER_PAGE: '/altra-pagina',
    PRIVACY_POLICY: '/privacy',
    TOS: '/termini-e-condizioni',
    PRODUCTS: '/prodotti',
  },
}));

import Layout from './Layout';
import ROUTES from '../../routes';

const renderInRouter = (initialRoute: string, children: React.ReactNode) => {
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="*" element={<Layout>{children}</Layout>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Layout Component', () => {
  it('should render header, footer and children', () => {
    renderInRouter('/rotta-test', <div>Contenuto Figlio</div>);
    expect(screen.getByTestId('header-mock')).toBeInTheDocument();
    expect(screen.getByTestId('footer-mock')).toBeInTheDocument();
    expect(screen.getByText('Contenuto Figlio')).toBeInTheDocument();
  });

  it.each([
    { route: ROUTES.HOME },
    { route: ROUTES.PROFILE },
    { route: ROUTES.BUY_MANAGEMENT },
    { route: ROUTES.REFUNDS_MANAGEMENT },
  ])('should show side menu for route $route', ({ route }) => {
    renderInRouter(route, null);
    expect(screen.getByTestId('side-menu-mock')).toBeInTheDocument();
  });

  it('should not show side menu for non matching routes', () => {
    renderInRouter('/rotta-test', null);
    expect(screen.queryByTestId('side-menu-mock')).not.toBeInTheDocument();
  });

  it('should apply maxWidth: 920px for standard routes without SideMenu', () => {
    const childTestId = 'child-content';
    renderInRouter('/rotta-test', <div data-testid={childTestId}>Contenuto</div>);
    const contentContainer = screen.getByTestId(childTestId).parentElement;
    expect(contentContainer).toHaveStyle('max-width: 920px');
  });

  it.each([
    { route: ROUTES.PRIVACY_POLICY },
    { route: ROUTES.TOS },
  ])('should apply maxWidth: 100% for route $route', ({ route }) => {
    const childTestId = 'child-content';
    renderInRouter(route, <div data-testid={childTestId}>Policy</div>);
    const contentContainer = screen.getByTestId(childTestId).parentElement;
    expect(contentContainer).toHaveStyle('max-width: 100%');
  });
});