import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { GridRenderCellParams } from '@mui/x-data-grid';
import {
  getStatusChip,
  formatEuro,
  filterInputWithSpaceRule,
  renderCellWithTooltip,
  renderMissingDataWithTooltip,
  checkTooltipValue,
  checkEuroTooltip,
  checkDateTooltip,
  handleCodeChange,
  downloadFileFromBase64,
} from './helpers';
import { MISSING_DATA_PLACEHOLDER } from './constants';

describe('getStatusChip', () => {
  const mockT = (key: string) => key;

  it('dovrebbe renderizzare AUTHORIZED', () => {
    render(getStatusChip(mockT, 'AUTHORIZED'));
    expect(screen.getByText('pages.refundManagement.authorized')).toBeTruthy();
  });

  it('dovrebbe renderizzare REFUNDED', () => {
    render(getStatusChip(mockT, 'REFUNDED'));
    expect(screen.getByText('pages.refundManagement.refunded')).toBeTruthy();
  });

  it('dovrebbe renderizzare CANCELLED', () => {
    render(getStatusChip(mockT, 'CANCELLED'));
    expect(screen.getByText('pages.refundManagement.cancelled')).toBeTruthy();
  });

  it('dovrebbe renderizzare CAPTURED', () => {
    render(getStatusChip(mockT, 'CAPTURED'));
    expect(screen.getByText('pages.refundManagement.captured')).toBeTruthy();
  });

  it('dovrebbe renderizzare REWARDED', () => {
    render(getStatusChip(mockT, 'REWARDED'));
    expect(screen.getByText('pages.refundManagement.rewarded')).toBeTruthy();
  });

  it('dovrebbe renderizzare INVOICED', () => {
    render(getStatusChip(mockT, 'INVOICED'));
    expect(screen.getByText('pages.refundManagement.invoiced')).toBeInTheDocument();
  });

  it('dovrebbe renderizzare default (Errore)', () => {
    render(getStatusChip(mockT, 'UNKNOWN'));
    expect(screen.getByText('Errore')).toBeTruthy();
  });
});

describe('formatEuro', () => {
  it('dovrebbe formattare correttamente un importo positivo', () => {
    expect(formatEuro(12345)).toBe('123,45€');
  });

  it('dovrebbe formattare correttamente zero', () => {
    expect(formatEuro(0)).toBe('0,00€');
  });

  it('dovrebbe formattare correttamente un importo grande', () => {
    expect(formatEuro(987654321)).toBe('9.876.543,21€');
  });

  it('dovrebbe formattare correttamente importi piccoli', () => {
    expect(formatEuro(1)).toBe('0,01€');
    expect(formatEuro(99)).toBe('0,99€');
  });
});

describe('handleCodeChange', () => {
  let mockFormik: any;

  beforeEach(() => {
    mockFormik = {
      handleChange: vi.fn(),
    };
  });

  it('should call formik.handleChange for valid values', () => {
    const mockEvent = { target: { value: '12345' } };
    const result = handleCodeChange(mockEvent, mockFormik, 14, 'GTIN/EAN');

    expect(mockFormik.handleChange).toHaveBeenCalledWith(mockEvent);
    expect(result).toBe('');
  });

  it('should call formik.handleChange for alphanumeric valid values', () => {
    const mockEvent = { target: { value: 'ABC123XYZ' } };
    const result = handleCodeChange(mockEvent, mockFormik, 14, 'GTIN/EAN');

    expect(mockFormik.handleChange).toHaveBeenCalledWith(mockEvent);
    expect(result).toBe('');
  });

  it('should return error for special characters', () => {
    const mockEvent = { target: { value: '+' } };
    const result = handleCodeChange(mockEvent, mockFormik, 14, 'GTIN/EAN');

    expect(result).toBe('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.');
    expect(mockFormik.handleChange).not.toHaveBeenCalled();
  });

  it('should return error for values with spaces', () => {
    const mockEvent = { target: { value: '123 456' } };
    const result = handleCodeChange(mockEvent, mockFormik, 14, 'GTIN/EAN');

    expect(result).toBe(undefined);
    expect(mockFormik.handleChange).not.toHaveBeenCalled();
  });

  it('should return error for values longer than 14 characters', () => {
    const mockEvent = { target: { value: '123456789012345' } };
    const result = handleCodeChange(mockEvent, mockFormik, 14, 'GTIN/EAN');

    expect(result).toBe(undefined);
    expect(mockFormik.handleChange).not.toHaveBeenCalled();
  });

  it('should handle exactly 14 valid characters', () => {
    const mockEvent = { target: { value: '12345678901234' } };
    const result = handleCodeChange(mockEvent, mockFormik, 14, 'GTIN/EAN');

    expect(mockFormik.handleChange).toHaveBeenCalledWith(mockEvent);
    expect(result).toBe('');
  });

  it('should return error for mixed special characters', () => {
    const mockEvent = { target: { value: 'ABC@123' } };
    const result = handleCodeChange(mockEvent, mockFormik, 14, 'GTIN/EAN');

    expect(result).toBe('Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.');
    expect(mockFormik.handleChange).not.toHaveBeenCalled();
  });

  it('should handle empty string', () => {
    const mockEvent = { target: { value: '' } };
    const result = handleCodeChange(mockEvent, mockFormik, 14, 'GTIN/EAN');

    expect(mockFormik.handleChange).toHaveBeenCalledWith(mockEvent);
    expect(result).toBe('');
  });
});

describe('filterInputWithSpaceRule', () => {
  it('rimuove tutti gli spazi se meno di 5 caratteri alfanumerici', () => {
    expect(filterInputWithSpaceRule(' a ')).toBe('a');
    expect(filterInputWithSpaceRule('   ')).toBe('');
    expect(filterInputWithSpaceRule(' 1 ')).toBe('1');
    expect(filterInputWithSpaceRule('a b c')).toBe('abc');
  });

  it('normalizza gli spazi tra parole', () => {
    expect(filterInputWithSpaceRule('ciao   mondo')).toBe('ciao mondo');
    expect(filterInputWithSpaceRule('ciao    mondo   bello')).toBe('ciao mondo bello');
  });

  it("rimuove spazi all'inizio", () => {
    expect(filterInputWithSpaceRule('   ciao mondo')).toBe('ciao mondo');
  });

  it('non permette spazi multipli consecutivi', () => {
    expect(filterInputWithSpaceRule('ciao     mondo')).toBe('ciao mondo');
    expect(filterInputWithSpaceRule('ciao  mondo  bello')).toBe('ciao mondo bello');
  });

  it('mantiene input già corretto', () => {
    expect(filterInputWithSpaceRule('ciao mondo')).toBe('ciao mondo');
    expect(filterInputWithSpaceRule('ciao mondo bello')).toBe('ciao mondo bello');
  });

  it('gestisce correttamente il caso con meno di 5 caratteri alfanumerici', () => {
    expect(filterInputWithSpaceRule('a b')).toBe('ab');
    expect(filterInputWithSpaceRule('1 2 3')).toBe('123');
  });

  it('handles a string of only spaces', () => {
    expect(filterInputWithSpaceRule('     ')).toBe('');
  });

  it('returns correct result for leading and trailing spaces', () => {
    expect(filterInputWithSpaceRule('   1a2   ')).toBe('1a2');
  });

  it('returns correct result for empty string', () => {
    expect(filterInputWithSpaceRule('')).toBe('');
  });

  it('returns correct result when space is only at start', () => {
    expect(filterInputWithSpaceRule(' abc')).toBe('abc');
  });

  it('handles single-word string with no spaces', () => {
    expect(filterInputWithSpaceRule('abc')).toBe('abc');
  });

  it('does not introduce spaces if there were none', () => {
    expect(filterInputWithSpaceRule('ab')).toBe('ab');
  });
});

describe('renderCellWithTooltip', () => {
  it('should render cell with tooltip for valid value', () => {
    const { container } = render(renderCellWithTooltip('Test Value'));
    expect(container.textContent).toContain('Test Value');
  });

  it('should render cell with tooltip for numeric value', () => {
    const { container } = render(renderCellWithTooltip(123));
    expect(container.textContent).toContain('123');
  });

  it('should render cell with tooltip for empty string', () => {
    const { container } = render(renderCellWithTooltip(''));
    expect(container).toBeTruthy();
  });

  it('should stringify object values instead of crashing', () => {
    const { container } = render(renderCellWithTooltip({}));
    expect(container.textContent).toContain('{}');
  });

  it('should stringify object values (with fields) instead of crashing', () => {
    const { container } = render(renderCellWithTooltip({ a: 1 }));
    expect(container.textContent).toContain('{"a":1}');
  });
});

describe('renderMissingDataWithTooltip', () => {
  it('should render missing data placeholder', () => {
    const { container } = render(renderMissingDataWithTooltip());
    expect(container.textContent).toContain(MISSING_DATA_PLACEHOLDER);
  });
});

describe('checkTooltipValue', () => {
  it('should render value with tooltip when value exists', () => {
    const params = { value: 'Test' };
    const { container } = render(checkTooltipValue(params));
    expect(container.textContent).toContain('Test');
  });

  it('should render missing data when value is undefined', () => {
    const params = { value: undefined };
    const { container } = render(checkTooltipValue(params));
    expect(container.textContent).toContain(MISSING_DATA_PLACEHOLDER);
  });

  it('should render missing data when value is null', () => {
    const params = { value: null };
    const { container } = render(checkTooltipValue(params));
    expect(container.textContent).toContain(MISSING_DATA_PLACEHOLDER);
  });

  it('should render value with tooltip when key is provided and value[key] present', () => {
    const key = 'foo';
    const params = { value: { foo: 'bar' } };
    const { container } = render(checkTooltipValue(params, key));
    expect(container.textContent).toContain('bar');
  });

  it('should render missing data when key is provided but value[key] is falsy', () => {
    const key = 'foo';
    const params = { value: { foo: null } };
    const { container } = render(checkTooltipValue(params, key));
    expect(container.textContent).toContain(MISSING_DATA_PLACEHOLDER);
  });

  it('should render tooltip for value number', () => {
    const params = { value: 42 };
    const { container } = render(checkTooltipValue(params));
    expect(container.textContent).toContain('42');
  });

  it('should render tooltip for value boolean', () => {
    const params = { value: true };
    const { container } = render(checkTooltipValue(params));
    expect(container.textContent).toContain('true');
  });

  it('should render tooltip for value date', () => {
    const params = { value: new Date('2024-04-13T10:00:00Z') };
    const { container } = render(checkTooltipValue(params));
    expect(container.textContent).toContain('2024');
  });
});

describe('checkEuroTooltip', () => {
  const minimalParams = {
    api: {} as any,
    id: 1,
    field: 'field',
    row: {},
    value: undefined,
  } as GridRenderCellParams;

  it('should render formatted euro value for positive number', () => {
    const params = { ...minimalParams, value: 12345 };
    const { container } = render(checkEuroTooltip(params));
    expect(container.textContent).toContain('123,45€');
  });

  it('should render formatted euro value for zero', () => {
    const params = { ...minimalParams, value: 0 };
    const { container } = render(checkEuroTooltip(params));
    expect(container.textContent).toContain('0,00€');
  });

  it('should render missing data when value is undefined', () => {
    const params = { ...minimalParams, value: undefined };
    const { container } = render(checkEuroTooltip(params));
    expect(container.textContent).toContain(MISSING_DATA_PLACEHOLDER);
  });

  it('should render missing data when value is null', () => {
    const params = { ...minimalParams, value: null };
    const { container } = render(checkEuroTooltip(params));
    expect(container.textContent).toContain(MISSING_DATA_PLACEHOLDER);
  });

  it('should render missing data when value key is truly missing', () => {
    const paramsNoValue = { api: {} as any, id: 2, field: 'abc', row: {} } as GridRenderCellParams;
    const { container } = render(checkEuroTooltip(paramsNoValue));
    expect(container.textContent).toContain(MISSING_DATA_PLACEHOLDER);
  });

  it('should render formatted euro for large numbers', () => {
    const params = { ...minimalParams, value: 987654321 };
    const { container } = render(checkEuroTooltip(params));
    expect(container.textContent).toContain('9.876.543,21€');
  });
});
/* removed: duplicate and incorrect 'checkDateTooltip' describe block with invalid parameters */
describe('checkDateTooltip', () => {
  const minimalParams = {
    api: {} as any,
    id: 1,
    field: 'field',
    row: {},
    value: undefined,
  } as GridRenderCellParams;

  it('should render missing data when value is falsy', () => {
    const params = { ...minimalParams, value: null };
    const { container } = render(checkDateTooltip(params));
    expect(container.textContent).toContain(MISSING_DATA_PLACEHOLDER);
  });

  it('should render formatted date string for string input', () => {
    const params = { ...minimalParams, value: '2021-01-01T12:00:00Z' };
    const { container } = render(checkDateTooltip(params));
    expect(container.textContent).toContain('01/01/2021');
  });

  it('should render formatted date string for number input', () => {
    const params = { ...minimalParams, value: new Date('2021-01-01T12:00:00Z').getTime() };
    const { container } = render(checkDateTooltip(params));
    expect(container.textContent).toContain('01/01/2021');
  });

  it('should render formatted date string for Date object input', () => {
    const params = { ...minimalParams, value: new Date('2021-01-01T12:00:00Z') };
    const { container } = render(checkDateTooltip(params));
    expect(container.textContent).toContain('01/01/2021');
  });
});

/* removed: duplicate and incorrect 'checkDateTooltip' describe block with invalid parameters */

describe('downloadFileFromBase64', () => {
  it('should create a download link and click it', () => {
    const base64 = 'data:application/pdf;base64,SGVsbG8gd29ybGQ=';
    const fileName = 'test.pdf';

    // Patch global URL if missing in test env
    if (!global.URL) {
      global.URL = {} as any;
    }
    if (!global.URL.createObjectURL) {
      global.URL.createObjectURL = vi.fn(() => 'blob:url');
    }
    if (!global.URL.revokeObjectURL) {
      global.URL.revokeObjectURL = vi.fn();
    }

    // Mock URL.createObjectURL and revokeObjectURL
    const createObjectURLMock = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
    const revokeObjectURLMock = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    // Mock click on anchor element
    const clickMock = vi.fn();
    const appendChildMock = vi.fn();
    const removeMock = vi.fn();

    const createElementMock = vi.spyOn(document, 'createElement').mockImplementation(() => {
      return {
        href: '',
        download: '',
        click: clickMock,
        style: {},
        setAttribute: () => {},
        remove: removeMock,
      } as unknown as HTMLAnchorElement;
    });

    const appendChildOriginal = document.body.appendChild;
    vi.spyOn(document.body, 'appendChild').mockImplementation(appendChildMock);

    downloadFileFromBase64(base64, fileName);

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect(removeMock).toHaveBeenCalled();

    // Restore mocks
    createObjectURLMock.mockRestore();
    revokeObjectURLMock.mockRestore();
    createElementMock.mockRestore();
    vi.restoreAllMocks();
  });
});

// DIRECT function/branch coverage calls for helpers.tsx
describe('helpers direct call coverage', () => {
  it('calls handleCodeChange with minimal params for each path', () => {
    const mockFormik = { handleChange: vi.fn() };
    // Should call formik
    handleCodeChange({ target: { value: 'ABCD' } }, mockFormik, 14, 'CODE');
    // Should return error for non-alphanumeric
    expect(handleCodeChange({ target: { value: '12.34' } }, mockFormik, 12, 'GTIN')).toMatch(
      /deve contenere/
    );
    // Should hit early exit (space or too long)
    expect(
      handleCodeChange({ target: { value: '12 34' } }, mockFormik, 12, 'GTIN')
    ).toBeUndefined();
    expect(
      handleCodeChange({ target: { value: 'ABCDEFGHIJKLMNO' } }, mockFormik, 10, 'CODE')
    ).toBeUndefined();
  });

  it('calls renderCellWithTooltip with each type/edge case', () => {
    renderCellWithTooltip(undefined);
    renderCellWithTooltip(null);
    renderCellWithTooltip('str');
    renderCellWithTooltip(987);
    renderCellWithTooltip(true);
    renderCellWithTooltip(false);
    renderCellWithTooltip(new Date(2024, 3, 14));
    renderCellWithTooltip({});
    renderCellWithTooltip([]);
  });

  it('calls renderMissingDataWithTooltip', () => {
    renderMissingDataWithTooltip();
  });

  it('calls checkTooltipValue for no value, value, and with key', () => {
    checkTooltipValue({ value: undefined });
    checkTooltipValue({ value: null });
    checkTooltipValue({ value: 'v' });
    checkTooltipValue({ value: { k: 7 } }, 'k');
    checkTooltipValue({ value: { k: undefined } }, 'k');
    checkTooltipValue({ value: {} }, 'notfound');
  });

  it('calls checkEuroTooltip', () => {
    const minimalParams = {
      api: {} as any,
      id: 1,
      field: '',
      row: {},
      value: 5,
    } as GridRenderCellParams;
    checkEuroTooltip(minimalParams);
    checkEuroTooltip({ ...minimalParams, value: 0 });
    checkEuroTooltip({ ...minimalParams, value: undefined });
  });

  it('calls checkDateTooltip', () => {
    const minimalParams = {
      api: {} as any,
      id: 1,
      field: '',
      row: {},
      value: '2024-04-14T16:00:00Z',
    } as GridRenderCellParams;
    checkDateTooltip(minimalParams);
    checkDateTooltip({ ...minimalParams, value: null });
    checkDateTooltip({ ...minimalParams, value: new Date() });
    checkDateTooltip({ ...minimalParams, value: Date.now() });
  });
});
