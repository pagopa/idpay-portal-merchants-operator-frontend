import { describe, it, expect } from 'vitest';
import {
  initiativesReducer,
  setInitiativesList,
  setCurrentInitiativeId,
  initiativesListSelector,
  currentInitiativeSelector,
  currentInitiativeIdSelector,
} from './initiativesSlice';
import { RootState } from '../store';

describe('initiativesSlice reducer', () => {
  const mockPayload = [
    { initiativeId: '1', name: 'Initiative 1', startDate: '2026-01-01T00:00:00.000Z', endDate: '2026-01-10T00:00:00.000Z' },
    { initiativeId: '2', name: 'Initiative 2', startDate: '', endDate: '' }
  ];

  it('should return the initial state when passed an empty action', () => {
    expect(initiativesReducer(undefined, { type: '' })).toEqual({
      initiativesList: [],
      currentInitiativeId: undefined,
    });
  });

  it('should handle setCurrentInitiativeId', () => {
    const action = setCurrentInitiativeId('1');
    const state = initiativesReducer(undefined, action);

    expect(state.currentInitiativeId).toBe('1');
  });

  it('should handle setInitiativesList and map spendingPeriod correctly', () => {
    const action = setInitiativesList(mockPayload);
    const state = initiativesReducer({ initiativesList: [], currentInitiativeId: undefined }, action);

    expect(state.initiativesList).toHaveLength(2);
    expect(state.initiativesList?.[0]).toEqual({
      ...mockPayload[0],
      spendingPeriod: '01/01/2026 - 10/01/2026',
    });
    expect(state.initiativesList?.[1]).toEqual({
      ...mockPayload[1],
      spendingPeriod: '',
    });
  });
});

describe('initiatives selectors', () => {
  const mockState = {
    initiatives: {
      initiativesList: [
        {
          initiativeId: '1',
          name: 'Initiative 1',
          startDate: '2026-05-01T00:00:00.000Z',
          endDate: '2026-05-15T00:00:00.000Z',
          spendingPeriod: '01/05/2026 - 15/05/2026',
        },
        {
          initiativeId: '2',
          name: 'Initiative 2',
          startDate: '',
          endDate: '',
          spendingPeriod: '',
        },
      ],
      currentInitiativeId: '1',
    },
  } as unknown as RootState;

  it('should extract the initiatives list via initiativesListSelector', () => {
    const selectedList = initiativesListSelector(mockState);
    expect(selectedList).toEqual(mockState.initiatives.initiativesList);
  });

  it('should extract the current initiative id via currentInitiativeIdSelector', () => {
    const selectedId = currentInitiativeIdSelector(mockState);
    expect(selectedId).toBe('1');
  });

  it('should return undefined from currentInitiativeSelector if list is missing', () => {
    const stateWithMissingList = { initiatives: { initiativesList: undefined } } as unknown as RootState;
    expect(currentInitiativeSelector(stateWithMissingList, '1')).toBeUndefined();
  });

  it('should return undefined from currentInitiativeSelector if the initiative is not found', () => {
    expect(currentInitiativeSelector(mockState, 'unknown-id')).toBeUndefined();
  });

  it('should return the matched initiative by id', () => {
    const selected = currentInitiativeSelector(mockState, '1');
    expect(selected).toEqual(mockState.initiatives.initiativesList?.[0]);
  });

  it('should return the matched initiative with an empty spendingPeriod if dates were missing', () => {
    const selected = currentInitiativeSelector(mockState, '2');
    expect(selected).toEqual(mockState.initiatives.initiativesList?.[1]);
  });
});