import React, { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { GRID_CONSTANTS } from "../constants/appConstants";
import { usePerformance } from "../hooks/usePerformance";

interface GridBackgroundProps {
  transform: d3.ZoomTransform;
  enabled?: boolean;
  style?: "line" | "dotted";
}

export const GridBackground: React.FC<GridBackgroundProps> = ({
  transform,
  enabled = GRID_CONSTANTS.ENABLED,
  style = GRID_CONSTANTS.STYLE,
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

    // Calculate grid size that matches snap-to-grid
    const baseGridSize = GRID_CONSTANTS.SIZE;

    // Use consistent grid size that aligns with snap functionality
    // No dynamic sizing to ensure alignment with snap-to-grid
    const gridSize = baseGridSize;

    // Calculate opacity based on zoom
    let opacity = GRID_CONSTANTS.OPACITY;
    if (transform.k < 0.3) {
      opacity = GRID_CONSTANTS.OPACITY * 0.3;
    } else if (transform.k < 0.6) {
      opacity = GRID_CONSTANTS.OPACITY * 0.6;
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
      const dotSize = GRID_CONSTANTS.DOT_SIZE / transform.k; // Scale dot size inversely with zoom

      pattern
        .append("circle")
        .attr("cx", gridSize / 2) // Center horizontally
        .attr("cy", gridSize / 2) // Center vertically
        .attr("r", dotSize)
        .attr("fill", GRID_CONSTANTS.COLOR)
        .attr("opacity", opacity);
    } else {
      // Create line pattern (L-shaped lines at grid intersections)
      pattern
        .append("path")
        .attr("d", `M ${gridSize} 0 L 0 0 0 ${gridSize}`)
        .attr("fill", "none")
        .attr("stroke", GRID_CONSTANTS.COLOR)
        .attr("stroke-width", GRID_CONSTANTS.STROKE_WIDTH / transform.k)
        .attr("opacity", opacity);
    }

    // Apply pattern to cover entire viewport
    svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "url(#grid-pattern)")
      .attr("pointer-events", "none");
  }, [transform, enabled, style]);

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
