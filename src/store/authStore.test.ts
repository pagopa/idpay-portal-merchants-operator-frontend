import { describe, it, expect, beforeEach, vi } from "vitest";
import { authStore } from "./authStore";

const mockToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvZSBETyIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const mockUser = { id: 1, name: "Test User" };
const mockLogoutFn = vi.fn();

beforeEach(() => {
  authStore.setState({
    token: null,
    isAuthenticated: false,
    user: null,
    logoutFn: null,
  });
  mockLogoutFn.mockClear();
});

describe("authStore", () => {
  it("dovrebbe impostare il token e isAuthenticated su true", () => {
    authStore.getState().setJwtToken(mockToken);

    const state = authStore.getState();

    expect(state.token).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
  });

  it("dovrebbe rimuovere il token e impostare isAuthenticated su false se il token è null", () => {
    authStore.setState({ token: "qualcosa", isAuthenticated: true });

    authStore.getState().setJwtToken(null);

    const state = authStore.getState();

    expect(state.token).toBe(null);
    expect(state.isAuthenticated).toBe(false);
  });

  it("dovrebbe impostare la funzione di logout esterna (logoutFn)", () => {
    authStore.getState().setLogout(mockLogoutFn);

    expect(authStore.getState().logoutFn).toBe(mockLogoutFn);
  });

  it("dovrebbe eseguire logoutFn e resettare lo stato (token, isAuthenticated, user, logoutFn)", () => {
    authStore.setState({
      token: mockToken,
      isAuthenticated: true,
      user: mockUser,
      logoutFn: mockLogoutFn,
    });

    authStore.getState().executeLogout();

    const state = authStore.getState();

    expect(mockLogoutFn).toHaveBeenCalledTimes(1);

    expect(state.token).toBe(null);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBe(null);
    expect(state.logoutFn).toBe(null);
  });

  it("dovrebbe resettare solo lo stato se logoutFn non è impostata", () => {
    authStore.setState({
      token: mockToken,
      isAuthenticated: true,
      user: mockUser,
      logoutFn: null,
    });

    authStore.getState().executeLogout();

    const state = authStore.getState();

    expect(mockLogoutFn).not.toHaveBeenCalled();

    expect(state.token).toBe(null);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBe(null);
  });

  it("dovrebbe impostare i dati dell'utente (user)", () => {
    authStore.getState().setUser(mockUser);

    expect(authStore.getState().user).toBe(mockUser);
  });

  it("dovrebbe resettare solo il token e isAuthenticated, mantenendo user e logoutFn", () => {
    authStore.setState({
      token: mockToken,
      isAuthenticated: true,
      user: mockUser,
      logoutFn: mockLogoutFn,
    });

    authStore.getState().clearToken();

    const state = authStore.getState();

    expect(state.token).toBe(null);
    expect(state.isAuthenticated).toBe(false);

    expect(state.user).toBe(mockUser);
    expect(state.logoutFn).toBe(mockLogoutFn);
  });
});
