import React, { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { GRID_CONSTANTS, THEME_COLORS } from "../constants/appConstants";
import { CANVAS_CONSTANTS } from "../constants/canvasConstants";
import { usePerformance } from "../hooks/usePerformance";
import {
  getDynamicGridSize,
  getDynamicGridOpacity,
  getDynamicStrokeWidth,
} from "../utils/gridUtils";

interface GridBackgroundProps {
  transform: d3.ZoomTransform;
  enabled?: boolean;
  size?: number;
  color?: string;
  opacity?: number;
  dynamicSizing?: boolean;
  gridType?: "lines" | "dots" | "both";
}

export const GridBackground: React.FC<GridBackgroundProps> = ({
  transform,
  enabled = GRID_CONSTANTS.ENABLED,
  size = CANVAS_CONSTANTS.GRID.SIZE,
  color,
  opacity = GRID_CONSTANTS.OPACITY,
  dynamicSizing = true,
  gridType = GRID_CONSTANTS.DEFAULT_TYPE,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { throttleRAF } = usePerformance({ targetFPS: 120 });
  const { theme } = useTheme();

  // Get theme-aware grid color
  const getGridColor = useCallback(() => {
    if (color) return color; // Use provided color if available

    // Fallback to theme-aware color or default
    if (theme === "dark") {
      return THEME_COLORS.dark.GRID_COLOR;
    } else if (theme === "light") {
      return THEME_COLORS.light.GRID_COLOR;
    }

    // System theme or fallback
    return GRID_CONSTANTS.COLOR;
  }, [color, theme]);

  // Throttled grid update function using SVG patterns
  const updateGrid = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Clear existing content
    svg.selectAll("*").remove();

    if (!enabled) return;

    // Calculate dynamic grid size based on zoom level using utility function
    const baseGridSize = size;
    let gridSize = baseGridSize;

    if (dynamicSizing) {
      gridSize = getDynamicGridSize(transform.k, baseGridSize);
    }

    // Calculate dynamic opacity using utility function
    const dynamicOpacity = getDynamicGridOpacity(transform.k, opacity);

    // Create pattern definition
    const defs = svg.append("defs");
    const pattern = defs
      .append("pattern")
      .attr("id", "grid-pattern")
      .attr("width", gridSize)
      .attr("height", gridSize)
      .attr("patternUnits", "userSpaceOnUse")
      .attr(
        "patternTransform",
        `translate(${transform.x},${transform.y}) scale(${transform.k})`
      );

    // Create line pattern (L-shaped lines at grid intersections)
    const dynamicStrokeWidth = getDynamicStrokeWidth(
      transform.k,
      gridSize,
      baseGridSize
    );

    // Add L-shaped lines (for "lines" and "both" types)
    if (gridType === "lines" || gridType === "both") {
      pattern
        .append("path")
        .attr("d", `M ${gridSize} 0 L 0 0 0 ${gridSize}`)
        .attr("fill", "none")
        .attr("stroke", getGridColor())
        .attr("stroke-width", dynamicStrokeWidth)
        .attr("opacity", dynamicOpacity);
    }

    // Add dots at grid intersections (for "dots" and "both" types)
    if (gridType === "dots" || gridType === "both") {
      const dotRadius = Math.max(
        1,
        (2 / transform.k) * (gridSize / baseGridSize)
      );

      // Add dots at all four corners of the grid cell
      const corners = [
        { x: 0, y: 0 }, // Top-left
        { x: gridSize, y: 0 }, // Top-right
        { x: 0, y: gridSize }, // Bottom-left
        { x: gridSize, y: gridSize }, // Bottom-right
      ];

      corners.forEach((corner) => {
        pattern
          .append("circle")
          .attr("cx", corner.x)
          .attr("cy", corner.y)
          .attr("r", dotRadius)
          .attr("fill", getGridColor())
          .attr("opacity", dynamicOpacity);
      });
    }

    // Apply pattern to cover entire viewport
    svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "url(#grid-pattern)")
      .attr("pointer-events", "none");
  }, [
    transform,
    enabled,
    size,
    opacity,
    dynamicSizing,
    getGridColor,
    gridType,
  ]);

  // Create throttled version of updateGrid
  const throttledUpdateGrid = useRef<(() => void) | null>(null);

  useEffect(() => {
    throttledUpdateGrid.current = throttleRAF(updateGrid);
  }, [updateGrid, throttleRAF]);

  useEffect(() => {
    if (throttledUpdateGrid.current) {
      throttledUpdateGrid.current();
    }
  }, [transform, enabled, gridType]);

  // Cleanup function
  useEffect(() => {
    const currentRef = svgRef.current;
    return () => {
      if (currentRef) {
        try {
          d3.select(currentRef).selectAll("*").remove();
        } catch (error) {
          console.warn("Grid cleanup warning:", error);
        }
      }
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: -1,
        // GPU acceleration
        willChange: "transform",
        transform: "translateZ(0)",
      }}
    />
  );
};
