import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { getStatusChip, formatEuro, handleGtinChange, downloadFileFromBase64 } from "./helpers";

describe("getStatusChip", () => {
  const mockT = (key: string) => key;

  it("dovrebbe renderizzare AUTHORIZED", () => {
    render(getStatusChip(mockT, "AUTHORIZED"));
    expect(
      screen.getByText("pages.refundManagement.authorized")
    ).toBeInTheDocument();
  });

  it("dovrebbe renderizzare REFUNDED", () => {
    render(getStatusChip(mockT, "REFUNDED"));
    expect(
      screen.getByText("pages.refundManagement.refunded")
    ).toBeInTheDocument();
  });

  it("dovrebbe renderizzare CANCELLED", () => {
    render(getStatusChip(mockT, "CANCELLED"));
    expect(
      screen.getByText("pages.refundManagement.cancelled")
    ).toBeInTheDocument();
  });

  it("dovrebbe renderizzare CAPTURED", () => {
    render(getStatusChip(mockT, "CAPTURED"));
    expect(
      screen.getByText("pages.refundManagement.captured")
    ).toBeInTheDocument();
  });

  it("dovrebbe renderizzare REWARDED", () => {
    render(getStatusChip(mockT, "REWARDED"));
    expect(
      screen.getByText("pages.refundManagement.rewarded")
    ).toBeInTheDocument();
  });

  it("dovrebbe renderizzare INVOICED", () => {
    render(getStatusChip(mockT, "INVOICED"));
    expect(
      screen.getByText("pages.refundManagement.invoiced")
    ).toBeInTheDocument();
  });

  it("dovrebbe renderizzare default (Errore)", () => {
    render(getStatusChip(mockT, "UNKNOWN"));
    expect(screen.getByText("Errore")).toBeInTheDocument();
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


describe("handleGtinChange", () => {
  let mockFormik: any;

  beforeEach(() => {
    mockFormik = {
      handleChange: vi.fn(),
    };
  });

  it("should call formik.handleChange for valid values", () => {
    const mockEvent = { target: { value: "12345" } };
    const result = handleGtinChange(mockEvent, mockFormik);

    expect(mockFormik.handleChange).toHaveBeenCalledWith(mockEvent);
    expect(result).toBe("");
  });

  it("should call formik.handleChange for alphanumeric valid values", () => {
    const mockEvent = { target: { value: "ABC123XYZ" } };
    const result = handleGtinChange(mockEvent, mockFormik);

    expect(mockFormik.handleChange).toHaveBeenCalledWith(mockEvent);
    expect(result).toBe("");
  });

  it("should return error for special characters", () => {
    const mockEvent = { target: { value: "+" } };
    const result = handleGtinChange(mockEvent, mockFormik);

    expect(result).toBe("Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.");
    expect(mockFormik.handleChange).not.toHaveBeenCalled();
  });

  it("should return error for values with spaces", () => {
    const mockEvent = { target: { value: "123 456" } };
    const result = handleGtinChange(mockEvent, mockFormik);

    expect(result).toBe(undefined);
    expect(mockFormik.handleChange).not.toHaveBeenCalled();
  });

  it("should return error for values longer than 14 characters", () => {
    const mockEvent = { target: { value: "123456789012345" } };
    const result = handleGtinChange(mockEvent, mockFormik);

    expect(result).toBe(undefined);
    expect(mockFormik.handleChange).not.toHaveBeenCalled();
  });

  it("should handle exactly 14 valid characters", () => {
    const mockEvent = { target: { value: "12345678901234" } };
    const result = handleGtinChange(mockEvent, mockFormik);

    expect(mockFormik.handleChange).toHaveBeenCalledWith(mockEvent);
    expect(result).toBe("");
  });

  it("should return error for mixed special characters", () => {
    const mockEvent = { target: { value: "ABC@123" } };
    const result = handleGtinChange(mockEvent, mockFormik);

    expect(result).toBe("Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici."); 
    expect(mockFormik.handleChange).not.toHaveBeenCalled();
  });

  it("should handle empty string", () => {
    const mockEvent = { target: { value: "" } };
    const result = handleGtinChange(mockEvent, mockFormik);

    expect(mockFormik.handleChange).toHaveBeenCalledWith(mockEvent);
    expect(result).toBe("");
  });
});