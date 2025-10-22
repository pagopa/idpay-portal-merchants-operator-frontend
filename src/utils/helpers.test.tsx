import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { getStatusChip, formatEuro, filterInputWithSpaceRule } from "./helpers";

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
});

describe("filterInputWithSpaceRule", () => {
  it("rimuove tutti gli spazi se meno di 2 caratteri alfanumerici", () => {
    expect(filterInputWithSpaceRule(" a ")).toBe("a");
    expect(filterInputWithSpaceRule("   ")).toBe("");
    expect(filterInputWithSpaceRule(" 1 ")).toBe("1");
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
});
