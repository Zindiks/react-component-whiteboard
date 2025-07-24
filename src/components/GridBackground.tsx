import React, { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { GRID_CONSTANTS, THEME_COLORS } from "../constants/appConstants";
import { CANVAS_CONSTANTS } from "../constants/canvasConstants";
import { usePerformance } from "../hooks/usePerformance";

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

    // Calculate dynamic grid size based on zoom level (ensure divisible by 8)
    const baseGridSize = size;
    let gridSize = baseGridSize;

    if (dynamicSizing) {
      // Use the same logic as gridUtils.ts to ensure consistency
      if (transform.k < 0.25) {
        gridSize = baseGridSize * 4; // 96px (when base is 24px)
      } else if (transform.k < 0.5) {
        gridSize = baseGridSize * 2; // 48px (when base is 24px)
      } else if (transform.k > 2) {
        gridSize = 16; // 16px (divisible by 8)
      } else if (transform.k > 4) {
        gridSize = 8; // 8px (divisible by 8)
      } else {
        gridSize = baseGridSize; // 24px (base size)
      }

      // Ensure the result is divisible by 8
      gridSize = Math.round(gridSize / 8) * 8;
    }

    // Calculate dynamic opacity with smooth transitions
    let dynamicOpacity = opacity;
    if (transform.k < 0.2) {
      dynamicOpacity = Math.max(opacity * 0.3, 0.2); // Reduced minimum visibility
    } else if (transform.k < 0.4) {
      dynamicOpacity = Math.max(opacity * 0.5, 0.3); // Reduced minimum visibility
    } else if (transform.k < 0.7) {
      dynamicOpacity = Math.max(opacity * 0.7, 0.45); // Reduced minimum visibility
    } else if (transform.k > 2) {
      dynamicOpacity = Math.min(opacity * 1.1, 0.85); // Slightly less visible when zoomed in
    }

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
    const dynamicStrokeWidth =
      (GRID_CONSTANTS.STROKE_WIDTH / transform.k) * (gridSize / baseGridSize);

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
