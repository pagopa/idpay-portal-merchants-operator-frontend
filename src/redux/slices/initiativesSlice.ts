import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PointOfSaleInitiativeDetailedDTO } from '../../api/generated/data-contracts';
import { RootState } from '../store';

export type InitiativeExtended = PointOfSaleInitiativeDetailedDTO & {
  spendingPeriod: string;
};
interface InitiativesState {
    initiativesList?: Array<InitiativeExtended>;
    currentInitiativeId?: string | undefined;
}

const initialState: InitiativesState = { initiativesList: [], currentInitiativeId: undefined };

export const initiativesSlice = createSlice({
  name: 'initiatives',
  initialState,
  reducers: {
    setInitiativesList: (state, action: PayloadAction<Array<PointOfSaleInitiativeDetailedDTO>>) => {
      state.initiativesList = action.payload.map((initiative) => {
        const spendingPeriod = initiative?.startDate && initiative?.endDate
          ? `${new Date(initiative?.startDate).toLocaleDateString('fr-FR')} - ${new Date(
            initiative?.endDate
          ).toLocaleDateString('fr-FR')}`
          : '';
        return { ...initiative, spendingPeriod }
      })
    },
    setCurrentInitiativeId: (state, action: PayloadAction<string | undefined>) => {
      state.currentInitiativeId = action.payload;
    }
  },
});

export const { setInitiativesList, setCurrentInitiativeId } = initiativesSlice.actions;
export const initiativesReducer = initiativesSlice.reducer;

export const initiativesListSelector = (state: RootState): Array<InitiativeExtended> | undefined =>
  state.initiatives.initiativesList;

export const currentInitiativeSelector = (state: RootState, initiativeId: string): InitiativeExtended | undefined =>
  state.initiatives.initiativesList?.find(i => i?.initiativeId === initiativeId);

export const currentInitiativeIdSelector = (state: RootState): string | undefined =>
  state.initiatives.currentInitiativeId;
