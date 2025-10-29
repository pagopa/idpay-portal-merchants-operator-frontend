import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { getStatusChip, formatEuro, handleGtinChange } from "./helpers";

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

  it("dovrebbe mostrare l'errore", () => {
    const mockEvent = {target: {value: '+'}}
    expect(handleGtinChange(mockEvent, '')).toBe("Il codice GTIN/EAN deve contenere al massimo 14 caratteri alfanumerici.");
  });
});
