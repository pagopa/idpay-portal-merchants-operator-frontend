import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import SideMenu from './SideMenu';
import { useAppSelector } from '../../redux/hooks';
import { useLocation } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: vi.fn(),
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
        <div data-testid={`accordion-${props.item.initiativeId}`} data-default-open={props.defaultOpen} />
    ),
}));

describe('SideMenu Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useLocation as Mock).mockReturnValue({ pathname: '/mock-path' });
        (useAppSelector as Mock).mockReturnValue(null);
    });

    it('defaults only the first initiative open on landing after loading, without navigating', () => {
        (useLocation as Mock).mockReturnValue({ pathname: '/initiatives-route' });
        const { rerender } = render(<SideMenu isOpen={true} />);
        (useAppSelector as Mock).mockReturnValue([
            { initiativeId: 'id-1', initiativeName: 'Initiative 1' },
            { initiativeId: 'id-2', initiativeName: 'Initiative 2' },
        ]);
        rerender(<SideMenu isOpen={true} />);
        expect(screen.getByTestId('accordion-id-1')).toHaveAttribute('data-default-open', 'true');
        expect(screen.getByTestId('accordion-id-2')).toHaveAttribute('data-default-open', 'false');
        expect(mockNavigate).not.toHaveBeenCalled();

        (useLocation as Mock).mockReturnValue({ pathname: '/id-2/details' });
        rerender(<SideMenu isOpen={true} />);
        expect(screen.getByTestId('accordion-id-1')).toHaveAttribute('data-default-open', 'false');
        expect(screen.getByTestId('accordion-id-2')).toHaveAttribute('data-default-open', 'false');
        (useLocation as Mock).mockReturnValue({ pathname: '/initiatives-route' });
        rerender(<SideMenu isOpen={true} />);
        expect(screen.getByTestId('accordion-id-1')).toHaveAttribute('data-default-open', 'true');
        (useLocation as Mock).mockReturnValue({ pathname: '/profile-route' });
        rerender(<SideMenu isOpen={true} />);
        expect(screen.getByTestId('accordion-id-1')).toHaveAttribute('data-default-open', 'false');
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('renders correctly when isOpen is true', () => {
        render(<SideMenu isOpen={true} />);
        
        expect(screen.getByTestId('first-list-test')).toBeInTheDocument();
        expect(screen.getByTestId('sidenav-item-commons.sideMenu.initiatives')).toBeInTheDocument();
        expect(screen.getByTestId('sidenav-item-commons.sideMenu.profile')).toBeInTheDocument();
    });

    it('renders correctly when isOpen is false', () => {
        render(<SideMenu isOpen={false} />);
        
        expect(screen.getByTestId('first-list-test')).toBeInTheDocument();
    });

    it('navigates to initiatives list when the initiatives item is clicked', () => {
        render(<SideMenu isOpen={true} />);
        
        const initiativesButton = screen.getByTestId('sidenav-item-commons.sideMenu.initiatives');
        fireEvent.click(initiativesButton);
        
        expect(mockNavigate).toHaveBeenCalledWith('/initiatives-route', { replace: true });
    });

    it('navigates to profile when the profile item is clicked', () => {
        render(<SideMenu isOpen={true} />);
        
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

        render(<SideMenu isOpen={true} />);
        
        expect(screen.getByTestId('accordion-id-1')).toBeInTheDocument();
        expect(screen.getByTestId('accordion-id-2')).toBeInTheDocument();
    });
});
