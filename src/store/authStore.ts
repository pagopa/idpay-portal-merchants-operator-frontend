import { create } from 'zustand';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user:unknown;
  logoutFn: (() => void) | null;
  setJwtToken: (token: string | null) => void;
  setLogout: (logoutFn: () => void) => void;
  executeLogout: () => void;
  setUser: (user: unknown) => void;
  clearToken: () => void;
}

export const authStore = create<AuthState>((set, get) => ({
  token: null,
  isAuthenticated: false,
  user: null,
  logoutFn: null,
  setJwtToken: (token: string | null) => set({ token, isAuthenticated: !!token }),
  setLogout: (logoutFn: () => void) => set({ logoutFn }),

  executeLogout: () => {
    const fn = get().logoutFn;
    if (fn) fn();
    set({ token: null, isAuthenticated: false, user: null, logoutFn: null });
  },

  setUser: (user: unknown) => set({ user }),
  clearToken: () => set({ token: null, isAuthenticated: false }),
}));