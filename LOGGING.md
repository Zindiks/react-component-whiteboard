# Logging System

The whiteboard application uses a configurable logging system that replaces all console statements with structured logging. This provides better control over log output and enables integration with external logging services.

## Features

- **Environment-based Configuration**: Different log levels for development/production
- **Component-specific Loggers**: Pre-configured loggers for different parts of the app
- **Structured Logging**: Consistent log format with context and metadata
- **Remote Logging Support**: Send logs to external services (configurable)
- **Performance Monitoring**: Built-in timing functions for performance tracking

## Usage

### Basic Logging

```typescript
import { log } from "../utils/logger";

// Simple logging
log.info("User action completed");
log.error("Something went wrong", { userId: "123" });
log.debug("Debug info", { data: someObject });
```

### Component-specific Logging

```typescript
import { stateLogger, widgetLogger } from "../utils/componentLoggers";

// State changes
stateLogger.debug("Component added", { componentId: 123, type: "timer" });

// Widget operations
widgetLogger.info("Widget created", { widgetType: "youtube", url: "..." });
```

### Performance Timing

```typescript
import { log } from "../utils/logger";

// Time a function
const result = log.time("expensive-operation", () => {
  return doExpensiveOperation();
});

// Time an async function
const result = await log.timeAsync("async-operation", async () => {
  return await doAsyncOperation();
});
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Log Level (ERROR=0, WARN=1, INFO=2, DEBUG=3, TRACE=4)
VITE_LOG_LEVEL=DEBUG

# Force console output (overrides default behavior)
VITE_FORCE_CONSOLE_LOGS=true

# Remote logging
VITE_ENABLE_REMOTE_LOGGING=false
VITE_LOG_ENDPOINT=https://your-service.com/logs
```

### Default Behavior

- **Production**: Only ERROR level logs, no console output
- **Development**: DEBUG level logs, console output enabled
- **Test**: WARN level logs, console output enabled

## Component Loggers

Pre-configured loggers for different parts of the application:

- `stateLogger` - State management operations
- `eventLogger` - Event handling
- `dragDropLogger` - Drag and drop operations
- `clipboardLogger` - Clipboard operations
- `urlLogger` - URL detection and processing
- `widgetLogger` - Widget creation and management
- `shapeLogger` - Shape operations
- `zoomLogger` - Zoom and pan operations

## Log Levels

- **ERROR (0)**: Critical errors that need immediate attention
- **WARN (1)**: Warning conditions that should be investigated
- **INFO (2)**: General information about application flow
- **DEBUG (3)**: Detailed information for debugging
- **TRACE (4)**: Very detailed tracing information

## Integration with External Services

The logger supports sending logs to external services. Configure the endpoint and enable remote logging:

```typescript
import { Logger } from "../utils/logger";

const logger = new Logger({
  enableRemote: true,
  remoteEndpoint: "https://your-logging-service.com/api/logs",
});
```

## Benefits

1. **Production Ready**: No console clutter in production builds
2. **Debugging**: Rich context and metadata for easier debugging
3. **Monitoring**: Can be integrated with monitoring services
4. **Performance**: Built-in performance timing capabilities
5. **Consistency**: Standardized logging format across the application
6. **Flexibility**: Easy to configure for different environments
