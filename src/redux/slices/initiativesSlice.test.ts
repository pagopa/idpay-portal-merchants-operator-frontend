import { describe, expect, it } from 'vitest';
import {
  currentInitiativeSelector,
  initiativesListSelector,
  initiativesReducer,
  setInitiativesList,
} from './initiativesSlice';

const initiatives: Array<Record<string, string>> = [
  {
    initiativeId: 'initiative-1',
    initiativeName: 'Bonus Elettrodomestici',
    startDate: '2025-01-10',
    endDate: '2025-12-31',
  },
  {
    initiativeId: 'initiative-2',
    initiativeName: 'Bonus Decoder',
  },
];

describe('initiativesSlice', () => {
  it('stores the initiatives list with a formatted spending period', () => {
    const state = initiativesReducer(undefined, setInitiativesList(initiatives));

    expect(state.list).toEqual([
      {
        ...initiatives[0],
        spendingPeriod: '10/01/2025 - 31/12/2025',
      },
      {
        ...initiatives[1],
        spendingPeriod: '',
      },
    ]);
  });

  it('selects the initiatives list from root state', () => {
    const state = { initiatives: { list: initiatives } };

    expect(initiativesListSelector(state as any)).toBe(initiatives);
  });

  it('selects the current initiative and adds its spending period', () => {
    const state = { initiatives: { list: initiatives } };

    expect(currentInitiativeSelector(state as any, 'initiative-1')).toEqual({
      ...initiatives[0],
      spendingPeriod: '10/01/2025 - 31/12/2025',
    });
  });

  it('returns undefined when the current initiative cannot be resolved', () => {
    const state = { initiatives: { list: initiatives } };

    expect(currentInitiativeSelector(state as any, undefined)).toBeUndefined();
    expect(currentInitiativeSelector(state as any, 'missing')).toBeUndefined();
  });
});
