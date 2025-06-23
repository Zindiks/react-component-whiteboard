/**
 * Pan Controls Hook
 *
 * This hook provides pan and marquee selection functionality for the whiteboard.
 * It manages mouse interactions for panning the view and selecting multiple components
 * via marquee (click and drag) selection.
 */

import { useCallback, useState } from "react";
import * as d3 from "d3";
import { Component } from "../types/whiteboard";

export interface PanControlsState {
  isPanning: boolean;
  isSpacePressed: boolean;
  lastPanPoint: { x: number; y: number };
  isMarqueeActive: boolean;
  marqueeStart: { x: number; y: number };
  marqueeEnd: { x: number; y: number };
}

export interface PanControlsActions {
  setIsPanning: (isPanning: boolean) => void;
  setIsSpacePressed: (isPressed: boolean) => void;
  setLastPanPoint: (point: { x: number; y: number }) => void;
  setIsMarqueeActive: (isActive: boolean) => void;
  setMarqueeStart: (point: { x: number; y: number }) => void;
  setMarqueeEnd: (point: { x: number; y: number }) => void;
  getComponentsInMarquee: () => Component[];
  getEventCoordinates: (event: MouseEvent | React.MouseEvent) => {
    x: number;
    y: number;
  };
}

export interface UsePanControlsProps {
  components: Component[];
  transform: d3.ZoomTransform;
  applyTransform: (newTransform: d3.ZoomTransform) => void;
  setSelectedComponents: React.Dispatch<React.SetStateAction<number[]>>;
  setMousePosition: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >;
}

export interface UsePanControlsReturn
  extends PanControlsState,
    PanControlsActions {
  handleMouseDown: (event: MouseEvent) => void;
  handleMouseMove: (event: MouseEvent) => void;
  handleMouseUp: (event: MouseEvent) => void;
  handleContextMenu: (event: MouseEvent) => void;
}

export const usePanControls = ({
  components,
  transform,
  applyTransform,
  setSelectedComponents,
  setMousePosition,
}: UsePanControlsProps): UsePanControlsReturn => {
  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Marquee selection state
  const [isMarqueeActive, setIsMarqueeActive] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState({ x: 0, y: 0 });
  const [marqueeEnd, setMarqueeEnd] = useState({ x: 0, y: 0 });

  const getEventCoordinates = useCallback(
    (event: MouseEvent | React.MouseEvent) => ({
      x: event.clientX,
      y: event.clientY,
    }),
    []
  );

  const getComponentsInMarquee = useCallback(() => {
    const left = Math.min(marqueeStart.x, marqueeEnd.x);
    const right = Math.max(marqueeStart.x, marqueeEnd.x);
    const top = Math.min(marqueeStart.y, marqueeEnd.y);
    const bottom = Math.max(marqueeStart.y, marqueeEnd.y);

    return components.filter((comp) => {
      // Convert component coordinates to screen coordinates
      const screenX = comp.x * transform.k + transform.x;
      const screenY = comp.y * transform.k + transform.y;
      const compWidth = (comp.width || 200) * transform.k;
      const compHeight = (comp.height || 200) * transform.k;

      return (
        screenX < right &&
        screenX + compWidth > left &&
        screenY < bottom &&
        screenY + compHeight > top
      );
    });
  }, [marqueeStart, marqueeEnd, components, transform]);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      const coords = getEventCoordinates(event);

      // Check if we clicked on a component (prevent marquee when clicking components)
      const target = event.target as HTMLElement;
      const isComponentClick = target.closest("[data-component]") !== null;

      // Check if we clicked on the sidebar or control panel (prevent marquee when clicking UI)
      const isSidebarClick = target.closest("[data-sidebar]") !== null;
      const isControlPanelClick =
        target.closest("[data-control-panel]") !== null;
      const isUIClick = isSidebarClick || isControlPanelClick;

      if (
        event.button === 0 &&
        !isSpacePressed &&
        !isComponentClick &&
        !isUIClick
      ) {
        // Left click without space on empty area - start marquee selection
        setIsMarqueeActive(true);
        setMarqueeStart(coords);
        setMarqueeEnd(coords);
      } else if (
        event.button === 1 ||
        event.button === 2 ||
        (event.button === 0 && isSpacePressed)
      ) {
        // Middle, right, or space+left click - start panning (but not on UI elements)
        if (!isUIClick) {
          setIsPanning(true);
          setLastPanPoint(coords);
          event.preventDefault();
        }
      }
    },
    [isSpacePressed, getEventCoordinates]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const coords = getEventCoordinates(event);

      if (isMarqueeActive) {
        setMarqueeEnd(coords);
      } else if (isPanning) {
        const deltaX = coords.x - lastPanPoint.x;
        const deltaY = coords.y - lastPanPoint.y;

        const newTransform = transform.translate(
          deltaX / transform.k,
          deltaY / transform.k
        );
        applyTransform(newTransform);
        setLastPanPoint(coords);
      }

      // Update mouse position for paste operations
      setMousePosition(coords);
    },
    [
      isMarqueeActive,
      isPanning,
      lastPanPoint,
      transform,
      applyTransform,
      setMousePosition,
      getEventCoordinates,
    ]
  );

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      if (isMarqueeActive) {
        // Complete marquee selection
        const selectedInMarquee = getComponentsInMarquee();
        if (event.ctrlKey || event.metaKey) {
          // Add to existing selection
          setSelectedComponents((prev) => [
            ...new Set([...prev, ...selectedInMarquee.map((comp) => comp.id)]),
          ]);
        } else {
          // Replace selection
          setSelectedComponents(selectedInMarquee.map((comp) => comp.id));
        }
        setIsMarqueeActive(false);
      } else if (isPanning) {
        setIsPanning(false);
      }
    },
    [isMarqueeActive, isPanning, getComponentsInMarquee, setSelectedComponents]
  );

  const handleContextMenu = useCallback((event: MouseEvent) => {
    if (event.button === 2) {
      event.preventDefault();
    }
  }, []);

  return {
    // State
    isPanning,
    isSpacePressed,
    lastPanPoint,
    isMarqueeActive,
    marqueeStart,
    marqueeEnd,

    // Actions
    setIsPanning,
    setIsSpacePressed,
    setLastPanPoint,
    setIsMarqueeActive,
    setMarqueeStart,
    setMarqueeEnd,
    getComponentsInMarquee,
    getEventCoordinates,

    // Event handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleContextMenu,
  };
};
