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

    if (!enabled) {
      // Clear grid if disabled
      gridGroup.selectAll("line").remove();
      return;
    }

    // Clear existing grid lines only (avoid clearing React-managed elements)
    gridGroup.selectAll("line").remove();

    // Grid parameters
    const gridSize = GRID_CONSTANTS.SIZE;
    const strokeWidth = GRID_CONSTANTS.STROKE_WIDTH / transform.k; // Scale stroke width with zoom
    const opacity = Math.min(
      1,
      GRID_CONSTANTS.OPACITY * Math.sqrt(transform.k)
    ); // Adjust opacity with zoom

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
        .attr("opacity", opacity);
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
        .attr("opacity", opacity);
    }
  }, [transform, width, height, enabled]);

  // Cleanup function to avoid React/D3 conflicts
  useEffect(() => {
    const currentRef = gridRef.current;
    return () => {
      if (currentRef) {
        d3.select(currentRef).selectAll("*").remove();
      }
    };
  }, []);

  return (
    <g ref={gridRef} className="grid-background">
      {/* Debug: Always visible test rectangle */}
      <rect x="10" y="10" width="200" height="100" fill="blue" opacity="0.7" />
      <text x="20" y="60" fill="white" fontSize="16" fontWeight="bold">
        GRID DEBUG
      </text>
    </g>
  );
};
