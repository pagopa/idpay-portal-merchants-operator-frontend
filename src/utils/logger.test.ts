import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

vi.mock('axios', () => ({
  isAxiosError: vi.fn(),
}));

describe('logger.ts', () => {
  const originalConsole = { ...console };

  beforeEach(() => {
    vi.resetModules();
    console.log = vi.fn();
    console.info = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
    console.debug = vi.fn();
    console.trace = vi.fn();
    console.groupCollapsed = vi.fn();
    console.groupEnd = vi.fn();
  });

  afterAll(() => {
    Object.assign(console, originalConsole);
  });

  it('logger methods are no-op when DEBUG_CONSOLE is false', async () => {
    vi.doMock('./constants', () => ({ DEBUG_CONSOLE: false }));
    const { logger } = await import('./logger');

    logger.log('test');
    logger.error('err');

    expect(console.log).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('logger methods call console when DEBUG_CONSOLE is true', async () => {
    vi.doMock('./constants', () => ({ DEBUG_CONSOLE: true }));
    const { logger } = await import('./logger');

    logger.log('a');
    logger.info('b');
    logger.warn('c');
    logger.error('d');
    logger.debug('e');
    logger.trace('f');
    logger.groupCollapsed('g');
    logger.groupEnd();

    expect(console.log).toHaveBeenCalledWith('a');
    expect(console.info).toHaveBeenCalledWith('b');
    expect(console.warn).toHaveBeenCalledWith('c');
    expect(console.error).toHaveBeenCalledWith('d');
    expect(console.debug).toHaveBeenCalled();
    expect(console.trace).toHaveBeenCalled();
    expect(console.groupCollapsed).toHaveBeenCalledWith('g');
    expect(console.groupEnd).toHaveBeenCalled();
  });

  it('logApiError handles non-axios error', async () => {
    vi.doMock('./constants', () => ({ DEBUG_CONSOLE: true }));
    const axios = await import('axios');
    (axios.isAxiosError as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    const { logApiError } = await import('./logger');

    const error = new Error('Boom');

    logApiError(error, 'TestAPI', { foo: 'bar' });

    expect(console.groupCollapsed).toHaveBeenCalledWith('[API ERROR] TestAPI');
    expect(console.error).toHaveBeenCalled();
    expect(console.groupEnd).toHaveBeenCalled();
  });

  it('logApiError handles axios error with response', async () => {
    vi.doMock('./constants', () => ({ DEBUG_CONSOLE: true }));
    const axios = await import('axios');
    (axios.isAxiosError as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

    const { logApiError } = await import('./logger');

    const axiosError = {
      response: {
        status: 400,
        data: { errorKey: 'ERR_KEY', message: 'Bad request' },
      },
      config: {
        url: '/test',
        method: 'post',
      },
      message: 'Axios failed',
      name: 'AxiosError',
      stack: 'stacktrace',
    };

    logApiError(axiosError, 'AxiosAPI');

    expect(console.groupCollapsed).toHaveBeenCalledWith('[API ERROR] AxiosAPI');
    expect(console.error).toHaveBeenCalledWith('Error Key: ERR_KEY');
    expect(console.error).toHaveBeenCalledWith('HTTP Status:', 400);
    expect(console.error).toHaveBeenCalledWith('URL:', '/test');
    expect(console.error).toHaveBeenCalledWith('Method:', 'post');
    expect(console.groupEnd).toHaveBeenCalled();
  });

  it('logApiError covers edge: error as string, undefined, null, and without apiName or originalResponse', async () => {
    vi.doMock('./constants', () => ({ DEBUG_CONSOLE: true }));
    const axios = await import('axios');
    // Not an axios error
    (axios.isAxiosError as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    const { logApiError } = await import('./logger');

    logApiError('simple error string');
    logApiError(undefined);
    logApiError(null, undefined, undefined);
    logApiError({}, undefined, undefined);

    expect(console.groupCollapsed).toHaveBeenCalledWith('[API ERROR]');
    expect(console.error).toHaveBeenCalled();
    expect(console.groupEnd).toHaveBeenCalled();
  });

  it('logApiError is no-op when DEBUG_CONSOLE is false', async () => {
    vi.doMock('./constants', () => ({ DEBUG_CONSOLE: false }));
    const { logApiError } = await import('./logger');

    logApiError(new Error('Should not log'));

    expect(console.groupCollapsed).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });
});
