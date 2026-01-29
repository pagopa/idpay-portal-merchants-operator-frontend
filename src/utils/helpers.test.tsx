import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { 
  getStatusChip, 
  formatEuro,
  filterInputWithSpaceRule,
  renderCellWithTooltip,
  renderMissingDataWithTooltip,
  checkTooltipValue,
  checkEuroTooltip,
  handleCodeChange
} from "./helpers";
import { MISSING_DATA_PLACEHOLDER } from "./constants";

describe("getStatusChip", () => {
  const mockT = (key: string) => key;

  it("dovrebbe renderizzare AUTHORIZED", () => {
    render(getStatusChip(mockT, "AUTHORIZED"));
    expect(screen.getByText("pages.refundManagement.authorized")).toBeTruthy();
  });

  it("dovrebbe renderizzare REFUNDED", () => {
    render(getStatusChip(mockT, "REFUNDED"));
    expect(screen.getByText("pages.refundManagement.refunded")).toBeTruthy();
  });

  it("dovrebbe renderizzare CANCELLED", () => {
    render(getStatusChip(mockT, "CANCELLED"));
    expect(screen.getByText("pages.refundManagement.cancelled")).toBeTruthy();
  });

  it("dovrebbe renderizzare CAPTURED", () => {
    render(getStatusChip(mockT, "CAPTURED"));
    expect(screen.getByText("pages.refundManagement.captured")).toBeTruthy();
  });

  it("dovrebbe renderizzare REWARDED", () => {
    render(getStatusChip(mockT, "REWARDED"));
    expect(screen.getByText("pages.refundManagement.rewarded")).toBeTruthy();
  });

  it("dovrebbe renderizzare INVOICED", () => {
    render(getStatusChip(mockT, "INVOICED"));
    expect(
      screen.getByText("pages.refundManagement.invoiced")
    ).toBeInTheDocument();
  });

  it("dovrebbe renderizzare default (Errore)", () => {
    render(getStatusChip(mockT, "UNKNOWN"));
    expect(screen.getByText("Errore")).toBeTruthy();
  });
});

describe("formatEuro", () => {
  it("dovrebbe formattare correttamente un importo positivo", () => {
    expect(formatEuro(12345)).toBe("123,45€");
  });

  it("dovrebbe formattare correttamente zero", () => {
    expect(formatEuro(0)).toBe("0,00€");
  });

  it("dovrebbe formattare correttamente un importo grande", () => {
    expect(formatEuro(987654321)).toBe("9.876.543,21€");
  });

  it("dovrebbe formattare correttamente importi piccoli", () => {
    expect(formatEuro(1)).toBe("0,01€");
    expect(formatEuro(99)).toBe("0,99€");
  });
});

describe("handleCodeChange", () => {
  let mockFormik: any;

  beforeEach(() => {
    mockFormik = {
      handleChange: vi.fn(),
    };
  });

  it("should call formik.handleChange for valid values", () => {
    const mockEvent = { target: { value: "12345" } };
    const result = handleCodeChange(mockEvent, mockFormik, 14, "GTIN/EAN");

    expect(mockFormik.handleChange).toHaveBeenCalledWith(mockEvent);
    expect(result).toBe("");
  });

  it("should call formik.handleChange for alphanumeric valid values", () => {
    const mockEvent = { target: { value: "ABC123XYZ" } };
    const result = handleCodeChange(mockEvent, mockFormik, 14, "GTIN/EAN");

    expect(mockFormik.handleChange).toHaveBeenCalledWith(mockEvent);
    expect(result).toBe("");
  });

  it("should return error for special characters", () => {
    const mockEvent = { target: { value: "+" } };
    const result = handleCodeChange(mockEvent, mockFormik, 14, "GTIN/EAN");

    expect(result).toBe("Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.");
    expect(mockFormik.handleChange).not.toHaveBeenCalled();
  });

  it("should return error for values with spaces", () => {
    const mockEvent = { target: { value: "123 456" } };
    const result = handleCodeChange(mockEvent, mockFormik, 14, "GTIN/EAN");

    expect(result).toBe(undefined);
    expect(mockFormik.handleChange).not.toHaveBeenCalled();
  });

  it("should return error for values longer than 14 characters", () => {
    const mockEvent = { target: { value: "123456789012345" } };
    const result = handleCodeChange(mockEvent, mockFormik, 14, "GTIN/EAN");

    expect(result).toBe(undefined);
    expect(mockFormik.handleChange).not.toHaveBeenCalled();
  });

  it("should handle exactly 14 valid characters", () => {
    const mockEvent = { target: { value: "12345678901234" } };
    const result = handleCodeChange(mockEvent, mockFormik, 14, "GTIN/EAN");

    expect(mockFormik.handleChange).toHaveBeenCalledWith(mockEvent);
    expect(result).toBe("");
  });

  it("should return error for mixed special characters", () => {
    const mockEvent = { target: { value: "ABC@123" } };
    const result = handleCodeChange(mockEvent, mockFormik, 14, "GTIN/EAN");

    expect(result).toBe("Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici."); 
    expect(mockFormik.handleChange).not.toHaveBeenCalled();
  });

  it("should handle empty string", () => {
    const mockEvent = { target: { value: "" } };
    const result = handleCodeChange(mockEvent, mockFormik, 14, "GTIN/EAN");

    expect(mockFormik.handleChange).toHaveBeenCalledWith(mockEvent);
    expect(result).toBe("");
  });
});

describe("filterInputWithSpaceRule", () => {
  it("rimuove tutti gli spazi se meno di 5 caratteri alfanumerici", () => {
    expect(filterInputWithSpaceRule(" a ")).toBe("a");
    expect(filterInputWithSpaceRule("   ")).toBe("");
    expect(filterInputWithSpaceRule(" 1 ")).toBe("1");
    expect(filterInputWithSpaceRule("a b c")).toBe("abc");
  });

  it("normalizza gli spazi tra parole", () => {
    expect(filterInputWithSpaceRule("ciao   mondo")).toBe("ciao mondo");
    expect(filterInputWithSpaceRule("ciao    mondo   bello")).toBe(
      "ciao mondo bello"
    );
  });

  it("rimuove spazi all'inizio", () => {
    expect(filterInputWithSpaceRule("   ciao mondo")).toBe("ciao mondo");
  });

  it("non permette spazi multipli consecutivi", () => {
    expect(filterInputWithSpaceRule("ciao     mondo")).toBe("ciao mondo");
    expect(filterInputWithSpaceRule("ciao  mondo  bello")).toBe(
      "ciao mondo bello"
    );
  });

  it("mantiene input già corretto", () => {
    expect(filterInputWithSpaceRule("ciao mondo")).toBe("ciao mondo");
    expect(filterInputWithSpaceRule("ciao mondo bello")).toBe(
      "ciao mondo bello"
    );
  });

  it("gestisce correttamente il caso con meno di 5 caratteri alfanumerici", () => {
    expect(filterInputWithSpaceRule("a b")).toBe("ab");
    expect(filterInputWithSpaceRule("1 2 3")).toBe("123");
  });
});

describe("renderCellWithTooltip", () => {
  it("should render cell with tooltip for valid value", () => {
    const { container } = render(renderCellWithTooltip("Test Value"));
    expect(container.textContent).toContain("Test Value");
  });

  it("should render cell with tooltip for numeric value", () => {
    const { container } = render(renderCellWithTooltip(123));
    expect(container.textContent).toContain("123");
  });

  it("should render cell with tooltip for empty string", () => {
    const { container } = render(renderCellWithTooltip(""));
    expect(container).toBeTruthy();
  });
});

describe("renderMissingDataWithTooltip", () => {
  it("should render missing data placeholder", () => {
    const { container } = render(renderMissingDataWithTooltip());
    expect(container.textContent).toContain(MISSING_DATA_PLACEHOLDER);
  });
});

describe("checkTooltipValue", () => {
  it("should render value with tooltip when value exists", () => {
    const params = { value: "Test" };
    const { container } = render(checkTooltipValue(params));
    expect(container.textContent).toContain("Test");
  });

  it("should render missing data when value is undefined", () => {
    const params = { value: undefined };
    const { container } = render(checkTooltipValue(params));
    expect(container.textContent).toContain(MISSING_DATA_PLACEHOLDER);
  });

  it("should render missing data when value is null", () => {
    const params = { value: null };
    const { container } = render(checkTooltipValue(params));
    expect(container.textContent).toContain(MISSING_DATA_PLACEHOLDER);
  });

});

describe("checkEuroTooltip", () => {
  it("should render formatted euro value for positive number", () => {
    const params = { value: 12345 };
    const { container } = render(checkEuroTooltip(params));
    expect(container.textContent).toContain("123,45€");
  });

  it("should render formatted euro value for zero", () => {
    const params = { value: 0 };
    const { container } = render(checkEuroTooltip(params));
    expect(container.textContent).toContain("0,00€");
  });

  it("should render missing data when value is undefined", () => {
    const params = { value: undefined };
    const { container } = render(checkEuroTooltip(params));
    expect(container.textContent).toContain(MISSING_DATA_PLACEHOLDER);
  });

  it("should render missing data when value is null", () => {
    const params = { value: null };
    const { container } = render(checkEuroTooltip(params));
    expect(container.textContent).toContain(MISSING_DATA_PLACEHOLDER);
  });

  it("should render formatted euro for large numbers", () => {
    const params = { value: 987654321 };
    const { container } = render(checkEuroTooltip(params));
    expect(container.textContent).toContain("9.876.543,21€");
  });
});