import { create } from 'zustand';

type UtilsStoreState = {
    transactionAuthorized: boolean;
    setTransactionAuthorized: (value: boolean) => void;
  };

export const utilsStore = create<UtilsStoreState>((set) => ({
  transactionAuthorized: false,
  setTransactionAuthorized: (value: boolean) => set({ transactionAuthorized: value }),
}));