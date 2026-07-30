import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { StatusChip } from './StatusChip';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';

vi.mock('../../hooks/useScopedTranslation', () => ({
  useScopedTranslation: vi.fn(),
}));

vi.mock('@mui/material', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mui/material')>();
  return {
    ...actual,
    Tooltip: ({ children, title }: { children: React.ReactNode; title: any }) => (
      <div data-testid="mock-tooltip" data-title={title ? title.toString() : 'false'}>
        {children}
      </div>
    ),
  };
});

describe('StatusChip', () => {
  const mockT = vi.fn();
  const mockConfig = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useScopedTranslation).mockReturnValue({
      t: mockT,
      config: mockConfig,
    });
  });

  it('should show correct chip label and color when value is provided', () => {
    mockT.mockReturnValue('In corso');
    mockConfig.mockReturnValue({ label: 'commons.statusEnum.initiative.published', color: 'success' });

    render(<StatusChip context="initiative" value="published" />);

    expect(mockT).toHaveBeenCalledWith('commons.statusEnum.initiative.published');
    expect(mockConfig).toHaveBeenCalledWith('initiative.published');

    const chipLabel = screen.getByText('In corso');
    expect(chipLabel).toBeInTheDocument();

    const chipContainer = chipLabel.closest('.MuiChip-root');
    expect(chipContainer).toHaveClass('MuiChip-colorSuccess');
    expect(chipContainer).toHaveClass('MuiChip-sizeSmall');
    expect(screen.getByTestId('mock-tooltip')).toHaveAttribute('data-title', 'false');
  });

  it('should render missing data placeholder when value is empty', () => {
    mockConfig.mockReturnValue({ label: 'commons.statusEnum.initiative.', color: 'default' });

    const { container } = render(<StatusChip context="initiative" value="" />);

    expect(screen.getByText(MISSING_DATA_PLACEHOLDER)).toBeInTheDocument();
    expect(container.querySelector('.MuiChip-root')).not.toBeInTheDocument();
  });

  it('should display translated tooltip title when tooltip prop is true and value exists', () => {
    mockT.mockReturnValue('In corso');
    mockConfig.mockReturnValue({ label: 'commons.statusEnum.initiative.published', color: 'success' });

    render(<StatusChip context="initiative" value="published" tooltip />);

    expect(screen.getByTestId('mock-tooltip')).toHaveAttribute('data-title', 'In corso');
  });

  it('should display placeholder as tooltip title when tooltip prop is true and value is empty', () => {
    mockConfig.mockReturnValue({ label: 'commons.statusEnum.initiative.', color: 'default' });

    render(<StatusChip context="initiative" value="" tooltip />);

    expect(screen.getByTestId('mock-tooltip')).toHaveAttribute('data-title', MISSING_DATA_PLACEHOLDER);
  });
});