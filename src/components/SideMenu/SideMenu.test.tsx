import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: vi.fn(() => ({ pathname: '' })),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('./SideNavItem', () => ({
  default: ({ title, handleClick, isSelected, icon: Icon }: any) => (
    <div data-testid={`sidenav-item-${title}`} data-selected={isSelected} onClick={handleClick}>
      {title}
      <Icon />
    </div>
  ),
}));

vi.mock('@mui/icons-material/ConfirmationNumber', () => ({
  default: () => <div />,
}));
vi.mock('@mui/icons-material/Payments', () => ({ default: () => <div /> }));
vi.mock('../../routes', () => ({
  default: {
    BUY_MANAGEMENT: '/gestione-acquisti',
    HOME: '/home',
  },
}));

import SideMenu from './SideMenu';
import ROUTES from '../../routes';

describe('SideMenu Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render both menu items', () => {
    render(<SideMenu isOpen={true} setIsOpen={() => {}} />);

    expect(screen.getByText('sideMenu.purchaseManagement')).toBeInTheDocument();
    expect(screen.getByText('sideMenu.refundManagement')).toBeInTheDocument();
  });

  it('should navigate to purchase management on click', async () => {
    const user = userEvent.setup();
    render(<SideMenu isOpen={true} setIsOpen={() => {}} />);

    const purchaseItem = screen.getByText('sideMenu.purchaseManagement');
    await user.click(purchaseItem);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.BUY_MANAGEMENT, {
      replace: true,
    });
  });

  it('should navigate to refund management on click', async () => {
    const user = userEvent.setup();
    render(<SideMenu isOpen={true} setIsOpen={() => {}} />);

    const refundItem = screen.getByText('sideMenu.refundManagement');
    await user.click(refundItem);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.REFUNDS_MANAGEMENT, {
      replace: true,
    });
  });

  it('should navigate to profile on click', async () => {
    const user = userEvent.setup();
    render(<SideMenu isOpen={true} setIsOpen={() => {}} />);

    const profileItem = screen.getByText('sideMenu.profile');
    await user.click(profileItem);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.PROFILE, {
      replace: true,
    });
  });

  it('should toggle menu on click', async () => {
    const user = userEvent.setup();
    const setIsOpen = vi.fn();
    render(<SideMenu isOpen={true} setIsOpen={setIsOpen} />);

    const toggleButton = screen.getByTestId('MenuIcon');
    await user.click(toggleButton);

    expect(setIsOpen).toHaveBeenCalledTimes(1);
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });
});
