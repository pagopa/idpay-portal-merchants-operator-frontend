import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocation } from 'react-router-dom';
import { SideNavAccordion } from './SideNavAccordion';
import { PointOfSaleInitiativeDetailedDTO } from '../../api/generated/data-contracts';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: vi.fn(),
}));

vi.mock('../../hooks/useScopedTranslation', () => ({
    useScopedTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('./config', () => ({
    config: [
        { key: '1', title: 'mockTitle1', route: '/base/:initiativeId/route1', icon: 'icon1', dataTestId: 'test-item-1' },
        { key: '2', title: 'mockTitle2', route: '/base/:initiativeId/route2', icon: 'icon2', dataTestId: 'test-item-2' }
    ]
}));

vi.mock('./SideNavItem', () => ({
    default: (props: any) => (
        <div data-testid={props['data-testid']} onClick={props.handleClick}>
            {props.title} {props.isSelected ? 'selected' : ''}
        </div>
    )
}));

describe('SideNavAccordion', () => {
    const mockItem = {
        initiativeId: 'init-123',
        initiativeName: 'Point Of Sale Initiative'
    } as PointOfSaleInitiativeDetailedDTO;

    beforeEach(() => {
        vi.clearAllMocks();
        (useLocation as any).mockReturnValue({ pathname: '/' });
    });

    it('renders initials inside tooltip when isOpen is false', () => {
        render(<SideNavAccordion item={mockItem} isOpen={false} />);
        expect(screen.getByText('POSI')).toBeInTheDocument();
    });

    it('renders full initiative name when isOpen is true', () => {
        render(<SideNavAccordion item={mockItem} isOpen={true} />);
        expect(screen.getByText('Point Of Sale Initiative')).toBeInTheDocument();
    });

    it('expands accordion automatically when defaultOpen is true', () => {
        render(<SideNavAccordion item={mockItem} defaultOpen={true} />);
        const accordionHeader = screen.getByRole('button', { name: 'Point Of Sale Initiative' });
        expect(accordionHeader).toHaveAttribute('aria-expanded', 'true');
    });

    it('expands accordion automatically when location pathname includes initiativeId', () => {
        (useLocation as any).mockReturnValue({ pathname: '/init-123/details' });
        render(<SideNavAccordion item={mockItem} />);
        const accordionHeader = screen.getByRole('button', { name: 'Point Of Sale Initiative' });
        expect(accordionHeader).toHaveAttribute('aria-expanded', 'true');
    });

    it('calls navigate with the first config route when accordion is changed', () => {
        render(<SideNavAccordion item={mockItem} />);
        const accordionClickArea = screen.getByTestId('accordion-click-test').querySelector('.MuiAccordionSummary-root');
        
        if (accordionClickArea) {
            fireEvent.click(accordionClickArea);
        }
        
        expect(mockNavigate).toHaveBeenCalledWith('/base/init-123/route1', { replace: true });
    });

    it('renders mapped SideNavItem components with expected props', () => {
        render(<SideNavAccordion item={mockItem} isOpen={true} />);
        expect(screen.getByTestId('test-item-1')).toBeInTheDocument();
        expect(screen.getByTestId('test-item-2')).toBeInTheDocument();
        expect(screen.getByText('mockTitle1')).toBeInTheDocument();
        expect(screen.getByText('mockTitle2')).toBeInTheDocument();
    });

    it('triggers navigation when a SideNavItem is clicked', () => {
        render(<SideNavAccordion item={mockItem} isOpen={true} />);
        fireEvent.click(screen.getByTestId('test-item-2'));
        expect(mockNavigate).toHaveBeenCalledWith('/base/init-123/route2', { replace: true });
    });

    it('passes isSelected as true to SideNavItem if location matches path', () => {
        (useLocation as any).mockReturnValue({ pathname: '/base/init-123/route1' });
        render(<SideNavAccordion item={mockItem} isOpen={true} />);
        expect(screen.getByText('mockTitle1 selected')).toBeInTheDocument();
    });
});