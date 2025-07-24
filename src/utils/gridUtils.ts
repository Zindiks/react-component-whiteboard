import { GRID_CONSTANTS } from "../constants/appConstants";

/**
 * Calculate dynamic grid size based on zoom level
 * All grid sizes are ensured to be divisible by 8px
 */
export function getDynamicGridSize(
  zoomLevel: number,
  baseGridSize?: number
): number {
  const baseSize = baseGridSize || GRID_CONSTANTS.SIZE; // 24px by default

  let calculatedSize: number;

  if (zoomLevel < 0.25) {
    // Very zoomed out - use large grid (4x base size)
    calculatedSize = baseSize * 4; // 96px (when base is 24px)
  } else if (zoomLevel < 0.5) {
    // Zoomed out - use medium-large grid (2x base size)
    calculatedSize = baseSize * 2; // 48px (when base is 24px)
  } else if (zoomLevel > 2) {
    // Zoomed in - use smaller grid
    calculatedSize = 16; // 16px (divisible by 8)
  } else if (zoomLevel > 4) {
    // Very zoomed in - use very small grid
    calculatedSize = 8; // 8px (divisible by 8)
  } else {
    // Normal zoom - use base size
    calculatedSize = baseSize; // 24px (base size)
  }

  // Ensure the result is divisible by 8
  return Math.round(calculatedSize / 8) * 8;
}

/**
 * Calculate dynamic opacity based on zoom level
 * Provides smooth opacity transitions for better visual experience
 */
export function getDynamicGridOpacity(
  zoomLevel: number,
  baseOpacity: number = GRID_CONSTANTS.OPACITY
): number {
  if (zoomLevel < 0.2) {
    return Math.max(baseOpacity * 0.3, 0.2); // Reduced minimum visibility
  } else if (zoomLevel < 0.4) {
    return Math.max(baseOpacity * 0.5, 0.3); // Reduced minimum visibility
  } else if (zoomLevel < 0.7) {
    return Math.max(baseOpacity * 0.7, 0.45); // Reduced minimum visibility
  } else if (zoomLevel > 2) {
    return Math.min(baseOpacity * 1.1, 0.85); // Slightly less visible when zoomed in
  }

  return baseOpacity;
}

/**
 * Calculate dynamic stroke width for grid lines based on zoom and grid size
 */
export function getDynamicStrokeWidth(
  zoomLevel: number,
  gridSize: number,
  baseGridSize: number
): number {
  return (GRID_CONSTANTS.STROKE_WIDTH / zoomLevel) * (gridSize / baseGridSize);
}

/**
 * Snap a coordinate to the dynamic grid
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Snap a point (x, y) to the dynamic grid
 */
export function snapPointToGrid(
  x: number,
  y: number,
  gridSize: number
): { x: number; y: number } {
  return {
    x: snapToGrid(x, gridSize),
    y: snapToGrid(y, gridSize),
  };
}

/**
 * Snap size to nearest 24px increment
 * @param size - The size to snap
 * @returns The snapped size (multiple of 24px)
 */
export const snapSizeToGrid = (size: number): number => {
  if (size < GRID_CONSTANTS.SIZE) return GRID_CONSTANTS.SIZE; // Minimum size of 24px

  // Snap to nearest multiple of 24px
  return Math.round(size / GRID_CONSTANTS.SIZE) * GRID_CONSTANTS.SIZE;
};
