import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

import { RootState } from '../store';
// import { InitiativeDTO } from '../../api/generated/merchants/data-contracts';

type InitiativeDTOArray = Array<Record<string, string>>;

interface InitiativesState {
  list?: InitiativeDTOArray;
}

const initialState: InitiativesState = {list: []};

export const initiativesSlice = createSlice({
  name: 'initiatives',
  initialState,
  reducers: {
    setInitiativesList: (state, action: PayloadAction<InitiativeDTOArray>) => {
      state.list = action.payload;
    },
  },
});

export const { setInitiativesList } = initiativesSlice.actions;
export const initiativesReducer = initiativesSlice.reducer;

export const initiativesListSelector = (state: RootState): InitiativeDTOArray | undefined =>
  state.initiatives.list;

export type InitiativeExtended = Record<string, string> & {
  spendingPeriod: string;
};

export const currentInitiativeSelector = createSelector(
  [initiativesListSelector, (_: RootState, initiativeId: string | undefined) => initiativeId],
  (initiatives, initiativeId): InitiativeExtended | undefined => {
    if (!initiatives || !initiativeId) {
      return undefined;
    }

    const initiative = initiatives.find((i) => i.initiativeId === initiativeId);

    if (!initiative) {
      return undefined;
    }

    const spendingPeriod =
      initiative.startDate && initiative.endDate
        ? `${new Date(initiative.startDate).toLocaleDateString('fr-FR')} - ${new Date(
            initiative.endDate
          ).toLocaleDateString('fr-FR')}`
        : '';

    return {
      ...initiative,
      spendingPeriod,
    };
  }
);
