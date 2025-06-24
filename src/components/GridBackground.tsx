import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { GRID_CONSTANTS } from "../constants/appConstants";

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

  useEffect(() => {
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
    let gridLevel = 1;

    // Determine which grid level to show based on zoom
    if (transform.k < 0.25) {
      // Very zoomed out - use large grid (4x base size)
      gridSize = baseGridSize * 4;
      gridLevel = 4;
    } else if (transform.k < 0.5) {
      // Zoomed out - use medium-large grid (2x base size)
      gridSize = baseGridSize * 2;
      gridLevel = 2;
    } else if (transform.k > 2) {
      // Zoomed in - use smaller grid (half base size)
      gridSize = baseGridSize * 0.5;
      gridLevel = 0.5;
    } else if (transform.k > 4) {
      // Very zoomed in - use very small grid (quarter base size)
      gridSize = baseGridSize * 0.25;
      gridLevel = 0.25;
    }

    // Dynamic stroke width - thinner at high zoom, thicker at low zoom
    const strokeWidth = Math.max(
      0.2,
      Math.min(3, GRID_CONSTANTS.STROKE_WIDTH / transform.k)
    );

    // Dynamic opacity - more visible when grid is larger, less when smaller
    let opacity: number = GRID_CONSTANTS.OPACITY;
    if (gridLevel >= 2) {
      opacity = Math.min(1, GRID_CONSTANTS.OPACITY * 1.5); // More visible for large grids
    } else if (gridLevel <= 0.5) {
      opacity = Math.max(0.2, GRID_CONSTANTS.OPACITY * 0.7); // Less visible for small grids
    }

    // Calculate visible bounds in world coordinates
    const bounds = {
      left: (-transform.x - width) / transform.k,
      top: (-transform.y - height) / transform.k,
      right: (-transform.x + width * 2) / transform.k,
      bottom: (-transform.y + height * 2) / transform.k,
    };

    // Snap to grid
    const startX = Math.floor(bounds.left / gridSize) * gridSize;
    const startY = Math.floor(bounds.top / gridSize) * gridSize;
    const endX = Math.ceil(bounds.right / gridSize) * gridSize;
    const endY = Math.ceil(bounds.bottom / gridSize) * gridSize;

    // Apply transform to the grid group
    gridGroup.attr(
      "transform",
      `translate(${transform.x}, ${transform.y}) scale(${transform.k})`
    );

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

  // Return empty group - D3 will manage all content
  return <g ref={gridRef} className="grid-background" />;
};
