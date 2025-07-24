/**
 * Canvas Constants
 *
 * Constants specific to canvas/whiteboard behavior
 * Extracted from appConstants.ts for better organization
 */

export const CANVAS_CONSTANTS = {
  // Grid system
  GRID: {
    SIZE: 24,
    SNAP_THRESHOLD: 12,
    SHOW_DOTS: true,
    DOT_SIZE: 1,
    DOT_COLOR: "#e0e0e0",
    LINE_COLOR: "#f0f0f0",
    MAJOR_LINE_INTERVAL: 5,
  },

  // Zoom and viewport
  ZOOM: {
    MIN: 0.1,
    MAX: 7,
    DEFAULT: 1,
    INTENSITY: 0.015,
    INDICATOR_TIMEOUT_MS: 200,
    FIT_PADDING: 50,
  },

  // Pan behavior
  PAN: {
    SENSITIVITY: 2.0,
    MOMENTUM_DECAY: 0.95,
    MIN_MOMENTUM: 0.1,
  },

  // Selection
  SELECTION: {
    RING_WIDTH: 2,
    RING_COLOR: "#3b82f6",
    MULTI_SELECT_COLOR: "#10b981",
    MARQUEE_COLOR: "rgba(59, 130, 246, 0.2)",
    MARQUEE_BORDER: "1px solid #3b82f6",
  },

  // Drag behavior
  DRAG: {
    THRESHOLD: 5,
    PREVIEW_OPACITY: 0.5,
    SNAP_DISTANCE: 12,
    AXIS_LOCK_THRESHOLD: 10,
  },
} as const;
