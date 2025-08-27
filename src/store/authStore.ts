import { create } from 'zustand';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  setJwtToken: (token: string | null) => void;
  clearToken: () => void;
}

export const authStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  setJwtToken: (token: string | null) => set({ token, isAuthenticated: !!token }),
  clearToken: () => set({ token: null, isAuthenticated: false }),
}));