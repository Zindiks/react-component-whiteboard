/**
 * Widget Constants
 *
 * Constants specific to widget behavior and sizing
 * Extracted from appConstants.ts for better organization
 */

export const WIDGET_CONSTANTS = {
  // Default dimensions
  DEFAULT_SIZE: {
    WIDTH: 192,
    HEIGHT: 192,
    MIN_WIDTH: 192,
    MIN_HEIGHT: 144,
  },

  // Widget-specific sizes
  SIZES: {
    YOUTUBE: { WIDTH: 384, HEIGHT: 288 },
    SOUNDCLOUD: { WIDTH: 384, HEIGHT: 192 },
    SPOTIFY: { WIDTH: 384, HEIGHT: 192 },
    SCROLLING_TEXT: { WIDTH: 384, HEIGHT: 72 },
    TIMER: { WIDTH: 192, HEIGHT: 144 },
    WEATHER: { WIDTH: 256, HEIGHT: 192 },
    BITCOIN: { WIDTH: 320, HEIGHT: 240 },
    CURRENCY: { WIDTH: 288, HEIGHT: 200 },
  },

  // Behavior
  BEHAVIOR: {
    TIMER_UPDATE_INTERVAL_MS: 1000,
    WEATHER_UPDATE_INTERVAL_MS: 300000, // 5 minutes
    CRYPTO_UPDATE_INTERVAL_MS: 60000, // 1 minute
    SCROLLING_SPEED_DEFAULT: 50,
    SCROLLING_SPEED_MIN: 10,
    SCROLLING_SPEED_MAX: 200,
  },

  // Resizing
  RESIZE: {
    HANDLE_SIZE: 8,
    MIN_RESIZE_SIZE: 50,
    SNAP_TO_GRID: true,
    MAINTAIN_ASPECT_RATIO: ["youtube", "image"],
  },

  // Text editing
  TEXT: {
    DEFAULT_FONT_SIZE: 16,
    MIN_FONT_SIZE: 8,
    MAX_FONT_SIZE: 72,
    DEFAULT_FONT_FAMILY: "Inter, sans-serif",
    DEFAULT_COLOR: "#000000",
    LINE_HEIGHT: 1.4,
  },
} as const;
