import type { Component } from "../types/whiteboard";

/**
 * Generates the next available ID for a new component
 * @param components - Array of existing components
 * @returns Next available ID (max + 1)
 */
export function getNextComponentId(components: Component[]): number {
  return Math.max(...components.map((c) => c.id), 0) + 1;
}

/**
 * Gets the highest z-index from existing components
 * @param components - Array of existing components
 * @returns Highest z-index value
 */
export function getMaxZIndex(components: Component[]): number {
  return Math.max(...components.map((c) => c.zIndex || 0), 0);
}
