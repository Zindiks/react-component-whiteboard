import type { Component } from "../types/whiteboard";

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/**
 * Calculate bounding box for an array of components
 * @param components - Array of components
 * @returns Bounding box containing all components
 */
export function getComponentsBounds(components: Component[]): BoundingBox {
  if (components.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  return components.reduce(
    (acc, comp) => ({
      minX: Math.min(acc.minX, comp.x),
      minY: Math.min(acc.minY, comp.y),
      maxX: Math.max(acc.maxX, comp.x + (comp.width || 200)),
      maxY: Math.max(acc.maxY, comp.y + (comp.height || 200)),
    }),
    {
      minX: components[0].x,
      minY: components[0].y,
      maxX: components[0].x + (components[0].width || 200),
      maxY: components[0].y + (components[0].height || 200),
    }
  );
}

/**
 * Create a rectangle from two points (useful for marquee selection)
 * @param point1 - First point
 * @param point2 - Second point
 * @returns Rectangle definition
 */
export function createRectFromPoints(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): Rect {
  const left = Math.min(point1.x, point2.x);
  const right = Math.max(point1.x, point2.x);
  const top = Math.min(point1.y, point2.y);
  const bottom = Math.max(point1.y, point2.y);

  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}
