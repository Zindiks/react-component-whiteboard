import React, { useMemo } from "react";
import { GRID_CONSTANTS } from "../constants/appConstants";
import * as d3 from "d3";

interface CSSGridBackgroundProps {
  transform: d3.ZoomTransform;
  enabled?: boolean;
}

/**
 * Ultra-high performance CSS-based grid background
 * Uses CSS patterns for native browser optimization
 */
export const CSSGridBackground: React.FC<CSSGridBackgroundProps> = ({
  transform,
  enabled = GRID_CONSTANTS.ENABLED,
}) => {
  // Calculate dynamic grid parameters
  const gridParams = useMemo(() => {
    if (!enabled) return null;

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

    // Calculate stroke width
    let strokeWidth = GRID_CONSTANTS.STROKE_WIDTH;
    if (transform.k < 0.5) {
      strokeWidth = GRID_CONSTANTS.STROKE_WIDTH * 0.8;
    } else if (transform.k > 2) {
      strokeWidth = GRID_CONSTANTS.STROKE_WIDTH * 1.2;
    }

    // Scale with transform
    const scaledGridSize = gridSize * transform.k;
    const scaledStrokeWidth = strokeWidth * transform.k;

    return {
      gridSize: scaledGridSize,
      strokeWidth: scaledStrokeWidth,
      opacity,
      offsetX: transform.x % scaledGridSize,
      offsetY: transform.y % scaledGridSize,
    };
  }, [transform, enabled]);

  if (!enabled || !gridParams || gridParams.opacity === 0) {
    return null;
  }

  const { gridSize, strokeWidth, opacity, offsetX, offsetY } = gridParams;

  // Create the grid pattern using CSS
  const backgroundImage = `
    linear-gradient(to right, ${GRID_CONSTANTS.COLOR} ${strokeWidth}px, transparent ${strokeWidth}px),
    linear-gradient(to bottom, ${GRID_CONSTANTS.COLOR} ${strokeWidth}px, transparent ${strokeWidth}px)
  `;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundImage,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
        opacity,
        pointerEvents: "none",
        zIndex: -1,
        // GPU acceleration
        willChange: "transform, opacity",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    />
  );
};
