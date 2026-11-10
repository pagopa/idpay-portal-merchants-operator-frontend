import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DynamicDrawer from '../../components/DynamicDrawer/DynamicDrawer';
import decoder from '../../locale/it/bonusDecoder2026/config.json';
import appliances from '../../locale/it/bonusElettrodomestici2025/config.json';

vi.mock('@pagopa/mui-italia', () => ({
  theme: {
    palette: {
      text: { primary: '#000', secondary: '#666' },
      background: { paper: '#fff' },
      primary: { main: '#0066cc' },
    },
    typography: { fontWeightBold: 700, fontWeightMedium: 600, fontWeightRegular: 400 },
  },
}));

vi.mock('../../components/DownloadFile/DownloadFile', () => ({ DownloadFile: () => null }));
vi.mock('../../components/NavigationLink/NavigationLink', () => ({ NavigationLink: () => null }));

vi.mock('../../hooks/useScopedTranslation', () => ({
  useScopedTranslation: () => ({ t: (key: string) => key }),
}));

describe('decoder product details configuration', () => {
  it.each([
    [true, 'Sì', 'LAN', 'LAN'],
    [false, 'No', 'WIFI', 'WI-FI'],
    [false, 'No', 'LAN e WIFI', 'LAN e WI-FI'],
    [true, 'Sì', 'Nessuna', 'Nessuna'],
  ])(
    'renders SCART %s and IP %s through the real drawer',
    (scart, expectedScart, connectivity, expectedIp) => {
      render(
        <DynamicDrawer
          isOpen
          setIsOpen={() => {}}
          title="Decoder"
          fieldsDef={decoder.pages.products.drawer}
          fieldsValues={{
            productCode: 'INTERNAL-123',
            scart,
            connectivity,
            technicalSheetUrl: 'www.example.com/spec.pdf',
          }}
        />
      );
      expect(screen.getByText(expectedScart)).toBeInTheDocument();
      expect(screen.getByText(expectedIp)).toBeInTheDocument();
      expect(screen.getByText('INTERNAL-123')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', 'https://www.example.com/spec.pdf');
    }
  );

  it('has exactly the three accepted category choices', () => {
    expect(decoder.templates.categories.map(({ value }) => value)).toEqual(['DS', 'DT', 'DTS']);
  });

  it('keeps additional fields confined to decoder details', () => {
    const fields = ['scart', 'connectivity', 'technicalSheetUrl'];
    expect(
      decoder.pages.products.productsTable.columns.some(({ field }) => fields.includes(field))
    ).toBe(false);
    expect(appliances.pages.products.drawer.some(({ field }) => fields.includes(field))).toBe(
      false
    );
  });
});
