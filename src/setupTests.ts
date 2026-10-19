import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('*.css', () => ({}));
vi.mock('*.scss', () => ({}));
vi.mock('*.sass', () => ({}));
