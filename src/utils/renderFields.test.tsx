import '@testing-library/jest-dom';
import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderFields } from './renderFields';

vi.mock('@mui/material', () => ({
  Box: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  IconButton: ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock('@mui/icons-material/InfoOutlined', () => ({
  default: () => <span data-testid="info-icon">Info</span>,
}));

vi.mock('@mui/icons-material/ChevronRight', () => ({
  default: () => <span data-testid="arrow-icon">Arrow</span>,
}));

vi.mock('../components/NavigationLink/NavigationLink', () => ({
  NavigationLink: ({
    label,
    path,
    tooltip,
  }: {
    label: string;
    path: string;
    tooltip?: boolean;
  }) => <span data-testid="navigation-link">{`${label}-${path}-${tooltip}`}</span>,
}));

vi.mock('../components/Link/Link', () => ({
  Link: ({
    label,
    href,
    tooltip,
  }: {
    label: string;
    href: string;
    tooltip?: boolean;
  }) => <span data-testid="link">{`${label}-${href}-${tooltip}`}</span>,
}));

vi.mock('../components/StatusChip/StatusChip', () => ({
  StatusChip: ({
    context,
    value,
    tooltip,
  }: {
    context?: string;
    value: string;
    tooltip?: boolean;
  }) => <span data-testid="chip">{`${context}-${value}-${tooltip}`}</span>,
}));

vi.mock('../components/DownloadFile/DownloadFile', () => ({
  DownloadFile: ({
    onClick,
    isLoading,
    text,
    icon,
    tooltip,
  }: {
    onClick: () => void;
    isLoading: boolean;
    text: string;
    icon: ReactNode;
    tooltip?: boolean;
  }) => (
    <button data-testid="download" onClick={onClick}>
      {`${text}-${isLoading}-${tooltip}`}
      {icon}
    </button>
  ),
}));

vi.mock('./helpers', () => ({
  formatDate: vi.fn(() => 'formatted date'),
  formatEuro: vi.fn(() => 'formatted euro'),
  renderText: vi.fn((value: string) => value),
}));

describe('renderFields', () => {
  const fields = renderFields({ 
    tooltip: true, 
    bold: true, 
    options: { locale: 'en' }, 
    context: 'status' 
  });

  it('renders text, date, and euro fields', () => {
    const { rerender } = render(<>{fields.text({ value: 'Text value' })}</>);
    expect(screen.getByText('Text value')).toBeInTheDocument();

    rerender(<>{fields.date({ value: '2026-01-01' })}</>);
    expect(screen.getByText('formatted date')).toBeInTheDocument();

    rerender(<>{fields.euro({ value: 100 })}</>);
    expect(screen.getByText('formatted euro')).toBeInTheDocument();
  });

  it('renders a navigation field', () => {
    render(<>{fields.navigation({ value: 'Details', row: { route: '/details' } })}</>);
    expect(screen.getByTestId('navigation-link')).toHaveTextContent('Details-/details-true');
  });

  it('renders a link field', () => {
    render(<>{fields.link({ value: 'Website', row: { link: 'https://example.com' } })}</>);
    expect(screen.getByTestId('link')).toHaveTextContent('Website-https://example.com-true');
  });

  it('renders a chip field with a normalized value', () => {
    render(<>{fields.chip({ value: 'ACTIVE' })}</>);
    expect(screen.getByTestId('chip')).toHaveTextContent('status-active-true');
  });

  it('renders a download field and forwards its parameters', () => {
    const onClick = vi.fn();

    render(
      <>
        {fields.download({
          value: 'Download',
          row: {
            onClick,
            isLoading: false,
            icon: <span>File</span>,
          }
        })}
      </>
    );

    const download = screen.getByTestId('download');
    expect(download).toHaveTextContent('Download-false-trueFile');

    fireEvent.click(download);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders an action field and invokes the action with the row', () => {
    const onClick = vi.fn();
    const row = { id: 42 };

    render(
      <>
        {fields.action({
          value: { icon: 'info', onClick },
          row,
        })}
      </>
    );

    expect(screen.getByTestId('info-icon')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith(row);
  });
});