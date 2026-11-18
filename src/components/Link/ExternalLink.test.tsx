import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExternalLink } from './ExternalLink';

describe('ExternalLink', () => {
  it.each([
    'https://example.com/spec.pdf',
    'http://example.com/spec.pdf',
    'www.example.com/spec.pdf',
  ])('opens %s safely', (value) => {
    render(<ExternalLink value={value} tooltip />);
    const link = screen.getByRole('link', { name: value });
    expect(link).toHaveAttribute('href', value.startsWith('www.') ? `https://${value}` : value);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveStyle({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: '100%',
    });
  });

  it('shows the complete URL in the tooltip', async () => {
    const value = `https://example.com/${'specification'.repeat(20)}.pdf`;
    render(<ExternalLink value={value} tooltip />);
    fireEvent.mouseOver(screen.getByRole('link'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(value);
  });

  it.each([
    undefined,
    '',
    ' ',
    'invalid',
    '/relative',
    'javascript:alert(1)',
    'data:text/html,test',
    'ftp://example.com',
  ])('does not link invalid or missing value %s', (value) => {
    render(<ExternalLink value={value} tooltip />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
