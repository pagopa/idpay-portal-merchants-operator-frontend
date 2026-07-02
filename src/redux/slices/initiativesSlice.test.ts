import { describe, it, expect } from 'vitest';
import {
    initiativesReducer,
    setInitiativesList,
    initiativesListSelector,
    currentInitiativeSelector
} from './initiativesSlice';
import { RootState } from '../store';

describe('initiativesSlice reducer', () => {
    const mockPayload = [
        { initiativeId: '1', name: 'Initiative 1', startDate: '2026-01-01T00:00:00.000Z', endDate: '2026-01-10T00:00:00.000Z' },
        { initiativeId: '2', name: 'Initiative 2', startDate: '', endDate: '' }
    ];

    it('should return the initial state when passed an empty action', () => {
        expect(initiativesReducer(undefined, { type: '' })).toEqual({ list: [] });
    });

    it('should handle setInitiativesList and map spendingPeriod correctly', () => {
        const action = setInitiativesList(mockPayload);
        const state = initiativesReducer({ list: [] }, action);

        expect(state.list).toHaveLength(2);
        expect(state.list?.[0]).toEqual({
            ...mockPayload[0],
            spendingPeriod: '01/01/2026 - 10/01/2026',
        });
        expect(state.list?.[1]).toEqual({
            ...mockPayload[1],
            spendingPeriod: '',
        });
    });
});

describe('initiatives selectors', () => {
    const mockState = {
        initiatives: {
            list: [
                { initiativeId: '1', name: 'Initiative 1', startDate: '2026-05-01T00:00:00.000Z', endDate: '2026-05-15T00:00:00.000Z' },
                { initiativeId: '2', name: 'Initiative 2', startDate: '', endDate: '' }
            ]
        }
    } as unknown as RootState;

    it('should extract the initiatives list via initiativesListSelector', () => {
        const selectedList = initiativesListSelector(mockState);
        expect(selectedList).toEqual(mockState.initiatives.list);
    });

    it('should return undefined from currentInitiativeSelector if list or id is missing', () => {
        expect(currentInitiativeSelector(mockState, undefined)).toBeUndefined();

        const stateWithMissingList = { initiatives: { list: undefined } } as unknown as RootState;
        expect(currentInitiativeSelector(stateWithMissingList, '1')).toBeUndefined();
    });

    it('should return undefined from currentInitiativeSelector if the initiative is not found', () => {
        expect(currentInitiativeSelector(mockState, 'unknown-id')).toBeUndefined();
    });

    it('should return the matched initiative with a formatted spendingPeriod', () => {
        const selected = currentInitiativeSelector(mockState, '1');
        expect(selected).toEqual({
            initiativeId: '1',
            name: 'Initiative 1',
            startDate: '2026-05-01T00:00:00.000Z',
            endDate: '2026-05-15T00:00:00.000Z',
            spendingPeriod: '01/05/2026 - 15/05/2026',
        });
    });

    it('should return the matched initiative with an empty spendingPeriod if dates are missing', () => {
        const selected = currentInitiativeSelector(mockState, '2');
        expect(selected).toEqual({
            initiativeId: '2',
            name: 'Initiative 2',
            startDate: '',
            endDate: '',
            spendingPeriod: '',
        });
    });
});