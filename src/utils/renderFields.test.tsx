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
    name,
  }: {
    label: string;
    href: string;
    tooltip?: boolean;
    name?: string;
  }) => <span data-testid="link">{`${label}-${href}-${tooltip}-${name}`}</span>,
}));

vi.mock('../components/Link/OptionalLink', () => ({
  OptionalLink: ({
    value,
    name,
    tooltip,
  }: {
    value?: string;
    name?: string;
    tooltip?: boolean;
  }) => <span data-testid="optional-link">{`${value}-${name}-${tooltip}`}</span>,
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
  renderText: vi.fn(({ text }) => text ?? ''),
}));

describe('renderFields', () => {
  const fields = renderFields({ 
    tooltip: true, 
    bold: true, 
    options: { key1: 'Mapped Value', locale: 'en' }, 
    context: 'status' 
  });

  it('renders text, date, and euro fields', () => {
    const { rerender } = render(<>{fields.text({ value: 'Text value' })}</>);
    expect(screen.getByText('Text value')).toBeInTheDocument();

    rerender(<>{fields.text({ value: 'key1' })}</>);
    expect(screen.getByText('Mapped Value')).toBeInTheDocument();

    rerender(<>{fields.date({ value: '2026-01-01' })}</>);
    expect(screen.getByText('formatted date')).toBeInTheDocument();

    rerender(<>{fields.euro({ value: 100 })}</>);
    expect(screen.getByText('formatted euro')).toBeInTheDocument();
  });

  it('renders text with fallback to params.value when key is not found in options', () => {
    render(<>{fields.text({ value: 'unmappedKey' })}</>);
    expect(screen.getByText('unmappedKey')).toBeInTheDocument();
  });

  it('renders text directly when options are not provided', () => {
    const customFields = renderFields({});
    render(<>{customFields.text({ value: 'Direct Value' })}</>);
    expect(screen.getByText('Direct Value')).toBeInTheDocument();
  });

  it('handles null or undefined value in text field gracefully', () => {
    const { container, rerender } = render(<>{fields.text({ value: null })}</>);
    expect(container).toBeInTheDocument();

    rerender(<>{fields.text({ value: undefined })}</>);
    expect(container).toBeInTheDocument();
  });

  it('renders a navigation field', () => {
    render(<>{fields.navigation({ value: 'Details', row: { route: '/details' } })}</>);
    expect(screen.getByTestId('navigation-link')).toHaveTextContent('Details-/details-true');
  });

  it('renders a link field', () => {
    render(<>{fields.link({ value: 'Website', field: 'web', row: { link: 'https://example.com' } })}</>);
    expect(screen.getByTestId('link')).toHaveTextContent('Website-https://example.com-true-web');
  });

  it('renders an optional link field', () => {
    render(<>{fields.optionalLink({ value: 'https://example.com', field: 'optLink' })}</>);
    expect(screen.getByTestId('optional-link')).toHaveTextContent('https://example.com-optLink-true');
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
            value: 'FileText',
            icon: <span>File</span>,
          }
        })}
      </>
    );

    const download = screen.getByTestId('download');
    expect(download).toHaveTextContent('FileText-false-true');

    fireEvent.click(download);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders an action field with info icon and invokes the action with the row', () => {
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

  it('renders an action field with arrow icon', () => {
    const onClick = vi.fn();
    const row = { id: 42 };

    render(
      <>
        {fields.action({
          value: { icon: 'arrow', onClick },
          row,
        })}
      </>
    );

    expect(screen.getByTestId('arrow-icon')).toBeInTheDocument();
  });
});