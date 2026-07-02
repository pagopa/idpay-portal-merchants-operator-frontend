import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatusChip } from './StatusChip';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';

vi.mock('../../hooks/useScopedTranslation', () => ({
  useScopedTranslation: vi.fn(),
}));

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

  it('should show correct chip label and color', () => {
    mockT.mockReturnValue('In corso');
    mockConfig.mockReturnValue({label: 'commons.statusEnum.initiative.published', color: 'success'});

    render(<StatusChip field="initiative" value="published" />);

    expect(mockT).toHaveBeenCalledWith('commons.statusEnum.initiative.published');

    expect(mockConfig).toHaveBeenCalledWith('commons.statusEnum.initiative.published');

    const chipLabel = screen.getByText('In corso');
    expect(chipLabel).toBeInTheDocument();

    const chipContainer = chipLabel.closest('.MuiChip-root');
    expect(chipContainer).toHaveClass('MuiChip-colorSuccess');
    expect(chipContainer).toHaveClass('MuiChip-sizeSmall');
  });
});