import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StatusChip } from './StatusChip';

vi.mock('@mui/material', () => ({
  Chip: ({ label, color }: { label: string; color: string }) => (
    <span data-color={color}>{label}</span>
  ),
}));

vi.mock('../../hooks/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => `translated:${key}`,
    config: (key: string) =>
      key === 'commons.initiativeStatusEnum.PUBLISHED' ? 'success' : 'default',
  }),
}));

describe('StatusChip', () => {
  it('renders the translated status label', () => {
    render(<StatusChip value="PUBLISHED" />);

    expect(
      screen.getByText('translated:commons.initiativeStatusEnum.PUBLISHED')
    ).toBeInTheDocument();
  });

  it('applies the color configured for the status', () => {
    render(<StatusChip value="PUBLISHED" />);

    expect(screen.getByText(/PUBLISHED/)).toHaveAttribute('data-color', 'success');
  });
});
