import '@testing-library/jest-dom';
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@mui/material', () => ({
  Link: ({ children, href, target }: { children: ReactNode; href: string; target: string }) => (
    <a href={href} target={target}>
      {children}
    </a>
  ),
  Tooltip: ({ children, title }: { children: ReactNode; title: ReactNode }) => (
    <div data-tooltip={title}>{children}</div>
  ),
  Typography: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

vi.mock('@pagopa/mui-italia', () => ({
  theme: {
    palette: { primary: { main: '#000000' } },
    typography: { fontWeightMedium: 500 },
  },
}));

import { Link } from './Link';

describe('Link component', () => {
  it('renders a labeled link with the expected href and target', () => {
    render(<Link label="PagoPA" href="https://www.pagopa.it" />);

    const link = screen.getByRole('link', { name: 'PagoPA' });

    expect(link).toHaveAttribute('href', 'https://www.pagopa.it');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders the label when the tooltip is enabled', () => {
    render(<Link label="Documentation" href="/documentation" tooltip />);

    expect(screen.getByRole('link', { name: 'Documentation' })).toBeInTheDocument();
  });

  it('renders the missing-data placeholder when no label is provided', () => {
    render(<Link label="" href="https://www.pagopa.it" />);

    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('uses the missing-data placeholder as the tooltip content when no label is provided', () => {
    render(<Link label="" href="https://www.pagopa.it" tooltip />);

    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
