import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SideNavAccordion } from './SideNavAccordion';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  pathname: '',
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
  useLocation: () => ({ pathname: mocks.pathname }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => `translated:${key}`,
  }),
}));

vi.mock('@mui/material', async () => {
  const React = await import('react');

  return {
    Accordion: ({ children, expanded, onChange, disableGutters, elevation, sx, ...props }: any) => (
      <div className={expanded ? 'Mui-expanded' : ''} {...props}>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as any, { onAccordionChange: onChange })
            : child
        )}
      </div>
    ),
    AccordionSummary: ({ children, onAccordionChange, expandIcon, sx, ...props }: any) => (
      <button
        {...props}
        onClick={() => onAccordionChange?.({ stopPropagation: vi.fn() })}
        type="button"
      >
        {children}
      </button>
    ),
    AccordionDetails: ({ children }: any) => <div>{children}</div>,
    List: ({ children }: any) => <div>{children}</div>,
    ListItemText: ({ primary }: any) => <span>{primary}</span>,
    Tooltip: ({ children }: any) => <>{children}</>,
  };
});

vi.mock('@mui/icons-material/ExpandMore', () => ({
  default: () => <span />,
}));

vi.mock('./SideNavItem', () => ({
  default: ({ title, handleClick, isSelected }: any) => (
    <button data-selected={isSelected} onClick={handleClick} type="button">
      {title}
    </button>
  ),
}));

const item = {
  initiativeId: 'initiative-1',
  initiativeName: 'Bonus Elettrodomestici',
};

describe('SideNavAccordion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pathname = '';
  });

  it('renders the initiative name when the side menu is open', () => {
    render(<SideNavAccordion item={item} isOpen={true} />);

    expect(screen.getByText('Bonus Elettrodomestici')).toBeInTheDocument();
  });

  it('renders initiative initials when the side menu is closed', () => {
    render(<SideNavAccordion item={item} isOpen={false} />);

    expect(screen.getByText('BE')).toBeInTheDocument();
  });

  it('expands and selects the matching route item from the current path', () => {
    mocks.pathname = '/initiative-1/gestione-rimborsi';

    render(<SideNavAccordion item={item} isOpen={true} />);

    expect(screen.getByTestId('accordion-click-test')).toHaveClass('Mui-expanded');
    expect(screen.getByText('translated:sideMenu.refundManagement')).toHaveAttribute(
      'data-selected',
      'true'
    );
  });

  it('navigates to the first section when accordion summary is clicked', async () => {
    const user = userEvent.setup();
    render(<SideNavAccordion item={item} isOpen={true} />);

    await user.click(screen.getByRole('button', { name: /Bonus Elettrodomestici/i }));

    expect(mocks.navigate).toHaveBeenCalledWith('/initiative-1/gestione-acquisti', {
      replace: true,
    });
  });

  it('navigates to a section when a nested item is clicked', async () => {
    const user = userEvent.setup();
    mocks.pathname = '/initiative-1/gestione-acquisti';

    render(<SideNavAccordion item={item} isOpen={true} />);

    await user.click(screen.getByText('translated:sideMenu.products'));

    expect(mocks.navigate).toHaveBeenCalledWith('/initiative-1/prodotti', {
      replace: true,
    });
  });
});
