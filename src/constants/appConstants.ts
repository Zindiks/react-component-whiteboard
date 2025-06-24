/**
 * Application Constants
 *
 * This file contains all the hardcoded values used throughout the application
 * to ensure consistency and easy maintenance.
 */

// Zoom and Viewport Constants
export const ZOOM_CONSTANTS = {
  MIN_ZOOM: 0.1, // Minimum zoom level (10%)
  MAX_ZOOM: 7, // Maximum zoom level (700%)
  ZOOM_INTENSITY: 0.015, // Zoom sensitivity for wheel events
  PAN_SENSITIVITY: 1.0, // Pan sensitivity for two-finger trackpad scrolling
  ZOOM_INDICATOR_TIMEOUT_MS: 200, // Duration to show zoom indicator
  RESET_ZOOM: 1, // Default zoom level (100%)
  FIT_TO_CONTENT_PADDING: 50, // Padding around content when fitting to view
} as const;

// Component Size Constants
export const COMPONENT_SIZES = {
  // Default component dimensions
  DEFAULT_WIDTH: 200,
  DEFAULT_HEIGHT: 200,

  // Minimum component sizes
  MIN_WIDTH: 200,
  MIN_HEIGHT: 150,

  // Maximum image size before scaling
  MAX_IMAGE_SIZE: 400,

  // YouTube video dimensions (4:3 aspect ratio)
  YOUTUBE_WIDTH: 400,
  YOUTUBE_HEIGHT: 300,

  // SoundCloud widget dimensions
  SOUNDCLOUD_WIDTH: 400,
  SOUNDCLOUD_HEIGHT: 200,

  // Spotify widget dimensions
  SPOTIFY_WIDTH: 400,
  SPOTIFY_HEIGHT: 200,

  // Scrolling text widget dimensions
  SCROLLING_TEXT_WIDTH: 400,

  // Text note fallback dimensions when image load fails
  IMAGE_FALLBACK_WIDTH: 200,
  IMAGE_FALLBACK_HEIGHT: 150,
} as const;

// Layout and Spacing Constants
export const LAYOUT_CONSTANTS = {
  // Whiteboard bounds padding
  WHITEBOARD_PADDING: 200,

  // Default whiteboard bounds when no components exist
  DEFAULT_WHITEBOARD_SIZE: 1000,

  // Icon sizes
  ICON_SIZE_SMALL: 20,
  ICON_SIZE_MEDIUM: 24,
  ICON_SIZE_LARGE: 32,
} as const;

// Z-Index Constants
export const Z_INDEX = {
  MARQUEE_SELECTION: 9999,
  ZOOM_INDICATOR: 10000,
  DRAG_OVERLAY: 1000,
  OVERVIEW_MODAL: 10001,
} as const;

// Color and Theme Constants
export const COLORS = {
  // Primary blue colors
  PRIMARY_BLUE: "rgb(59, 130, 246)",
  PRIMARY_BLUE_LIGHT: "rgba(59, 130, 246, 0.1)",
  PRIMARY_BLUE_DARK: "rgba(59, 130, 246, 0.9)",

  // Black/White with transparency
  BLACK_OVERLAY: "rgba(0, 0, 0, 0.4)",
  BLACK_SHADOW: "rgba(0, 0, 0, 0.15)",
  BLACK_SHADOW_STRONG: "rgba(0, 0, 0, 0.2)",
  WHITE_BORDER: "rgba(255, 255, 255, 0.1)",

  // Dashed border for marquee selection
  MARQUEE_BORDER: "2px dashed #3b82f6",
} as const;

// Animation and Transition Constants
export const ANIMATIONS = {
  ZOOM_FADE_IN: "zoomFadeIn 0.2s ease-out",
  ZOOM_FADE_OUT: "zoomFadeOut 0.3s ease-in",
  NAVIGATION_DURATION: 750, // Duration for navigation transitions in ms
} as const;

// Font and Typography Constants
export const TYPOGRAPHY = {
  FONT_WEIGHT_MEDIUM: "500",
  FONT_WEIGHT_SEMIBOLD: "600",
  BORDER_RADIUS_LARGE: "12px",
  BORDER_RADIUS_MEDIUM: "8px",
} as const;

// Percentage Constants
export const PERCENTAGE = {
  HUNDRED_PERCENT: 100, // For zoom percentage calculations
} as const;

// Input and Interaction Constants
export const INTERACTION = {
  // Mouse button codes
  MIDDLE_MOUSE_BUTTON: 1,
  RIGHT_MOUSE_BUTTON: 2,
  LEFT_MOUSE_BUTTON: 0,

  // Touch interaction thresholds
  MIN_TOUCH_POINTS: 2, // For pinch-to-zoom
} as const;

// Widget-specific Constants
export const WIDGET_CONSTANTS = {
  // Text Note widget
  TEXT_NOTE_MIN_WIDTH: 200,
  TEXT_NOTE_MIN_HEIGHT: 150,
  TEXT_NOTE_HEADER_HEIGHT: 60,
  TEXT_NOTE_ICON_SIZE: 20,

  // Timer widget
  TIMER_UPDATE_INTERVAL_MS: 1000,

  // ScrollingText widget
  SCROLLING_TEXT_DEFAULT_WIDTH: 400,

  // Button sizes (for h-8 w-8 pattern)
  BUTTON_SIZE_SMALL: 8,

  // Border widths
  BORDER_WIDTH_QUOTE: 4, // border-l-4
  BORDER_WIDTH_NORMAL: 3, // pl-3

  // Weather widget
  WEATHER_UPDATE_INTERVAL_MS: 10 * 60 * 1000, // 10 minutes

  // Watch widget
  WATCH_UPDATE_INTERVAL_MS: 1000, // 1 second

  // StylishLink widget
  COPY_FEEDBACK_TIMEOUT_MS: 2000, // 2 seconds
} as const;

// Shape Constants
export const SHAPE_CONSTANTS = {
  MIN_SHAPE_SIZE: 20, // Minimum width/height for resizable shapes
} as const;

// Initial Component Positions
export const INITIAL_POSITIONS = {
  TIMER: { x: 100, y: 100 },
  WEATHER: { x: 300, y: 200 },
  BITCOIN: { x: 600, y: 100 },
  CURRENCY: { x: 100, y: 400 },
  CONFETTI: { x: 400, y: 400 },
  NOTE: { x: 700, y: 400 },
  WATCH: { x: 1000, y: 100 },
  SCROLLING_TEXT: { x: 1000, y: 400 },
  YOUTUBE_VIDEO: { x: 500, y: 200 },
  SOUNDCLOUD: { x: 800, y: 200 },
  SPOTIFY: { x: 300, y: 600 },
  STYLISH_LINK: { x: 600, y: 600 },
} as const;

// Grid Background Constants
export const GRID_CONSTANTS = {
  SIZE: 30, // Larger grid cell size for visibility
  COLOR: "#ff0000", // Bright red for debugging
  STROKE_WIDTH: 2, // Thick grid lines for visibility
  OPACITY: 1, // Fully opaque grid
  ENABLED: true as boolean, // Grid enabled by default
} as const;
