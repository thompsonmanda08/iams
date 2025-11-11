/**
 * Structured logging utility for consistent logging across the application
 * Provides type-safe logging with structured metadata for debugging and monitoring
 */

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogContext {
  function?: string;
  component?: string;
  userId?: string;
  sessionId?: string;
  endpoint?: string;
  [key: string]: any;
}

/**
 * Structured logger object with consistent format
 * All logs include timestamp and context information
 * Useful for filtering/searching in production logging services
 */
export const logger = {
  /**
   * Log informational messages
   * @param message Human-readable log message
   * @param context Optional context object with metadata
   */
  info: (message: string, context?: LogContext) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] ${message}`, context || "");
  },

  /**
   * Log warning messages
   * @param message Human-readable warning message
   * @param context Optional context object with metadata
   */
  warn: (message: string, context?: LogContext) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] ${message}`, context || "");
  },

  /**
   * Log error messages with error details
   * @param message Human-readable error message
   * @param error Error object or string
   * @param context Optional context object with metadata
   */
  error: (message: string, error?: Error | any, context?: LogContext) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] ${message}`, {
      error: error?.message || error,
      stack: error?.stack,
      ...context
    });
  },

  /**
   * Log debug messages (only in development)
   * @param message Human-readable debug message
   * @param context Optional context object with metadata
   */
  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === "development") {
      const timestamp = new Date().toISOString();
      console.debug(`[${timestamp}] [DEBUG] ${message}`, context || "");
    }
  }
};

/**
 * Create a logger with a fixed context (e.g., for a specific module)
 * Useful for adding consistent context across multiple log calls
 * @param moduleContext Base context to include in all logs from this logger
 * @returns Logger object with context pre-filled
 */
export const createLogger = (moduleContext: LogContext) => ({
  info: (message: string, context?: LogContext) =>
    logger.info(message, { ...moduleContext, ...context }),
  warn: (message: string, context?: LogContext) =>
    logger.warn(message, { ...moduleContext, ...context }),
  error: (message: string, error?: Error | any, context?: LogContext) =>
    logger.error(message, error, { ...moduleContext, ...context }),
  debug: (message: string, context?: LogContext) =>
    logger.debug(message, { ...moduleContext, ...context })
});
