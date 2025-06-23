/**
 * Component-specific loggers for the whiteboard application
 *
 * This file exports pre-configured loggers for different parts of the application,
 * making it easy to track logs by component and maintain consistent context.
 */

import { Logger } from "./logger";

// Create loggers for different components/modules
export const whiteboardLogger = new Logger({
  context: { component: "whiteboard" },
});

export const stateLogger = new Logger({
  context: { component: "state" },
});

export const eventLogger = new Logger({
  context: { component: "events" },
});

export const dragDropLogger = new Logger({
  context: { component: "drag-drop" },
});

export const clipboardLogger = new Logger({
  context: { component: "clipboard" },
});

export const urlLogger = new Logger({
  context: { component: "url-detection" },
});

export const widgetLogger = new Logger({
  context: { component: "widgets" },
});

export const shapeLogger = new Logger({
  context: { component: "shapes" },
});

export const zoomLogger = new Logger({
  context: { component: "zoom" },
});

export const panLogger = new Logger({
  context: { component: "pan" },
});

// Helper function to create component-specific logger
export function createComponentLogger(componentName: string): Logger {
  return new Logger({
    context: { component: componentName },
  });
}

// Helper function to create action-specific logger
export function createActionLogger(component: string, action: string): Logger {
  return new Logger({
    context: { component, action },
  });
}
