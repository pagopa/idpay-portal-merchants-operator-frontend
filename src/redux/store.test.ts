import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

vi.mock('@reduxjs/toolkit', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@reduxjs/toolkit')>();
    return {
        ...actual,
        configureStore: vi.fn(actual.configureStore),
    };
});

vi.mock('./slices/initiativesSlice', () => ({
    initiativesReducer: (state = { initialized: true }) => state,
}));

describe('Store Configuration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('should initialize the store with the correct reducer structure', async () => {
        vi.doMock('../utils/constants', () => ({ LOG_REDUX_ACTIONS: false }));
        const { createStore } = await import('./store');

        const testStore = createStore();
        expect(testStore.getState()).toHaveProperty('initiatives');
        expect(testStore.getState().initiatives).toEqual({ initialized: true });
    });

    it('should call configureStore with the expected configuration parameters', async () => {
        vi.doMock('../utils/constants', () => ({ LOG_REDUX_ACTIONS: false }));
        const { createStore } = await import('./store');

        createStore();

        expect(configureStore).toHaveBeenCalledWith(
            expect.objectContaining({
                reducer: {
                    initiatives: expect.any(Function),
                },
                middleware: expect.any(Function),
            })
        );
    });

    it('should properly create the store instance when LOG_REDUX_ACTIONS is enabled', async () => {
        vi.doMock('../utils/constants', () => ({ LOG_REDUX_ACTIONS: true }));
        const { createStore } = await import('./store');

        const testStore = createStore();
        expect(testStore).toBeDefined();
        expect(configureStore).toHaveBeenCalled();
    });

    it('should export a valid running store instance by default', async () => {
        vi.doMock('../utils/constants', () => ({ LOG_REDUX_ACTIONS: false }));
        const { store } = await import('./store');

        expect(store).toBeDefined();
        expect(typeof store.dispatch).toBe('function');
        expect(typeof store.getState).toBe('function');
    });
});