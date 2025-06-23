/**
 * Environment Configuration for Logging
 *
 * Add these environment variables to your .env file to configure logging:
 *
 * # Log Level (ERROR, WARN, INFO, DEBUG, TRACE)
 * VITE_LOG_LEVEL=DEBUG
 *
 * # Force console logs (true/false) - overrides default behavior
 * VITE_FORCE_CONSOLE_LOGS=true
 *
 * # Remote logging endpoint (optional)
 * VITE_LOG_ENDPOINT=https://your-logging-service.com/api/logs
 *
 * # Enable remote logging (true/false)
 * VITE_ENABLE_REMOTE_LOGGING=false
 */

// Example .env.development
/*
MODE=development
VITE_LOG_LEVEL=DEBUG
VITE_FORCE_CONSOLE_LOGS=true
VITE_ENABLE_REMOTE_LOGGING=false
*/

// Example .env.production
/*
MODE=production
VITE_LOG_LEVEL=ERROR
VITE_FORCE_CONSOLE_LOGS=false
VITE_ENABLE_REMOTE_LOGGING=true
VITE_LOG_ENDPOINT=https://your-logging-service.com/api/logs
*/

export {};
