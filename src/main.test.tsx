import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const renderMock = vi.fn();
const createRootMock = vi.fn(() => ({ render: renderMock }));

vi.mock('react-dom/client', () => ({
  createRoot: createRootMock,
}));

vi.mock('./App.tsx', () => ({ default: () => <div>Mocked App</div> }));
vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('@mui/material', () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  CssBaseline: () => <></>,
}));
vi.mock('@pagopa/mui-italia', () => ({ theme: {} }));
vi.mock('./locale', () => ({}));
vi.mock('./utils/oneTrustLoader.ts', () => ({
  initializeCookieOneTrust: vi.fn(() => Promise.resolve()),
}));
vi.mock('./redux/store.ts', () => ({ store: {} }));

describe('main.tsx bootstrap', () => {
  beforeEach(() => {
    vi.resetModules();
    renderMock.mockClear();
    createRootMock.mockClear();

    document.body.innerHTML = '';
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
  });

  it('should call createRoot and render the app', async () => {
    await import('./main');

    expect(createRootMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledTimes(1);
  }, 10000);

  it('should throw error if root element is missing', async () => {
    document.body.innerHTML = '';
    await expect(import('./main')).rejects.toThrowError('Failed to find the root element');
  }, 10000);
});
