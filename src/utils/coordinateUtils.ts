import type { ZoomTransform } from "d3-zoom";

export interface Point {
  x: number;
  y: number;
}

/**
 * Converts screen coordinates to whiteboard coordinates
 * @param screenPoint - Point in screen coordinates
 * @param transform - D3 zoom transform
 * @returns Point in whiteboard coordinates
 */
export function screenToWhiteboard(
  screenPoint: Point,
  transform: ZoomTransform
): Point {
  return {
    x: (screenPoint.x - transform.x) / transform.k,
    y: (screenPoint.y - transform.y) / transform.k,
  };
}

/**
 * Converts whiteboard coordinates to screen coordinates
 * @param whiteboardPoint - Point in whiteboard coordinates
 * @param transform - D3 zoom transform
 * @returns Point in screen coordinates
 */
export function whiteboardToScreen(
  whiteboardPoint: Point,
  transform: ZoomTransform
): Point {
  return {
    x: whiteboardPoint.x * transform.k + transform.x,
    y: whiteboardPoint.y * transform.k + transform.y,
  };
}

/**
 * Centers a component at the mouse position in whiteboard coordinates
 * @param mousePosition - Mouse position in screen coordinates
 * @param transform - D3 zoom transform
 * @param componentSize - Size of the component {width, height}
 * @returns Centered position in whiteboard coordinates
 */
export function centerComponentAtMouse(
  mousePosition: Point,
  transform: ZoomTransform,
  componentSize: { width: number; height: number }
): Point {
  const whiteboardPosition = screenToWhiteboard(mousePosition, transform);
  return {
    x: whiteboardPosition.x - componentSize.width / 2,
    y: whiteboardPosition.y - componentSize.height / 2,
  };
}
