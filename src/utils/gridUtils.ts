import { GRID_CONSTANTS } from "../constants/appConstants";

/**
 * Calculate dynamic grid size based on zoom level
 * This matches the logic used in GridBackground component
 */
export function getDynamicGridSize(zoomLevel: number): number {
  const baseGridSize = GRID_CONSTANTS.SIZE;

  // Use the same logic as GridBackground component
  if (zoomLevel < 0.25) {
    // Very zoomed out - use large grid (4x base size)
    return baseGridSize * 4;
  } else if (zoomLevel < 0.5) {
    // Zoomed out - use medium-large grid (2x base size)
    return baseGridSize * 2;
  } else if (zoomLevel > 2) {
    // Zoomed in - use smaller grid (half base size)
    return baseGridSize * 0.5;
  } else if (zoomLevel > 4) {
    // Very zoomed in - use very small grid (quarter base size)
    return baseGridSize * 0.25;
  }

  // Normal zoom - use base size
  return baseGridSize;
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
