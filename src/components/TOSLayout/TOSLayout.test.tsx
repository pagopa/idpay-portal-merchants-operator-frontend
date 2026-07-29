import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TOSLayout from './TOSLayout';

vi.mock('../Header/Header', () => ({
  default: () => <div data-testid="header">MockHeader</div>,
}));

vi.mock('../Footer/CustomFooter', () => ({
  CustomFooter: () => <div data-testid="footer">MockCustomFooter</div>,
}));

describe('TOSLayout component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the header, children, and footer', () => {
    render(
      <TOSLayout>
        <div data-testid="child">Terms of service content</div>
      </TOSLayout>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toHaveTextContent('Terms of service content');
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders correctly without children', () => {
    render(<TOSLayout />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
