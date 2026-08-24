import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useActionPermission } from "./useActionPermission"

vi.mock('react-i18next', () => ({
    useTranslation: vi.fn()
}));

vi.mock('./useScopedTranslation', () => ({
    useScopedTranslation: vi.fn(() => ({
        config: () => ['PUBLISHED'],
    })),
}));

describe('useActionPermission', () => {
    it('should return true if initiative.status !== CLOSED', () => {
        const { result } = renderHook(() => useActionPermission());

        expect(result.current.getPermission('commons.permissions.initiativesStatus', 'PUBLISHED')).toBe(true)
    })
    it('should return false if initiative.status === CLOSED', () => {
        const { result } = renderHook(() => useActionPermission());

        expect(result.current.getPermission('commons.permissions.initiativesStatus', 'CLOSED')).toBe(false)
    })
})