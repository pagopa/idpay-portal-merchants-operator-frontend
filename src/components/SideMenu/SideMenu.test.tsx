import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock external dependencies

// Mock navigate function
const mockNavigate = vi.fn();

// Mock 'react-router-dom' hooks
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: vi.fn(() => ({ pathname: '' })),
}));

// Mock 'react-i18next'
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock 'SideNavItem' component
vi.mock('./SideNavItem', () => ({
  default: ({ title, handleClick, isSelected, icon: Icon }: any) => (
    <div
      data-testid={`sidenav-item-${title}`}
      data-selected={isSelected} // Usiamo un attributo per verificare la selezione
      onClick={handleClick}
    >
      {title}
      <Icon />
    </div>
  ),
}));

// Mock icons and routes
vi.mock('@mui/icons-material/ConfirmationNumber', () => ({ default: () => <div /> }));
vi.mock('@mui/icons-material/Payments', () => ({ default: () => <div /> }));
vi.mock('../../routes', () => ({
  default: {
    BUY_MANAGEMENT: '/gestione-acquisti',
    HOME: '/home', 
  },
}));


// Import component to test and mocked dependencies
import SideMenu from './SideMenu';
import ROUTES from '../../routes';


//Test suite
describe('SideMenu Component', () => {

  // Before each test, clear mocks to avoid interference
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render both menu items', () => {
    render(<SideMenu />);

    expect(screen.getByText('sideMenu.purchaseManagement')).toBeInTheDocument();
    expect(screen.getByText('sideMenu.refundManagement')).toBeInTheDocument();
  });


  it('should navigate to purchase management on click', async () => {
    const user = userEvent.setup();
    render(<SideMenu />);

    const purchaseItem = screen.getByText('sideMenu.purchaseManagement');
    await user.click(purchaseItem);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.BUY_MANAGEMENT, { replace: true });
  });

  it('should navigate to refund management on click', async () => {
    const user = userEvent.setup();
    render(<SideMenu />);
    
    const refundItem = screen.getByText('sideMenu.refundManagement');
    await user.click(refundItem);
    
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.HOME, { replace: true });
  });
});