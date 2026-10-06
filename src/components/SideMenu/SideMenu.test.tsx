import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import SideMenu from './SideMenu';
import { useAppSelector } from '../../redux/hooks';

const mockNavigate = vi.fn();
const mockSetIsOpen = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/mock-path' }),
}));

vi.mock('../../hooks/useScopedTranslation', () => ({
    useScopedTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../redux/hooks', () => ({
    useAppSelector: vi.fn(),
}));

vi.mock('../../redux/slices/initiativesSlice', () => ({
    initiativesListSelector: vi.fn(),
}));

vi.mock('../../routes', () => ({
    default: {
        INITIATIVES_LIST: '/initiatives-route',
        PROFILE: '/profile-route',
    },
}));

vi.mock('@pagopa/mui-italia', () => ({
    theme: {
        palette: {
            text: { primary: '#000000' },
        },
    },
}));

vi.mock('./SideMenu.module.css', () => ({
    default: {
        sideMenuBurger: 'mock-burger-class',
    },
}));

vi.mock('./SideNavItem', () => ({
    default: (props: any) => (
        <button
            data-testid={`sidenav-item-${props.title}`}
            onClick={props.handleClick}
        >
            {props.title}
        </button>
    ),
}));

vi.mock('./SideNavAccordion', () => ({
    SideNavAccordion: (props: any) => (
        <div data-testid={`accordion-${props.item.initiativeId}`} />
    ),
}));

describe('SideMenu Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useAppSelector as Mock).mockReturnValue(null);
    });

    it('renders correctly when isOpen is true', () => {
        render(<SideMenu isOpen={true} setIsOpen={mockSetIsOpen} />);
        
        expect(screen.getByTestId('first-list-test')).toBeInTheDocument();
        expect(screen.getByTestId('sidenav-item-commons.sideMenu.initiatives')).toBeInTheDocument();
        expect(screen.getByTestId('sidenav-item-commons.sideMenu.profile')).toBeInTheDocument();
    });

    it('renders correctly when isOpen is false', () => {
        render(<SideMenu isOpen={false} setIsOpen={mockSetIsOpen} />);
        
        expect(screen.getByTestId('first-list-test')).toBeInTheDocument();
    });

    it('navigates to initiatives list when the initiatives item is clicked', () => {
        render(<SideMenu isOpen={true} setIsOpen={mockSetIsOpen} />);
        
        const initiativesButton = screen.getByTestId('sidenav-item-commons.sideMenu.initiatives');
        fireEvent.click(initiativesButton);
        
        expect(mockNavigate).toHaveBeenCalledWith('/initiatives-route', { replace: true });
    });

    it('navigates to profile when the profile item is clicked', () => {
        render(<SideMenu isOpen={true} setIsOpen={mockSetIsOpen} />);
        
        const profileButton = screen.getByTestId('sidenav-item-commons.sideMenu.profile');
        fireEvent.click(profileButton);
        
        expect(mockNavigate).toHaveBeenCalledWith('/profile-route', { replace: true });
    });

    it('renders SideNavAccordion for each initiative in the list', () => {
        const mockInitiativesList = [
            { initiativeId: 'id-1', initiativeName: 'Initiative 1' },
            { initiativeId: 'id-2', initiativeName: 'Initiative 2' },
        ];
        (useAppSelector as Mock).mockReturnValue(mockInitiativesList);

        render(<SideMenu isOpen={true} setIsOpen={mockSetIsOpen} />);
        
        expect(screen.getByTestId('accordion-id-1')).toBeInTheDocument();
        expect(screen.getByTestId('accordion-id-2')).toBeInTheDocument();
    });
});