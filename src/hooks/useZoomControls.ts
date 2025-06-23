/**
 * Zoom Controls Hook
 *
 * This hook provides zoom and pan controls functionality for the whiteboard.
 * It manages zoom behavior, transform state, and provides utility functions
 * for zoom operations like reset, zoom to fit, and zoom to selection.
 */

import { useCallback, useRef, useState } from "react";
import * as d3 from "d3";
import { Component } from "../types/whiteboard";

const ZOOM_INDICATOR_TIMEOUT_MS = 200; // Duration to show zoom indicator

export interface ZoomControlsState {
  transform: d3.ZoomTransform;
  showZoomIndicator: boolean;
  isActivelyZooming: boolean;
}

export interface ZoomControlsActions {
  setTransform: (transform: d3.ZoomTransform) => void;
  showZoomIndicatorTemporarily: () => void;
  applyTransform: (newTransform: d3.ZoomTransform) => void;
  resetZoom: () => void;
  zoomToFit: () => void;
  zoomToSelection: () => void;
  handleZoom: (factor: number) => void;
}

export interface ZoomControlsRefs {
  zoomBehavior: React.MutableRefObject<d3.ZoomBehavior<
    SVGSVGElement,
    unknown
  > | null>;
  zoomIndicatorTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  previousZoomScale: React.MutableRefObject<number>;
}

export interface UseZoomControlsProps {
  svgRef: React.RefObject<SVGSVGElement>;
  components: Component[];
  selectedComponents: number[];
}

export interface UseZoomControlsReturn
  extends ZoomControlsState,
    ZoomControlsActions {
  refs: ZoomControlsRefs;
}

export const useZoomControls = ({
  svgRef,
  components,
  selectedComponents,
}: UseZoomControlsProps): UseZoomControlsReturn => {
  // Transform state
  const [transform, setTransform] = useState(d3.zoomIdentity);

  // Zoom indicator state
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const [isActivelyZooming, setIsActivelyZooming] = useState(false);

  // Refs
  const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(
    null
  );
  const zoomIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousZoomScale = useRef<number>(1);

  const showZoomIndicatorTemporarily = useCallback(() => {
    // Only show for actual zoom gestures, not manual buttons
    setIsActivelyZooming(true);
    setShowZoomIndicator(true);

    // Clear existing timeout
    if (zoomIndicatorTimeoutRef.current) {
      clearTimeout(zoomIndicatorTimeoutRef.current);
    }

    // Set new timeout to hide indicator after 800ms (shorter for better UX)
    zoomIndicatorTimeoutRef.current = setTimeout(() => {
      setIsActivelyZooming(false);
      setShowZoomIndicator(false);
    }, ZOOM_INDICATOR_TIMEOUT_MS);
  }, []);

  const applyTransform = useCallback(
    (newTransform: d3.ZoomTransform) => {
      if (!svgRef.current || !zoomBehavior.current) return;
      const svg = d3.select(svgRef.current);
      svg.call(zoomBehavior.current.transform, newTransform);
    },
    [svgRef]
  );

  const resetZoom = useCallback(() => {
    if (!svgRef.current || !zoomBehavior.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(750)
      .call(zoomBehavior.current.transform, d3.zoomIdentity);
  }, [svgRef]);

  const zoomToFit = useCallback(() => {
    if (!svgRef.current || !zoomBehavior.current || components.length === 0)
      return;

    const padding = 50;
    const bounds = components.reduce(
      (acc, comp) => ({
        minX: Math.min(acc.minX, comp.x),
        minY: Math.min(acc.minY, comp.y),
        maxX: Math.max(acc.maxX, comp.x + (comp.width || 200)),
        maxY: Math.max(acc.maxY, comp.y + (comp.height || 200)),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    const width = bounds.maxX - bounds.minX + padding * 2;
    const height = bounds.maxY - bounds.minY + padding * 2;
    const centerX = bounds.minX + (bounds.maxX - bounds.minX) / 2;
    const centerY = bounds.minY + (bounds.maxY - bounds.minY) / 2;

    const scale = Math.min(
      window.innerWidth / width,
      window.innerHeight / height,
      7 // Max zoom level (700%)
    );

    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(750)
      .call(
        zoomBehavior.current.transform,
        d3.zoomIdentity
          .translate(window.innerWidth / 2, window.innerHeight / 2)
          .scale(scale)
          .translate(-centerX, -centerY)
      );
  }, [svgRef, components]);

  const zoomToSelection = useCallback(() => {
    if (
      !svgRef.current ||
      !zoomBehavior.current ||
      selectedComponents.length === 0
    )
      return;

    const selectedComps = components.filter((comp) =>
      selectedComponents.includes(comp.id)
    );
    const padding = 50;
    const bounds = selectedComps.reduce(
      (acc, comp) => ({
        minX: Math.min(acc.minX, comp.x),
        minY: Math.min(acc.minY, comp.y),
        maxX: Math.max(acc.maxX, comp.x + (comp.width || 200)),
        maxY: Math.max(acc.maxY, comp.y + (comp.height || 200)),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    const width = bounds.maxX - bounds.minX + padding * 2;
    const height = bounds.maxY - bounds.minY + padding * 2;
    const centerX = bounds.minX + (bounds.maxX - bounds.minX) / 2;
    const centerY = bounds.minY + (bounds.maxY - bounds.minY) / 2;

    const scale = Math.min(
      window.innerWidth / width,
      window.innerHeight / height,
      7 // Max zoom level (700%)
    );

    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(750)
      .call(
        zoomBehavior.current.transform,
        d3.zoomIdentity
          .translate(window.innerWidth / 2, window.innerHeight / 2)
          .scale(scale)
          .translate(-centerX, -centerY)
      );
  }, [svgRef, components, selectedComponents]);

  const handleZoom = useCallback(
    (factor: number) => {
      if (!svgRef.current || !zoomBehavior.current) return;
      const svg = d3.select(svgRef.current);
      zoomBehavior.current.scaleBy(svg, factor);
      // Don't show indicator for manual button clicks
    },
    [svgRef]
  );

  return {
    // State
    transform,
    showZoomIndicator,
    isActivelyZooming,

    // Actions
    setTransform,
    showZoomIndicatorTemporarily,
    applyTransform,
    resetZoom,
    zoomToFit,
    zoomToSelection,
    handleZoom,

    // Refs
    refs: {
      zoomBehavior,
      zoomIndicatorTimeoutRef,
      previousZoomScale,
    },
  };
};
