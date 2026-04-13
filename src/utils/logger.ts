import { DEBUG_CONSOLE } from './constants';
import { isAxiosError } from 'axios';

/**
 * Centralized browser console logger.
 * All methods are no-op when DEBUG_CONSOLE is false.
 */
type ConsoleMethod = (...args: unknown[]) => void;

const noop: ConsoleMethod = () => undefined;

const safe =
  (method: ConsoleMethod): ConsoleMethod =>
  (...args: unknown[]) => {
    if (!DEBUG_CONSOLE) {
      return;
    }
    method(...args);
  };

export const logger = {
  log: safe(console.log.bind(console)),
  info: safe(console.info.bind(console)),
  warn: safe(console.warn.bind(console)),
  error: safe(console.error.bind(console)),
  debug: safe((console.debug ?? console.log).bind(console)),
  trace: safe((console.trace ?? console.log).bind(console)),
  groupCollapsed: safe((console.groupCollapsed ?? console.log).bind(console) as ConsoleMethod),
  groupEnd: safe((console.groupEnd ?? noop).bind(console) as ConsoleMethod),
};

/**
 * Pretty printer safe for objects/strings/undefined.
 */
const pretty = (val: unknown) =>
  typeof val === 'string' ? val : val !== undefined ? JSON.stringify(val, null, 2) : 'N/A';

/**
 * Logs API errors in a grouped format, guarded by DEBUG_CONSOLE.
 * Keeps console output consistent and reduces accidental information leakage in prod.
 */
export function logApiError(error: unknown, apiName?: string, originalResponse?: unknown) {
  if (!DEBUG_CONSOLE) {
    return;
  }

  const apiLabel = apiName ? `[API ERROR] ${apiName}` : '[API ERROR]';

  logger.groupCollapsed(apiLabel);

  if (isAxiosError(error)) {
    const status = error.response?.status ?? 'N/A';
    const errorKey = (error.response?.data as { errorKey?: string } | undefined)?.errorKey;
    if (errorKey) {
      logger.error(`Error Key: ${errorKey}`);
    }
    logger.error('HTTP Status:', status);
    logger.error('URL:', error.config?.url ?? 'N/A');
    logger.error('Method:', error.config?.method ?? 'N/A');
    logger.error('Response data:', pretty(error.response?.data));
  }

  const errObj = error instanceof Error ? error : undefined;
  const errLike = ((): { message?: unknown; name?: unknown; stack?: unknown } => {
    if (typeof error === 'object' && error !== null) {
      const e = error as Record<string, unknown>;
      return { message: e['message'], name: e['name'], stack: e['stack'] };
    }
    return {};
  })();

  logger.error('Message:', pretty(errObj?.message ?? errLike.message));
  logger.error('Error name:', errObj?.name ?? (errLike.name as string) ?? 'N/A');
  logger.error('Stack:', pretty(errObj?.stack ?? errLike.stack));
  if (originalResponse !== undefined) {
    logger.error('Original response:', pretty(originalResponse));
  }
  logger.error('Full error object:', pretty(error));

  logger.groupEnd();
}
