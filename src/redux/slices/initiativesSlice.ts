import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

import { RootState } from '../store';
import { PointOfSaleInitiativeDetailedDTO } from '../../api/generated/data-contracts';

interface InitiativesState {
  list?: Array<PointOfSaleInitiativeDetailedDTO>;
}

const initialState: InitiativesState = { list: [] };

export const initiativesSlice = createSlice({
  name: 'initiatives',
  initialState,
  reducers: {
    setInitiativesList: (state, action: PayloadAction<Array<PointOfSaleInitiativeDetailedDTO>>) => {
      state.list = action.payload.map((initiative) => {
        const spendingPeriod = initiative.startDate && initiative.endDate
          ? `${new Date(initiative.startDate).toLocaleDateString('fr-FR')} - ${new Date(
            initiative.endDate
          ).toLocaleDateString('fr-FR')}`
          : '';
          return { ...initiative, spendingPeriod}
      })
    },
  },
});

export const { setInitiativesList } = initiativesSlice.actions;
export const initiativesReducer = initiativesSlice.reducer;

export const initiativesListSelector = (state: RootState): Array<PointOfSaleInitiativeDetailedDTO> | undefined =>
  state.initiatives.list;

export type InitiativeExtended = PointOfSaleInitiativeDetailedDTO & {
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
