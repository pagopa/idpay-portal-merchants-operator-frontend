import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAutoResetBanner } from './useAutoResetBanner';

describe('useAutoResetBanner', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllTimers();
    });

    it('should reset single state to false after delay', () => {
        const setter1 = vi.fn();
        const states = [[true, setter1]];

        renderHook(() => useAutoResetBanner(states, 5000));

        expect(setter1).not.toHaveBeenCalled();

        vi.advanceTimersByTime(5000);

        expect(setter1).toHaveBeenCalledTimes(1);
        expect(setter1).toHaveBeenCalledWith(false);
    });

    it('should reset multiple states to false after delay', () => {
        const setter1 = vi.fn();
        const setter2 = vi.fn();
        const setter3 = vi.fn();
        const states = [
            [true, setter1],
            [true, setter2],
            [true, setter3]
        ];

        renderHook(() => useAutoResetBanner(states, 5000));

        vi.advanceTimersByTime(5000);

        expect(setter1).toHaveBeenCalledWith(false);
        expect(setter2).toHaveBeenCalledWith(false);
        expect(setter3).toHaveBeenCalledWith(false);
    });

    it('should not reset states that are false', () => {
        const setter1 = vi.fn();
        const setter2 = vi.fn();
        const setter3 = vi.fn();
        const states = [
            [true, setter1],
            [false, setter2],
            [true, setter3]
        ];

        renderHook(() => useAutoResetBanner(states, 5000));

        vi.advanceTimersByTime(5000);

        expect(setter1).toHaveBeenCalledWith(false);
        expect(setter2).not.toHaveBeenCalled();
        expect(setter3).toHaveBeenCalledWith(false);
    });

    it('should use custom delay', () => {
        const setter1 = vi.fn();
        const states = [[true, setter1]];

        renderHook(() => useAutoResetBanner(states, 3000));

        vi.advanceTimersByTime(2999);
        expect(setter1).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(setter1).toHaveBeenCalledWith(false);
    });

    it('should clear timers on unmount', () => {
        const setter1 = vi.fn();
        const states = [[true, setter1]];

        const { unmount } = renderHook(() => useAutoResetBanner(states, 5000));

        unmount();

        vi.advanceTimersByTime(5000);

        expect(setter1).not.toHaveBeenCalled();
    });

    it('should handle empty states array', () => {
        const states = [];

        expect(() => {
            renderHook(() => useAutoResetBanner(states, 5000));
            vi.advanceTimersByTime(5000);
        }).not.toThrow();
    });

    it('should restart timer when state changes from false to true', () => {
        const setter1 = vi.fn();
        let states = [[false, setter1]];

        const { rerender } = renderHook(() => useAutoResetBanner(states, 5000));

        vi.advanceTimersByTime(5000);
        expect(setter1).not.toHaveBeenCalled();

        states = [[true, setter1]];
        rerender();

        vi.advanceTimersByTime(5000);
        expect(setter1).toHaveBeenCalledWith(false);
    });

    it('should handle mixed true and false states correctly', () => {
        const setter1 = vi.fn();
        const setter2 = vi.fn();
        const setter3 = vi.fn();
        const setter4 = vi.fn();
        const states = [
            [true, setter1],
            [false, setter2],
            [true, setter3],
            [false, setter4]
        ];

        renderHook(() => useAutoResetBanner(states, 5000));

        vi.advanceTimersByTime(5000);

        expect(setter1).toHaveBeenCalledTimes(1);
        expect(setter2).not.toHaveBeenCalled();
        expect(setter3).toHaveBeenCalledTimes(1);
        expect(setter4).not.toHaveBeenCalled();
    });
});