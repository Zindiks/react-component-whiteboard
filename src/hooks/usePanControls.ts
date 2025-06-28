/**
 * Pan Controls Hook
 *
 * This hook provides pan and marquee selection functionality for the whiteboard.
 * It manages mouse interactions for panning the view and selecting multiple components
 * via marquee (click and drag) selection.
 */

import { useCallback, useState, useEffect } from "react";
import { ZoomTransform } from "d3-zoom";
import { Component } from "../types/whiteboard";
import { COMPONENT_SIZES, MARQUEE_CONSTANTS } from "../constants/appConstants";

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
  transform: ZoomTransform;
  applyTransform: (newTransform: ZoomTransform) => void;
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

  // Track if we're currently in a drag operation (from sidebar or elsewhere)
  const [isDragInProgress, setIsDragInProgress] = useState(false);

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

    // Only select if marquee has meaningful size (avoid accidental selections)
    const marqueeWidth = right - left;
    const marqueeHeight = bottom - top;
    if (
      marqueeWidth < MARQUEE_CONSTANTS.MIN_SELECTION_SIZE ||
      marqueeHeight < MARQUEE_CONSTANTS.MIN_SELECTION_SIZE
    ) {
      return [];
    }

    return components.filter((comp) => {
      // Convert component coordinates to screen coordinates
      const screenX = comp.x * transform.k + transform.x;
      const screenY = comp.y * transform.k + transform.y;
      const compWidth =
        (comp.width || COMPONENT_SIZES.DEFAULT_WIDTH) * transform.k;
      const compHeight =
        (comp.height || COMPONENT_SIZES.DEFAULT_HEIGHT) * transform.k;

      // Check if component overlaps with marquee selection
      const componentLeft = screenX;
      const componentRight = screenX + compWidth;
      const componentTop = screenY;
      const componentBottom = screenY + compHeight;

      // More precise intersection check
      const hasIntersection = !(
        componentRight <= left ||
        componentLeft >= right ||
        componentBottom <= top ||
        componentTop >= bottom
      );

      return hasIntersection;
    });
  }, [marqueeStart, marqueeEnd, components, transform]);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      // Don't start marquee selection if we're in the middle of a drag operation
      if (isDragInProgress) {
        return;
      }

      const coords = getEventCoordinates(event);

      // Check if we clicked on a component (prevent marquee when clicking components)
      const target = event.target as HTMLElement;
      const isComponentClick = target.closest("[data-component]") !== null;

      // Check if we clicked on the sidebar or control panel (prevent marquee when clicking UI)
      const isSidebarClick = target.closest("[data-sidebar]") !== null;
      const isControlPanelClick =
        target.closest("[data-control-panel]") !== null;
      const isDraggableElement = target.closest("[draggable='true']") !== null;
      const isUIClick =
        isSidebarClick || isControlPanelClick || isDraggableElement;

      if (
        event.button === 0 &&
        !isSpacePressed &&
        !isComponentClick &&
        !isUIClick
      ) {
        // Left click without space on empty area - start marquee selection
        event.preventDefault(); // Prevent any default text selection
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
    [isDragInProgress, isSpacePressed, getEventCoordinates]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const coords = getEventCoordinates(event);

      if (isMarqueeActive) {
        event.preventDefault(); // Prevent text selection during marquee
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
      // Don't complete marquee selection if we're in the middle of a drag operation
      if (isDragInProgress && isMarqueeActive) {
        setIsMarqueeActive(false);
        return;
      }

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
    [
      isDragInProgress,
      isMarqueeActive,
      isPanning,
      getComponentsInMarquee,
      setSelectedComponents,
    ]
  );

  const handleContextMenu = useCallback((event: MouseEvent) => {
    if (event.button === 2) {
      event.preventDefault();
    }
  }, []);

  // Set up drag event listeners to track drag operations
  useEffect(() => {
    let dragEndTimeout: NodeJS.Timeout | null = null;

    const clearDragState = () => {
      setIsDragInProgress(false);
    };

    const handleDragStart = () => {
      setIsDragInProgress(true);
      // Clear any pending timeout
      if (dragEndTimeout) {
        clearTimeout(dragEndTimeout);
        dragEndTimeout = null;
      }
    };

    const handleDragEnd = () => {
      // Delay clearing drag state to ensure mouse events after drop are handled
      dragEndTimeout = setTimeout(clearDragState, 100);
    };

    const handleDrop = () => {
      // Delay clearing drag state to ensure mouse events after drop are handled
      dragEndTimeout = setTimeout(clearDragState, 100);
    };

    // Listen for drag events globally
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("dragend", handleDragEnd);
      document.removeEventListener("drop", handleDrop);
      // Clear timeout on cleanup
      if (dragEndTimeout) {
        clearTimeout(dragEndTimeout);
      }
    };
  }, []);

  // Prevent text selection during marquee operations
  useEffect(() => {
    if (isMarqueeActive) {
      // Add CSS to prevent text selection
      const style = document.createElement("style");
      style.id = "marquee-no-select";
      style.textContent = `
        * {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }
      `;
      document.head.appendChild(style);

      // Also add to body class for additional CSS targeting
      document.body.classList.add("marquee-selecting");

      return () => {
        // Clean up when marquee ends
        const existingStyle = document.getElementById("marquee-no-select");
        if (existingStyle) {
          existingStyle.remove();
        }
        document.body.classList.remove("marquee-selecting");
      };
    }
  }, [isMarqueeActive]);

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
