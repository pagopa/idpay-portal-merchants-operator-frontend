import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import { useAppDispatch, useAppSelector } from './hooks';

vi.mock('react-redux', () => ({
    useDispatch: vi.fn(),
    useSelector: vi.fn(),
}));

describe('Redux Custom Hooks', () => {
    it('should invoke useDispatch and return the dispatch function', () => {
        const mockDispatch = vi.fn();
        vi.mocked(useDispatch).mockReturnValue(mockDispatch);

        const { result } = renderHook(() => useAppDispatch());

        expect(useDispatch).toHaveBeenCalled();
        expect(result.current).toBe(mockDispatch);
    });

    it('should reference the standard useSelector function', () => {
        expect(useAppSelector).toBe(useSelector);
    });
});