import React, { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { GRID_CONSTANTS } from "../constants/appConstants";
import { usePerformance } from "../hooks/usePerformance";

interface GridBackgroundProps {
  transform: d3.ZoomTransform;
  enabled?: boolean;
  style?: "line" | "dotted";
  size?: number;
  color?: string;
  opacity?: number;
  dynamicSizing?: boolean;
}

export const GridBackground: React.FC<GridBackgroundProps> = ({
  transform,
  enabled = GRID_CONSTANTS.ENABLED,
  style = GRID_CONSTANTS.STYLE,
  size = GRID_CONSTANTS.SIZE,
  color = GRID_CONSTANTS.COLOR,
  opacity = GRID_CONSTANTS.OPACITY,
  dynamicSizing = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { throttleRAF } = usePerformance({ targetFPS: 120 });

  // Throttled grid update function using SVG patterns
  const updateGrid = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Clear existing content
    svg.selectAll("*").remove();

    if (!enabled) return;

    // Calculate dynamic grid size based on zoom level
    const baseGridSize = size;
    let gridSize = baseGridSize;

    if (dynamicSizing) {
      // Adjust grid size based on zoom level for better visibility
      if (transform.k < 0.25) {
        gridSize = baseGridSize * 4; // Larger grid when zoomed out
      } else if (transform.k < 0.5) {
        gridSize = baseGridSize * 2; // Medium grid
      } else if (transform.k > 3) {
        gridSize = baseGridSize / 2; // Smaller grid when zoomed in
      }
    }

    // Calculate dynamic opacity with smooth transitions
    let dynamicOpacity = opacity;
    if (transform.k < 0.2) {
      dynamicOpacity = opacity * 0.2;
    } else if (transform.k < 0.4) {
      dynamicOpacity = opacity * 0.4;
    } else if (transform.k < 0.7) {
      dynamicOpacity = opacity * 0.7;
    } else if (transform.k > 2) {
      dynamicOpacity = Math.min(opacity * 1.2, 1); // Slightly more visible when zoomed in
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

    if (style === "dotted") {
      // Create dotted pattern using a circle at the center of each grid cell
      // Keep dots at consistent screen size while spacing (grid pattern) changes with zoom
      // This gives the effect of dots staying the same visual size but varying density
      const screenDotSize = GRID_CONSTANTS.DOT_SIZE; // Target size on screen in pixels
      const patternDotSize = screenDotSize / transform.k; // Adjust for zoom to maintain screen size

      pattern
        .append("circle")
        .attr("cx", gridSize / 2) // Center horizontally
        .attr("cy", gridSize / 2) // Center vertically
        .attr("r", patternDotSize)
        .attr("fill", color)
        .attr("opacity", dynamicOpacity);
    } else {
      // Create line pattern (L-shaped lines at grid intersections)
      const dynamicStrokeWidth =
        (GRID_CONSTANTS.STROKE_WIDTH / transform.k) * (gridSize / baseGridSize);

      pattern
        .append("path")
        .attr("d", `M ${gridSize} 0 L 0 0 0 ${gridSize}`)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", dynamicStrokeWidth)
        .attr("opacity", dynamicOpacity);
    }

    // Apply pattern to cover entire viewport
    svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "url(#grid-pattern)")
      .attr("pointer-events", "none");
  }, [transform, enabled, style, size, color, opacity, dynamicSizing]);

  // Create throttled version of updateGrid
  const throttledUpdateGrid = useRef<(() => void) | null>(null);

  useEffect(() => {
    throttledUpdateGrid.current = throttleRAF(updateGrid);
  }, [updateGrid, throttleRAF]);

  useEffect(() => {
    if (throttledUpdateGrid.current) {
      throttledUpdateGrid.current();
    }
  }, [transform, enabled, style]);

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
