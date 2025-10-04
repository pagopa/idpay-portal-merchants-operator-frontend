import { describe, it, expect, beforeEach } from "vitest";
import { utilsStore } from "./utilsStore";

describe("utilsStore", () => {
  beforeEach(() => {
    utilsStore.setState({ transactionAuthorized: false });
  });

  it("dovrebbe avere lo stato iniziale corretto", () => {
    const state = utilsStore.getState();
    expect(state.transactionAuthorized).toBe(false);
  });

  it("dovrebbe aggiornare transactionAuthorized a true", () => {
    utilsStore.getState().setTransactionAuthorized(true);
    const state = utilsStore.getState();
    expect(state.transactionAuthorized).toBe(true);
  });

  it("dovrebbe aggiornare transactionAuthorized a false", () => {
    utilsStore.getState().setTransactionAuthorized(true);
    utilsStore.getState().setTransactionAuthorized(false);
    const state = utilsStore.getState();
    expect(state.transactionAuthorized).toBe(false);
  });
});
