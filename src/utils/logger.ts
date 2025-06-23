/**
 * Configurable Logger Utility
 *
 * A production-ready logging solution that can be configured for different
 * environments and easily extended for other services. Supports various
 * log levels, context tracking, and can be integrated with external
 * logging services.
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

export interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  timestamp?: number;
  [key: string]: unknown;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  context?: LogContext;
}

class Logger {
  private config: LoggerConfig;
  private baseContext: LogContext;

  constructor(config: Partial<LoggerConfig> = {}) {
    // Default configuration
    this.config = {
      level: this.getLogLevelFromEnv(),
      enableConsole: this.shouldEnableConsole(),
      enableRemote: false,
      ...config,
    };

    this.baseContext = config.context || {};
  }

  private getLogLevelFromEnv(): LogLevel {
    const env = import.meta.env.MODE;
    const logLevel = import.meta.env.VITE_LOG_LEVEL;

    if (logLevel) {
      switch (logLevel.toUpperCase()) {
        case "ERROR":
          return LogLevel.ERROR;
        case "WARN":
          return LogLevel.WARN;
        case "INFO":
          return LogLevel.INFO;
        case "DEBUG":
          return LogLevel.DEBUG;
        case "TRACE":
          return LogLevel.TRACE;
        default:
          break;
      }
    }

    // Default levels based on environment
    switch (env) {
      case "production":
        return LogLevel.ERROR;
      case "development":
        return LogLevel.DEBUG;
      case "test":
        return LogLevel.WARN;
      default:
        return LogLevel.INFO;
    }
  }

  private shouldEnableConsole(): boolean {
    const env = import.meta.env.MODE;
    const forceConsole = import.meta.env.VITE_FORCE_CONSOLE_LOGS;

    if (forceConsole === "true") return true;
    if (forceConsole === "false") return false;

    // Enable console logs in development and test environments
    return env !== "production";
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level].padEnd(5);
    const contextStr = context
      ? ` [${JSON.stringify({ ...this.baseContext, ...context })}]`
      : "";

    return `[${timestamp}] ${levelStr}: ${message}${contextStr}`;
  }

  private logToConsole(
    level: LogLevel,
    message: string,
    context?: LogContext,
    ...args: unknown[]
  ): void {
    if (!this.config.enableConsole) return;

    const formattedMessage = this.formatMessage(level, message, context);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, ...args);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, ...args);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, ...args);
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.log(formattedMessage, ...args);
        break;
    }
  }

  private async logToRemote(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return;

    try {
      const payload = {
        level: LogLevel[level],
        message,
        context: { ...this.baseContext, ...context },
        timestamp: Date.now(),
        ...(error && {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        }),
      };

      // Send to remote logging service
      await fetch(this.config.remoteEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (remoteError) {
      // Fallback to console if remote logging fails
      console.error("Failed to send log to remote service:", remoteError);
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    return new Logger({
      ...this.config,
      context: { ...this.baseContext, ...context },
    });
  }

  /**
   * Update logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.context) {
      this.baseContext = { ...this.baseContext, ...config.context };
    }
  }

  /**
   * Log an error message
   */
  error(message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    this.logToConsole(LogLevel.ERROR, message, context, error);
    this.logToRemote(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    this.logToConsole(LogLevel.WARN, message, context);
    this.logToRemote(LogLevel.WARN, message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    this.logToConsole(LogLevel.INFO, message, context);
    this.logToRemote(LogLevel.INFO, message, context);
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    this.logToConsole(LogLevel.DEBUG, message, context);
    this.logToRemote(LogLevel.DEBUG, message, context);
  }

  /**
   * Log a trace message
   */
  trace(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.TRACE)) return;

    this.logToConsole(LogLevel.TRACE, message, context);
    this.logToRemote(LogLevel.TRACE, message, context);
  }

  /**
   * Time a function execution
   */
  time<T>(label: string, fn: () => T, context?: LogContext): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    this.debug(`${label} completed in ${duration.toFixed(2)}ms`, context);
    return result;
  }

  /**
   * Time an async function execution
   */
  async timeAsync<T>(
    label: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    this.debug(`${label} completed in ${duration.toFixed(2)}ms`, context);
    return result;
  }
}

// Create a default logger instance
const defaultLogger = new Logger();

// Export both the class and a default instance
export { Logger };
export default defaultLogger;

// Convenience functions using the default logger
export const log = {
  error: (message: string, context?: LogContext, error?: Error) =>
    defaultLogger.error(message, context, error),
  warn: (message: string, context?: LogContext) =>
    defaultLogger.warn(message, context),
  info: (message: string, context?: LogContext) =>
    defaultLogger.info(message, context),
  debug: (message: string, context?: LogContext) =>
    defaultLogger.debug(message, context),
  trace: (message: string, context?: LogContext) =>
    defaultLogger.trace(message, context),
  time: <T>(label: string, fn: () => T, context?: LogContext) =>
    defaultLogger.time(label, fn, context),
  timeAsync: <T>(label: string, fn: () => Promise<T>, context?: LogContext) =>
    defaultLogger.timeAsync(label, fn, context),
};
