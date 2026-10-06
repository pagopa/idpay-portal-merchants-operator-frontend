import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('*.css', () => ({}));
vi.mock('*.scss', () => ({}));
vi.mock('*.sass', () => ({}));

const createStorageMock = () => {
	let store: Record<string, string> = {};

	return {
		getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = String(value);
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		}),
	};
};

if (typeof window !== 'undefined') {
	if (!window.localStorage) {
		Object.defineProperty(window, 'localStorage', {
			value: createStorageMock(),
			configurable: true,
		});
	}

	if (!window.sessionStorage) {
		Object.defineProperty(window, 'sessionStorage', {
			value: createStorageMock(),
			configurable: true,
		});
	}
}
