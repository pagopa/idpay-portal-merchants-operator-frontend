import { describe, it, expect, beforeEach, vi } from "vitest";
import { utilsStore } from "./utilsStore";

describe("utilsStore", () => {
  beforeEach(() => {
    utilsStore.setState({ transactionAuthorized: false });
  });

  
    const state = utilsStore.getState();
    const setTransactionSpy = vi.spyOn(state, 'setTransactionAuthorized')

  it("dovrebbe avere lo stato iniziale corretto", () => {
    expect(state.transactionAuthorized).toBe(false);
  });

  it("dovrebbe aggiornare transactionAuthorized a true", () => {
    utilsStore.getState().setTransactionAuthorized(true);
    const state = utilsStore.getState();
    expect(state.transactionAuthorized).toBe(true);
    expect(setTransactionSpy).toBeCalled();
  });

  it("dovrebbe aggiornare transactionAuthorized a false", () => {
    utilsStore.getState().setTransactionAuthorized(true);
    utilsStore.getState().setTransactionAuthorized(false);
    const state = utilsStore.getState();
    expect(state.transactionAuthorized).toBe(false);
    expect(setTransactionSpy).toBeCalled();
  });
});
