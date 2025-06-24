/**
 * Event Handlers Hook
 *
 * This hook manages all global event handling for the whiteboard including:
 * - D3 zoom behavior setup
 * - Global wheel/touch handlers for zoom and pan gestures
 * - Two-finger trackpad panning (hover without click)
 * - Keyboard shortcuts and event handling (with input field detection)
 * - Event listener setup and cleanup
 *
 * IMPORTANT: Keyboard shortcuts are disabled when user is typing in input fields
 * to prevent interference with normal text input. Only Escape key works in inputs.
 *
 * Trackpad Gestures:
 * - Two-finger scroll: Pan the whiteboard
 * - Ctrl/Cmd + two-finger scroll: Zoom in/out
 * - Two-finger pinch: Zoom (touch devices)
 */

import { useEffect } from "react";
import * as d3 from "d3";
import { ZOOM_CONSTANTS, INTERACTION } from "../constants/appConstants";

export interface UseEventHandlersProps {
  svgRef: React.RefObject<SVGSVGElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  zoomBehavior: React.MutableRefObject<d3.ZoomBehavior<
    SVGSVGElement,
    unknown
  > | null>;
  transform: d3.ZoomTransform;
  isMarqueeActive: boolean;
  isSpacePressed: boolean;
  setIsSpacePressed: (pressed: boolean) => void;
  showOverview: boolean;
  setShowOverview: (show: boolean) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  resetZoom: () => void;
  zoomToFit: () => void;
  zoomToSelection: () => void;
  setSelectedComponents: (
    components: number[] | ((prev: number[]) => number[])
  ) => void;
  handleDeleteSelected: () => void;
  handleCopyComponents: () => void;
  handlePasteComponents: () => Promise<void>;
  handlePasteImageFromClipboard: () => Promise<void>;
  panHandleMouseDown: (event: MouseEvent) => void;
  panHandleMouseMove: (event: MouseEvent) => void;
  panHandleMouseUp: (event: MouseEvent) => void;
  panHandleContextMenu: (event: MouseEvent) => void;
  previousZoomScale: React.MutableRefObject<number>;
  setTransform: (transform: d3.ZoomTransform) => void;
  showZoomIndicatorTemporarily: () => void;
}

export const useEventHandlers = ({
  svgRef,
  containerRef,
  zoomBehavior,
  transform,
  isMarqueeActive,
  isSpacePressed,
  setIsSpacePressed,
  showOverview,
  setShowOverview,
  showGrid,
  setShowGrid,
  snapToGrid,
  setSnapToGrid,
  resetZoom,
  zoomToFit,
  zoomToSelection,
  setSelectedComponents,
  handleDeleteSelected,
  handleCopyComponents,
  handlePasteComponents,
  handlePasteImageFromClipboard,
  panHandleMouseDown,
  panHandleMouseMove,
  panHandleMouseUp,
  panHandleContextMenu,
  previousZoomScale,
  setTransform,
  showZoomIndicatorTemporarily,
}: UseEventHandlersProps) => {
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.attr("width", window.innerWidth).attr("height", window.innerHeight);

    // Enhanced zoom behavior with better filtering for Mac trackpad
    zoomBehavior.current = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([ZOOM_CONSTANTS.MIN_ZOOM, ZOOM_CONSTANTS.MAX_ZOOM]) // Min 10%, Max 700%
      .filter((event) => {
        // Prevent zoom during marquee selection or component dragging
        if (isMarqueeActive) return false;

        // Disable wheel events for D3 zoom - we handle these globally now
        if (event.type === "wheel") {
          return false;
        }

        // Allow middle mouse button for pan
        if (
          event.type === "mousedown" &&
          event.button === INTERACTION.MIDDLE_MOUSE_BUTTON
        ) {
          return true;
        }

        // Allow right mouse button for pan
        if (
          event.type === "mousedown" &&
          event.button === INTERACTION.RIGHT_MOUSE_BUTTON
        ) {
          return true;
        }

        // Allow pan with space + left click
        if (
          event.type === "mousedown" &&
          event.button === INTERACTION.LEFT_MOUSE_BUTTON &&
          isSpacePressed
        ) {
          return true;
        }

        return false;
      })
      .on("zoom", (event) => {
        if (!isMarqueeActive) {
          const currentScale = event.transform.k;
          const scaleChanged =
            Math.abs(currentScale - previousZoomScale.current) > 0.001;

          setTransform(event.transform);

          // Only show indicator if scale changed (actual zoom), not just pan
          if (scaleChanged) {
            showZoomIndicatorTemporarily();
            previousZoomScale.current = currentScale;
          }
        }
      });

    svg.call(zoomBehavior.current);

    // Global zoom event handlers to capture zoom gestures everywhere within the whiteboard
    const handleGlobalWheel = (event: WheelEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const isInsideContainer =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!isInsideContainer) return; // Don't handle events outside our container

      // Handle zoom gestures (Ctrl/Cmd + wheel or pinch)
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        event.stopPropagation();

        // Calculate zoom center point relative to the container
        const centerX = event.clientX - rect.left;
        const centerY = event.clientY - rect.top;

        // Determine zoom direction and factor
        const zoomIntensity = ZOOM_CONSTANTS.ZOOM_INTENSITY; // Zoom sensitivity
        const delta = -event.deltaY * zoomIntensity;
        const scaleFactor = Math.exp(delta);

        // Calculate new scale with limits
        const currentScale = transform.k;
        const newScale = Math.max(
          ZOOM_CONSTANTS.MIN_ZOOM,
          Math.min(ZOOM_CONSTANTS.MAX_ZOOM, currentScale * scaleFactor)
        );

        if (
          newScale !== currentScale &&
          svgRef.current &&
          zoomBehavior.current
        ) {
          // Calculate the point in transform space
          const pointInTransformSpace = {
            x: (centerX - transform.x) / transform.k,
            y: (centerY - transform.y) / transform.k,
          };

          // Apply zoom centered on mouse position
          const newTransform = d3.zoomIdentity
            .translate(centerX, centerY)
            .scale(newScale)
            .translate(-pointInTransformSpace.x, -pointInTransformSpace.y);

          const svg = d3.select(svgRef.current);
          svg.call(zoomBehavior.current.transform, newTransform);
        }
      }
      // Handle two-finger pan (trackpad scrolling without modifier keys)
      else if (!event.shiftKey && svgRef.current && zoomBehavior.current) {
        event.preventDefault();
        event.stopPropagation();

        // Apply pan transform (invert deltaX/Y for natural scrolling feel)
        const deltaX = -event.deltaX * ZOOM_CONSTANTS.PAN_SENSITIVITY;
        const deltaY = -event.deltaY * ZOOM_CONSTANTS.PAN_SENSITIVITY;

        const newTransform = d3.zoomIdentity
          .translate(transform.x + deltaX, transform.y + deltaY)
          .scale(transform.k);

        const svg = d3.select(svgRef.current);
        svg.call(zoomBehavior.current.transform, newTransform);
      }
    };

    // Touch handlers for pinch-to-zoom
    let globalTouchStartDistance = 0;
    let globalTouchStartTransform = transform;
    let globalTouchCenter = { x: 0, y: 0 };

    const handleGlobalTouchStart = (event: TouchEvent) => {
      if (
        event.touches.length === INTERACTION.MIN_TOUCH_POINTS &&
        containerRef.current
      ) {
        // Check if the touch is within our container
        const rect = containerRef.current.getBoundingClientRect();
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;

        const isInsideContainer =
          centerX >= rect.left &&
          centerX <= rect.right &&
          centerY >= rect.top &&
          centerY <= rect.bottom;

        if (!isInsideContainer) return; // Don't handle touches outside our container

        globalTouchStartDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        globalTouchCenter = { x: centerX, y: centerY };
        globalTouchStartTransform = transform;
        event.preventDefault();
      }
    };

    const handleGlobalTouchMove = (event: TouchEvent) => {
      if (
        event.touches.length === INTERACTION.MIN_TOUCH_POINTS &&
        globalTouchStartDistance > 0 &&
        containerRef.current
      ) {
        // Check if we're still inside the container
        const rect = containerRef.current.getBoundingClientRect();
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;

        const isInsideContainer =
          centerX >= rect.left &&
          centerX <= rect.right &&
          centerY >= rect.top &&
          centerY <= rect.bottom;

        if (!isInsideContainer) return;

        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        const scale = currentDistance / globalTouchStartDistance;
        const newScale = Math.max(
          ZOOM_CONSTANTS.MIN_ZOOM,
          Math.min(ZOOM_CONSTANTS.MAX_ZOOM, globalTouchStartTransform.k * scale)
        );

        // Calculate the center point in transform space
        const centerInTransformSpace = {
          x:
            (globalTouchCenter.x - rect.left - globalTouchStartTransform.x) /
            globalTouchStartTransform.k,
          y:
            (globalTouchCenter.y - rect.top - globalTouchStartTransform.y) /
            globalTouchStartTransform.k,
        };

        // Apply zoom centered on pinch center
        const newTransform = d3.zoomIdentity
          .translate(
            globalTouchCenter.x - rect.left,
            globalTouchCenter.y - rect.top
          )
          .scale(newScale)
          .translate(-centerInTransformSpace.x, -centerInTransformSpace.y);

        if (svgRef.current && zoomBehavior.current) {
          const svg = d3.select(svgRef.current);
          svg.call(zoomBehavior.current.transform, newTransform);
        }
        event.preventDefault();
      }
    };

    const handleGlobalTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < INTERACTION.MIN_TOUCH_POINTS) {
        globalTouchStartDistance = 0;
      }
    };

    // Add global event listeners to capture zoom gestures everywhere
    document.addEventListener("wheel", handleGlobalWheel, { passive: false });
    document.addEventListener("touchstart", handleGlobalTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleGlobalTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", handleGlobalTouchEnd);

    // Utility function to check if user is typing in an input field
    const isUserTyping = (): boolean => {
      const activeElement = document.activeElement;
      return !!(
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT" ||
          activeElement.hasAttribute("contenteditable") ||
          (activeElement as HTMLElement).isContentEditable)
      );
    };

    // Enhanced keyboard event handling
    const handleKeyDown = (event: KeyboardEvent) => {
      // If user is typing, don't interfere with their input except for Escape
      if (isUserTyping() && event.key !== "Escape") {
        return;
      }

      // Prevent default for our custom shortcuts
      if (event.key === " ") {
        event.preventDefault();
        setIsSpacePressed(true);
      } else if (event.key === "1") {
        event.preventDefault();
        if (event.shiftKey) {
          zoomToFit();
        } else {
          resetZoom();
        }
      } else if (event.key === "2") {
        event.preventDefault();
        zoomToSelection();
      } else if (event.key === "3" || event.key === "o" || event.key === "O") {
        event.preventDefault();
        setShowOverview(!showOverview);
      } else if (event.key === "4" || event.key === "g" || event.key === "G") {
        event.preventDefault();
        setShowGrid(!showGrid);
      } else if (event.key === "5" || event.key === "s" || event.key === "S") {
        event.preventDefault();
        setSnapToGrid(!snapToGrid);
      } else if (event.key === "Escape") {
        // Close overview if open, otherwise deselect all components
        if (showOverview) {
          setShowOverview(false);
        } else {
          setSelectedComponents([]);
        }
      } else if (event.key === "Delete" || event.key === "Backspace") {
        handleDeleteSelected();
      } else if (event.key === "c" && (event.ctrlKey || event.metaKey)) {
        // Copy selected shape components
        event.preventDefault();
        handleCopyComponents();
      } else if (event.key === "v" && (event.ctrlKey || event.metaKey)) {
        // Paste components at mouse position
        event.preventDefault();
        if (event.shiftKey) {
          // Ctrl+Shift+V: Force paste image from clipboard (ignore copied components)
          handlePasteImageFromClipboard();
        } else {
          // Ctrl+V: Normal paste (components first, then images)
          handlePasteComponents();
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Only handle space key release if not typing
      if (event.key === " " && !isUserTyping()) {
        setIsSpacePressed(false);
      }
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", panHandleMouseDown);
    window.addEventListener("mousemove", panHandleMouseMove);
    window.addEventListener("mouseup", panHandleMouseUp);
    window.addEventListener("contextmenu", panHandleContextMenu);

    return () => {
      svg.selectAll("*").remove();

      // Cleanup global event listeners
      document.removeEventListener("wheel", handleGlobalWheel);
      document.removeEventListener("touchstart", handleGlobalTouchStart);
      document.removeEventListener("touchmove", handleGlobalTouchMove);
      document.removeEventListener("touchend", handleGlobalTouchEnd);

      // Cleanup window event listeners
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", panHandleMouseDown);
      window.removeEventListener("mousemove", panHandleMouseMove);
      window.removeEventListener("mouseup", panHandleMouseUp);
      window.removeEventListener("contextmenu", panHandleContextMenu);
    };
  }, [
    handleDeleteSelected,
    isMarqueeActive,
    isSpacePressed,
    setIsSpacePressed,
    resetZoom,
    zoomToFit,
    zoomToSelection,
    showOverview,
    setShowOverview,
    showGrid,
    setShowGrid,
    snapToGrid,
    setSnapToGrid,
    handleCopyComponents,
    handlePasteComponents,
    handlePasteImageFromClipboard,
    setSelectedComponents,
    zoomBehavior,
    panHandleMouseDown,
    panHandleMouseMove,
    panHandleMouseUp,
    panHandleContextMenu,
    previousZoomScale,
    setTransform,
    showZoomIndicatorTemporarily,
    transform,
    svgRef,
    containerRef,
  ]);
};
