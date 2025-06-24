import React, { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { GRID_CONSTANTS } from "../constants/appConstants";
import { usePerformance } from "../hooks/usePerformance";

interface GridBackgroundProps {
  transform: d3.ZoomTransform;
  width: number;
  height: number;
  enabled?: boolean;
}

export const GridBackground: React.FC<GridBackgroundProps> = ({
  transform,
  width,
  height,
  enabled = GRID_CONSTANTS.ENABLED,
}) => {
  const gridRef = useRef<SVGGElement>(null);
  const { throttleRAF } = usePerformance({ targetFPS: 120 });

  // Throttled grid update function
  const updateGrid = useCallback(() => {
    if (!gridRef.current) {
      return;
    }

    const gridGroup = d3.select(gridRef.current);

    // Always clear all existing content first
    gridGroup.selectAll("*").remove();

    if (!enabled) {
      return;
    }

    // Dynamic grid parameters based on zoom level
    const baseGridSize = GRID_CONSTANTS.SIZE;

    // Calculate dynamic grid size - use multiple levels
    let gridSize = baseGridSize;

    // Determine which grid level to show based on zoom
    if (transform.k < 0.25) {
      // Very zoomed out - use large grid (4x base size)
      gridSize = baseGridSize * 4;
    } else if (transform.k < 0.5) {
      // Zoomed out - use medium-large grid (2x base size)
      gridSize = baseGridSize * 2;
    } else if (transform.k > 2) {
      // Zoomed in - use fine grid (0.5x base size)
      gridSize = baseGridSize * 0.5;
    } else {
      // Normal zoom - use base grid size
      gridSize = baseGridSize;
    }

    // Opacity based on zoom level for smooth transitions
    let opacity: number = GRID_CONSTANTS.OPACITY;
    if (transform.k < 0.1) {
      opacity = 0; // Hide grid when very zoomed out
    } else if (transform.k < 0.25) {
      opacity = GRID_CONSTANTS.OPACITY * 0.6;
    } else if (transform.k > 4) {
      opacity = GRID_CONSTANTS.OPACITY * 0.7;
    }

    // Stroke width based on zoom - thinner when zoomed out
    let strokeWidth = GRID_CONSTANTS.STROKE_WIDTH;
    if (transform.k < 0.5) {
      strokeWidth = GRID_CONSTANTS.STROKE_WIDTH * 0.8;
    } else if (transform.k > 2) {
      strokeWidth = GRID_CONSTANTS.STROKE_WIDTH * 1.2;
    }

    // Calculate viewport bounds in world coordinates
    const bounds = {
      left: -transform.x / transform.k,
      top: -transform.y / transform.k,
      right: (width - transform.x) / transform.k,
      bottom: (height - transform.y) / transform.k,
    };

    // Extend bounds slightly to ensure smooth scrolling
    const padding = gridSize * 5;
    const startX = Math.floor((bounds.left - padding) / gridSize) * gridSize;
    const endX = Math.ceil((bounds.right + padding) / gridSize) * gridSize;
    const startY = Math.floor((bounds.top - padding) / gridSize) * gridSize;
    const endY = Math.ceil((bounds.bottom + padding) / gridSize) * gridSize;

    // Generate and add vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      gridGroup
        .append("line")
        .attr("x1", x)
        .attr("y1", startY)
        .attr("x2", x)
        .attr("y2", endY)
        .attr("stroke", GRID_CONSTANTS.COLOR)
        .attr("stroke-width", strokeWidth)
        .attr("opacity", opacity)
        .attr("pointer-events", "none");
    }

    // Generate and add horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      gridGroup
        .append("line")
        .attr("x1", startX)
        .attr("y1", y)
        .attr("x2", endX)
        .attr("y2", y)
        .attr("stroke", GRID_CONSTANTS.COLOR)
        .attr("stroke-width", strokeWidth)
        .attr("opacity", opacity)
        .attr("pointer-events", "none");
    }
  }, [transform, width, height, enabled]);

  // Create throttled version of updateGrid
  const throttledUpdateGrid = useRef<(() => void) | null>(null);

  useEffect(() => {
    throttledUpdateGrid.current = throttleRAF(updateGrid);
  }, [updateGrid, throttleRAF]);

  useEffect(() => {
    if (throttledUpdateGrid.current) {
      throttledUpdateGrid.current();
    }
  }, [transform, width, height, enabled]);

  // Cleanup function to avoid React/D3 conflicts
  useEffect(() => {
    const currentRef = gridRef.current;
    return () => {
      if (currentRef) {
        try {
          d3.select(currentRef).selectAll("*").remove();
        } catch (error) {
          // Silently handle cleanup errors
          console.warn("Grid cleanup warning:", error);
        }
      }
    };
  }, []);

  return (
    <g
      ref={gridRef}
      style={{
        pointerEvents: "none",
      }}
    />
  );
};
