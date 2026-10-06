import { describe, it, expect, vi } from 'vitest';
import { config } from './config';

vi.mock('../../routes', () => ({
    default: {
        BUY_MANAGEMENT: '/buy-management',
        REFUNDS_MANAGEMENT: '/refunds-management',
        PRODUCTS: '/products',
    },
}));

describe('Side Menu Configuration', () => {
    it('should be defined as an array with exactly three items', () => {
        expect(Array.isArray(config)).toBe(true);
        expect(config).toHaveLength(3);
    });

    it('should ensure each configuration item contains all required properties', () => {
        config.forEach((item) => {
            expect(item).toHaveProperty('key');
            expect(item).toHaveProperty('title');
            expect(item).toHaveProperty('route');
            expect(item).toHaveProperty('icon');
            expect(item).toHaveProperty('dataTestId');
            expect(item.dataTestId).toBe('initiativeList-click-test');
        });
    });

    it('should map the purchaseManagement item accurately', () => {
        const item = config.find((c) => c.key === 'purchaseManagement');
        expect(item).toBeDefined();
        expect(item?.title).toBe('commons.sideMenu.purchaseManagement');
        expect(item?.route).toBe('/buy-management');
        expect(item?.icon).toBeDefined();
    });

    it('should map the refundManagement item accurately', () => {
        const item = config.find((c) => c.key === 'refundManagement');
        expect(item).toBeDefined();
        expect(item?.title).toBe('commons.sideMenu.refundManagement');
        expect(item?.route).toBe('/refunds-management');
        expect(item?.icon).toBeDefined();
    });

    it('should map the products item accurately', () => {
        const item = config.find((c) => c.key === 'products');
        expect(item).toBeDefined();
        expect(item?.title).toBe('commons.sideMenu.products');
        expect(item?.route).toBe('/products');
        expect(item?.icon).toBeDefined();
    });
});