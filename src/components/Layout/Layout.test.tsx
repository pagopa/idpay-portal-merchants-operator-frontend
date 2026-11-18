import { render, screen } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import Layout from './Layout';
import ROUTES from '../../routes';
import { useLocation } from 'react-router-dom';

vi.mock('../Header/Header', () => ({
  default: () => <div data-testid="header">MockHeader</div>,
}));
vi.mock('../SideMenu/SideMenu', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="sidemenu">
      <span>SideMenu is {isOpen ? 'open' : 'closed'}</span>
    </div>
  ),
}));

vi.mock('../Footer/CustomFooter', () => ({
  CustomFooter: () => <div data-testid="footer">MockCustomFooter</div>,
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

describe('Layout component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders header and footer always', () => {
    (useLocation as vi.Mock).mockReturnValue({ pathname: ROUTES.HOME });
    render(
      <Layout>
        <div data-testid="child">ChildContent</div>
      </Layout>
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders SideMenu when route matches', () => {
    (useLocation as vi.Mock).mockReturnValue({ pathname: ROUTES.PRODUCTS });
    render(
      <Layout>
        <div data-testid="child">ChildContent</div>
      </Layout>
    );
    expect(screen.getByTestId('sidemenu')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders single column layout when route does not match', () => {
    (useLocation as vi.Mock).mockReturnValue({ pathname: '/random' });
    render(
      <Layout>
        <div data-testid="child">ChildContent</div>
      </Layout>
    );
    expect(screen.queryByTestId('sidemenu')).not.toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('applies maxWidth=100% for privacy policy and tos routes', () => {
    (useLocation as vi.Mock).mockReturnValue({
      pathname: ROUTES.PRIVACY_POLICY,
    });
    const { rerender } = render(
      <Layout>
        <div data-testid="child">ChildContent</div>
      </Layout>
    );

    (useLocation as vi.Mock).mockReturnValue({ pathname: ROUTES.TOS });
    rerender(
      <Layout>
        <div data-testid="child">ChildContent</div>
      </Layout>
    );
  });

  it('keeps the SideMenu open', () => {
    (useLocation as vi.Mock).mockReturnValue({ pathname: ROUTES.HOME });
    render(<Layout />);

    const sideMenuContainer = screen.getByTestId('sidemenu').parentElement;
    expect(sideMenuContainer).toHaveStyle('width: 300px');
    expect(screen.getByText('SideMenu is open')).toBeInTheDocument();
  });
});
