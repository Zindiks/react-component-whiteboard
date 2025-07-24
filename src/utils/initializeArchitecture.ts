/**
 * Initialize Modern Whiteboard Architecture
 *
 * Sets up the unified Zustand stores and widget registry
 * Call this once at app startup
 */

import {
  registerWidgets,
  WidgetDefinition,
} from "../stores/widgetRegistryStore";

// Widget definitions for existing components
const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  // Widgets
  {
    type: "timer",
    component: () => null, // Will be replaced with actual components
    category: "widget",
    displayName: "Timer",
    description: "A countdown timer widget",
    isResizable: true,
    isEditable: false,
    hasHeader: true,
  },
  {
    type: "weather",
    component: () => null,
    category: "widget",
    displayName: "Weather",
    description: "Current weather conditions",
    isResizable: true,
    isEditable: false,
    hasHeader: true,
  },
  {
    type: "bitcoin",
    component: () => null,
    category: "widget",
    displayName: "Bitcoin Chart",
    description: "Bitcoin price chart",
    isResizable: true,
    isEditable: false,
    hasHeader: true,
  },
  {
    type: "currency",
    component: () => null,
    category: "widget",
    displayName: "Currency Converter",
    description: "Convert between currencies",
    isResizable: true,
    isEditable: true,
    hasHeader: true,
  },
  {
    type: "note",
    component: () => null,
    category: "widget",
    displayName: "Text Note",
    description: "Editable text note",
    isResizable: true,
    isEditable: true,
    hasHeader: true,
  },
  {
    type: "confetti",
    component: () => null,
    category: "widget",
    displayName: "Confetti Button",
    description: "Trigger confetti animations",
    isResizable: false,
    isEditable: false,
    hasHeader: false,
  },

  // Shapes
  {
    type: "rectangle",
    component: () => null,
    category: "shape",
    displayName: "Rectangle",
    description: "Basic rectangle shape",
    isResizable: true,
    isEditable: false,
    hasHeader: false,
  },
  {
    type: "ellipse",
    component: () => null,
    category: "shape",
    displayName: "Ellipse",
    description: "Basic ellipse shape",
    isResizable: true,
    isEditable: false,
    hasHeader: false,
  },
  {
    type: "arrow",
    component: () => null,
    category: "shape",
    displayName: "Arrow",
    description: "Directional arrow shape",
    isResizable: true,
    isEditable: false,
    hasHeader: false,
  },
  {
    type: "line",
    component: () => null,
    category: "shape",
    displayName: "Line",
    description: "Straight line shape",
    isResizable: true,
    isEditable: false,
    hasHeader: false,
  },
  {
    type: "text",
    component: () => null,
    category: "shape",
    displayName: "Text",
    description: "Editable text element",
    isResizable: true,
    isEditable: true,
    hasHeader: false,
  },
];

/**
 * Initialize the modern whiteboard architecture
 * Call this once during app startup
 */
export const initializeWhiteboardArchitecture = () => {
  console.log("🚀 Initializing Modern Whiteboard Architecture...");

  // Register all widget definitions
  registerWidgets(WIDGET_DEFINITIONS);

  console.log("✅ Whiteboard architecture initialized successfully!");
  console.log(`📦 Registered ${WIDGET_DEFINITIONS.length} widget types`);

  // Optional: Log registered widgets in development
  if (process.env.NODE_ENV === "development") {
    console.group("📋 Registered Widget Types:");
    WIDGET_DEFINITIONS.forEach((widget) => {
      console.log(
        `  • ${widget.displayName} (${widget.type}) - ${widget.category}`
      );
    });
    console.groupEnd();
  }
};

/**
 * Get the current architecture status for debugging
 */
export const getArchitectureStatus = () => {
  return {
    widgetTypes: WIDGET_DEFINITIONS.length,
    categories: {
      widgets: WIDGET_DEFINITIONS.filter((w) => w.category === "widget").length,
      shapes: WIDGET_DEFINITIONS.filter((w) => w.category === "shape").length,
    },
  };
};
