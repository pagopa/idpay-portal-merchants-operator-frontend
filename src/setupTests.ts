import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock("*.css", () => ({}));
vi.mock("*.scss", () => ({}));
vi.mock("*.sass", () => ({}));