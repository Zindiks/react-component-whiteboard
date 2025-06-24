import React, { useEffect, useRef, useCallback } from "react";
import { GRID_CONSTANTS } from "../constants/appConstants";
import { usePerformance } from "../hooks/usePerformance";
import * as d3 from "d3";

interface CanvasGridBackgroundProps {
  transform: d3.ZoomTransform;
  width: number;
  height: number;
  enabled?: boolean;
}

/**
 * High-performance canvas-based grid background
 * Uses Canvas API for better performance with many lines
 */
export const CanvasGridBackground: React.FC<CanvasGridBackgroundProps> = ({
  transform,
  width,
  height,
  enabled = GRID_CONSTANTS.ENABLED,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { throttleRAF } = usePerformance({ targetFPS: 120 });

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match container
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!enabled) return;

    // Calculate grid parameters
    const baseGridSize = GRID_CONSTANTS.SIZE;
    let gridSize = baseGridSize;

    // Dynamic grid size based on zoom
    if (transform.k < 0.25) {
      gridSize = baseGridSize * 4;
    } else if (transform.k < 0.5) {
      gridSize = baseGridSize * 2;
    } else if (transform.k > 2) {
      gridSize = baseGridSize * 0.5;
    }

    // Calculate opacity
    let opacity: number = GRID_CONSTANTS.OPACITY;
    if (transform.k < 0.1) {
      opacity = 0;
    } else if (transform.k < 0.25) {
      opacity = GRID_CONSTANTS.OPACITY * 0.6;
    } else if (transform.k > 4) {
      opacity = GRID_CONSTANTS.OPACITY * 0.7;
    }

    if (opacity === 0) return;

    // Calculate stroke width
    let strokeWidth = GRID_CONSTANTS.STROKE_WIDTH;
    if (transform.k < 0.5) {
      strokeWidth = GRID_CONSTANTS.STROKE_WIDTH * 0.8;
    } else if (transform.k > 2) {
      strokeWidth = GRID_CONSTANTS.STROKE_WIDTH * 1.2;
    }

    // Set up canvas style
    ctx.strokeStyle = GRID_CONSTANTS.COLOR;
    ctx.lineWidth = strokeWidth;
    ctx.globalAlpha = opacity;

    // Calculate visible grid area in world coordinates
    const gridMargin = gridSize * 10;
    const worldLeft = (-transform.x - gridMargin) / transform.k;
    const worldTop = (-transform.y - gridMargin) / transform.k;
    const worldRight = (width - transform.x + gridMargin) / transform.k;
    const worldBottom = (height - transform.y + gridMargin) / transform.k;

    // Snap to grid
    const startX = Math.floor(worldLeft / gridSize) * gridSize;
    const endX = Math.ceil(worldRight / gridSize) * gridSize;
    const startY = Math.floor(worldTop / gridSize) * gridSize;
    const endY = Math.ceil(worldBottom / gridSize) * gridSize;

    // Begin path for all lines/dots
    ctx.beginPath();

    // Draw lines
    // Draw vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      const screenX = x * transform.k + transform.x;
      ctx.moveTo(screenX, startY * transform.k + transform.y);
      ctx.lineTo(screenX, endY * transform.k + transform.y);
    }

    // Draw horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      const screenY = y * transform.k + transform.y;
      ctx.moveTo(startX * transform.k + transform.x, screenY);
      ctx.lineTo(endX * transform.k + transform.x, screenY);
    }

    // Stroke all lines at once
    ctx.stroke();
  }, [transform, width, height, enabled]);

  // Create throttled version
  const throttledDrawGrid = useRef<(() => void) | null>(null);

  useEffect(() => {
    throttledDrawGrid.current = throttleRAF(drawGrid);
  }, [drawGrid, throttleRAF]);

  useEffect(() => {
    if (throttledDrawGrid.current) {
      throttledDrawGrid.current();
    }
  }, [transform, width, height, enabled]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: -1,
      }}
      width={width}
      height={height}
    />
  );
};
