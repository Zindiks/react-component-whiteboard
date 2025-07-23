import { GRID_CONSTANTS } from "../constants/appConstants";

/**
 * Calculate dynamic grid size based on zoom level
 * This matches the logic used in GridBackground component
 * All grid sizes are ensured to be divisible by 8px
 */
export function getDynamicGridSize(zoomLevel: number): number {
  const baseGridSize = GRID_CONSTANTS.SIZE; // 24px

  let calculatedSize: number;

  // Use the same logic as GridBackground component
  if (zoomLevel < 0.25) {
    // Very zoomed out - use large grid (4x base size)
    calculatedSize = baseGridSize * 4; // 96px
  } else if (zoomLevel < 0.5) {
    // Zoomed out - use medium-large grid (2x base size)
    calculatedSize = baseGridSize * 2; // 48px
  } else if (zoomLevel > 2) {
    // Zoomed in - use smaller grid (2/3 base size)
    calculatedSize = 16; // 16px (divisible by 8)
  } else if (zoomLevel > 4) {
    // Very zoomed in - use very small grid (1/3 base size)
    calculatedSize = 8; // 8px (divisible by 8)
  } else {
    // Normal zoom - use base size
    calculatedSize = baseGridSize; // 24px
  }

  // Ensure the result is divisible by 8
  return Math.round(calculatedSize / 8) * 8;
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
  if (size < 24) return 24; // Minimum size of 24px

  // Snap to nearest multiple of 24px
  return Math.round(size / 24) * 24;
};
