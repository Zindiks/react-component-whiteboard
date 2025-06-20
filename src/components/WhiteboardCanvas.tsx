import React, { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import { useWhiteboardStore } from "@/store/whiteboard";
import { getComponent } from "@/components/ComponentRegistry";

interface WhiteboardCanvasProps {
  onDrop: (componentType: string, x: number, y: number) => void;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  onDrop,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<
    SVGSVGElement,
    unknown
  > | null>(null);

  // Navigation state
  const [isPanning, setIsPanning] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const [lastPointerPos, setLastPointerPos] = useState({ x: 0, y: 0 });
  const [doubleTapPanning, setDoubleTapPanning] = useState(false);
  const [trackpadPanning, setTrackpadPanning] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [panTimeout, setPanTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const [zoomIndicatorTimeout, setZoomIndicatorTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [zoomCenter, setZoomCenter] = useState<{ x: number; y: number } | null>(
    null
  );
  const [showCoordinates, setShowCoordinates] = useState(true); // Enabled by default for debugging drop coordinates

  // Visual drop indicator state
  const [dropIndicator, setDropIndicator] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const {
    transform,
    setTransform,
    gridSize,
    gridVisible,
    components,
    selectedComponents,
    selectComponent,
    clearSelection,
    removeComponent,
    isDragging,
    setDragging,
    isSelecting,
    selectionStart,
    selectionEnd,
    startSelection,
    updateSelection,
    endSelection,
    selectComponentsInRectangle,
  } = useWhiteboardStore();

  // Show zoom indicator temporarily
  const showZoomLevel = useCallback(() => {
    setShowZoomIndicator(true);

    // Clear existing timeout
    if (zoomIndicatorTimeout) {
      clearTimeout(zoomIndicatorTimeout);
    }

    // Hide after 2 seconds
    const timeout = setTimeout(() => {
      setShowZoomIndicator(false);
    }, 2000);
    setZoomIndicatorTimeout(timeout);
  }, [zoomIndicatorTimeout]);

  const zoomTo = useCallback(
    (scale: number, mousePos?: { x: number; y: number }) => {
      if (!svgRef.current || !containerRef.current || !zoomBehaviorRef.current)
        return;

      const svg = d3.select(svgRef.current);
      const container = containerRef.current;

      // Use provided mouse position or stored mouse position as zoom center
      const zoomCenterPos = mousePos || mousePosition;

      // Make sure we have valid coordinates, otherwise use viewport center as fallback
      const centerPoint = [
        zoomCenterPos.x || container.clientWidth / 2,
        zoomCenterPos.y || container.clientHeight / 2,
      ];

      // Store the zoom center for display
      setZoomCenter({
        x: centerPoint[0],
        y: centerPoint[1],
      });

      svg
        .transition()
        .duration(200) // Faster transition
        .call(zoomBehaviorRef.current.scaleTo, scale, centerPoint);

      // Show zoom level indicator
      showZoomLevel();
    },
    [mousePosition, showZoomLevel]
  );

  const fitToScreen = useCallback(() => {
    if (
      !svgRef.current ||
      !containerRef.current ||
      components.length === 0 ||
      !zoomBehaviorRef.current
    )
      return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const padding = 100;

    // Calculate bounding box of all components
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    components.forEach((component) => {
      const width = component.width || 200;
      const height = component.height || 150;

      minX = Math.min(minX, component.x);
      minY = Math.min(minY, component.y);
      maxX = Math.max(maxX, component.x + width);
      maxY = Math.max(maxY, component.y + height);
    });

    if (minX === Infinity) return;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const availableWidth = container.clientWidth - padding * 2;
    const availableHeight = container.clientHeight - padding * 2;

    // Calculate scale to fit content
    const scaleX = availableWidth / contentWidth;
    const scaleY = availableHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%

    // Center the content
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const newX = container.clientWidth / 2 - centerX * scale;
    const newY = container.clientHeight / 2 - centerY * scale;

    const newTransform = d3.zoomIdentity.translate(newX, newY).scale(scale);
    svg
      .transition()
      .duration(500)
      .call(zoomBehaviorRef.current.transform, newTransform);
  }, [components]);

  // Keyboard shortcuts handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for our shortcuts
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return; // Don't handle shortcuts when typing in inputs
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdCtrlKey = isMac ? event.metaKey : event.ctrlKey;

      switch (event.key) {
        case " ":
          event.preventDefault();
          setSpacePressed(true);
          break;
        case "1":
          event.preventDefault();
          if (event.shiftKey) {
            fitToScreen();
          } else {
            zoomTo(1); // 100% zoom
          }
          break;
        case "0":
          if (cmdCtrlKey) {
            event.preventDefault();
            zoomTo(1); // Reset zoom to 100%
          }
          break;
        case "=":
        case "+":
          if (cmdCtrlKey) {
            event.preventDefault();
            const currentTransform = d3.zoomTransform(svgRef.current!);
            const currentScale = currentTransform.k;

            // Smart zoom increment based on current scale
            let newScale;
            if (currentScale < 0.5) {
              newScale = Math.min(currentScale * 1.5, 8);
            } else if (currentScale < 1) {
              newScale = Math.min(currentScale * 1.3, 8);
            } else {
              newScale = Math.min(currentScale * 1.2, 8);
            }

            zoomTo(newScale);
          }
          break;
        case "-":
          if (cmdCtrlKey) {
            event.preventDefault();
            const currentTransform = d3.zoomTransform(svgRef.current!);
            const currentScale = currentTransform.k;

            // Smart zoom decrement based on current scale
            let newScale;
            if (currentScale > 2) {
              newScale = Math.max(currentScale / 1.2, 0.05);
            } else if (currentScale > 1) {
              newScale = Math.max(currentScale / 1.3, 0.05);
            } else {
              newScale = Math.max(currentScale / 1.5, 0.05);
            }

            zoomTo(newScale);
          }
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === " ") {
        setSpacePressed(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [zoomTo, fitToScreen, setSpacePressed]);

  // Initialize D3 zoom behavior with enhanced navigation
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;

    // Set SVG dimensions
    svg
      .attr("width", container.clientWidth)
      .attr("height", container.clientHeight);

    // Create enhanced zoom behavior
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 8]) // Expanded zoom range
      .filter((event) => {
        // Allow zoom with Ctrl/Cmd + wheel, pinch gestures, or programmatic zoom
        if (event.type === "wheel") {
          // Only allow wheel events if they have Ctrl/Cmd pressed for zoom
          // This prevents D3 from handling trackpad pan events
          return event.ctrlKey || event.metaKey;
        }
        // Allow middle-click panning and space+click panning
        if (event.type === "mousedown") {
          return (
            event.button === 1 || // Middle mouse button
            event.button === 2 || // Right mouse button
            (event.button === 0 && spacePressed)
          ); // Left mouse + space
        }
        // Block touch gestures - we handle them manually
        if (event.type === "touchstart" || event.type === "touchmove") {
          return false;
        }
        return true;
      })
      .on("zoom", (event) => {
        if (!isDragging) {
          // Always use the transform as-is, don't adjust for mouse position
          setTransform({
            x: event.transform.x,
            y: event.transform.y,
            k: event.transform.k,
          });

          // Show zoom indicator for D3 zoom events
          if (event.sourceEvent && event.sourceEvent.type === "wheel") {
            showZoomLevel();

            // Track zoom center for wheel events
            const rect = containerRef.current!.getBoundingClientRect();
            const mousePos = {
              x: event.sourceEvent.clientX - rect.left,
              y: event.sourceEvent.clientY - rect.top,
            };
            setZoomCenter(mousePos);
          }
        }
      })
      .on("start", (event) => {
        if (event.sourceEvent) {
          const sourceEvent = event.sourceEvent;
          if (sourceEvent.type === "mousedown") {
            setIsPanning(true);
            setLastPointerPos({
              x: sourceEvent.clientX,
              y: sourceEvent.clientY,
            });
          }
        }
      })
      .on("end", () => {
        setIsPanning(false);
      });

    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);

    // Enhanced mouse handling for better navigation
    svg.on("mousedown", (event) => {
      // Prevent default context menu on right-click
      if (event.button === 2) {
        event.preventDefault();
      }

      // Handle selection rectangle (left click on empty canvas)
      if (
        event.button === 0 &&
        event.target === svg.node() &&
        !spacePressed &&
        !isDragging &&
        !isPanning
      ) {
        const currentTime = Date.now();
        const timeDiff = currentTime - lastTapTime;

        if (timeDiff < 300 && timeDiff > 50) {
          // Double-click threshold with minimum delay
          // Start panning mode on double-click
          event.preventDefault();
          setDoubleTapPanning(true);
          setIsPanning(true);
          setLastPointerPos({ x: event.clientX, y: event.clientY });
          return;
        } else {
          setLastTapTime(currentTime);

          // Start selection rectangle at screen coordinates (not canvas coordinates)
          const rect = containerRef.current!.getBoundingClientRect();
          const screenX = event.clientX - rect.left;
          const screenY = event.clientY - rect.top;

          // Clear selection if not holding Cmd/Ctrl
          if (!event.metaKey && !event.ctrlKey) {
            clearSelection();
          }

          // Start selection rectangle with screen coordinates
          startSelection(screenX, screenY);
          return;
        }
      }

      // Handle panning modes
      if (
        event.button === 1 ||
        event.button === 2 ||
        (event.button === 0 && spacePressed) ||
        doubleTapPanning
      ) {
        event.preventDefault();
        setIsPanning(true);
        setLastPointerPos({ x: event.clientX, y: event.clientY });
      }
    });

    // Global wheel handler to ensure zoom works even when hovering over components
    let lastPanTime = 0;
    const handleGlobalWheel = (event: WheelEvent) => {
      // Only handle if the event is within our container
      if (!containerRef.current?.contains(event.target as Node)) {
        return;
      }

      const now = Date.now();

      // Handle zoom with Ctrl/Cmd + wheel regardless of what element is hovered
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
        event.preventDefault();
        event.stopImmediatePropagation();

        // Calculate zoom factor
        const delta = -event.deltaY;
        const currentTransform = d3.zoomTransform(svgRef.current!);
        const currentScale = currentTransform.k;

        // Adaptive zoom speed
        let zoomSpeed = 0.15;
        if (currentScale > 2) {
          zoomSpeed = 0.08;
        } else if (currentScale < 0.5) {
          zoomSpeed = 0.25;
        }

        let newScale;
        if (delta > 0) {
          newScale = currentScale * (1 + zoomSpeed);
        } else {
          newScale = currentScale * (1 - zoomSpeed);
        }

        // Clamp to limits
        newScale = Math.max(0.05, Math.min(8, newScale));

        // Snap to common zoom levels
        const snapThreshold = 0.05;
        const commonZooms = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
        for (const snapZoom of commonZooms) {
          if (Math.abs(newScale - snapZoom) < snapThreshold) {
            newScale = snapZoom;
            break;
          }
        }

        // Get mouse position for zoom center
        const rect = containerRef.current!.getBoundingClientRect();
        const mousePos = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };

        // Set zoom center for visual indicator
        setZoomCenter(mousePos);

        // Apply zoom using D3
        if (zoomBehaviorRef.current && svgRef.current) {
          const svg = d3.select(svgRef.current);
          const centerPoint = [mousePos.x, mousePos.y];

          svg
            .transition()
            .duration(100) // Even faster for wheel zoom
            .call(zoomBehaviorRef.current.scaleTo, newScale, centerPoint);
        }

        showZoomLevel();
        return;
      }

      // Handle trackpad two-finger pan (without Ctrl/Cmd)
      // More precise trackpad detection - look for horizontal movement with smooth deltas
      const hasHorizontalMovement = Math.abs(event.deltaX) > 0.5;
      const hasVerticalMovement = Math.abs(event.deltaY) > 0.5;
      const isSmooth =
        Math.abs(event.deltaX) % 1 !== 0 || Math.abs(event.deltaY) % 1 !== 0; // Trackpad gives fractional deltas

      const isTrackpadPan =
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        (hasHorizontalMovement || hasVerticalMovement) &&
        isSmooth && // Trackpad typically gives smooth fractional values
        Math.abs(event.deltaX) < 100 &&
        Math.abs(event.deltaY) < 100; // Not a wheel event

      if (isTrackpadPan) {
        // Prevent this event from reaching D3 to avoid conflicts
        event.preventDefault();
        event.stopImmediatePropagation();

        // Throttle updates to avoid too many state changes
        if (now - lastPanTime < 16) return; // ~60fps throttling
        lastPanTime = now;

        // Set trackpad panning mode
        if (!trackpadPanning) {
          setTrackpadPanning(true);
        }

        // Clear any existing timeout
        if (panTimeout) {
          clearTimeout(panTimeout);
        }

        // Get current transform to avoid stale state
        const currentTransform = useWhiteboardStore.getState().transform;

        // Pan smoothly with adjusted sensitivity
        const sensitivity = 1.2;
        setTransform({
          x: currentTransform.x - event.deltaX * sensitivity,
          y: currentTransform.y - event.deltaY * sensitivity,
          k: currentTransform.k,
        });

        // Timeout to exit trackpad pan mode
        const newTimeout = setTimeout(() => {
          setTrackpadPanning(false);
        }, 100);
        setPanTimeout(newTimeout);
      }
    };

    // Add only ONE wheel listener to prevent conflicts
    document.addEventListener("wheel", handleGlobalWheel, { passive: false });

    // Prevent context menu on right-click
    container.addEventListener("contextmenu", (e) => e.preventDefault());

    // Handle window resize
    const handleResize = () => {
      svg
        .attr("width", container.clientWidth)
        .attr("height", container.clientHeight);
    };

    // Add global mouse move handler for double-tap panning, selection, and cursor tracking
    const handleGlobalMouseMove = (event: MouseEvent) => {
      // Throttle mouse position updates for coordinate display (only update every 16ms)
      if (containerRef.current && !showCoordinates) {
        // Skip expensive updates if coordinates aren't shown
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }

      // Handle mouse-based panning (double-click pan, NOT trackpad pan)
      // Trackpad pan is handled entirely by wheel events
      if (
        doubleTapPanning &&
        isPanning &&
        !isDragging &&
        lastPointerPos.x !== 0 &&
        lastPointerPos.y !== 0
      ) {
        // Only pan if this was initiated by mouse/touch, not trackpad
        // We can detect this by checking if lastPointerPos was set by a mousedown event
        const deltaX = event.clientX - lastPointerPos.x;
        const deltaY = event.clientY - lastPointerPos.y;

        // Only pan if we have significant movement
        if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
          setTransform({
            x: transform.x + deltaX,
            y: transform.y + deltaY,
            k: transform.k,
          });

          setLastPointerPos({ x: event.clientX, y: event.clientY });
        }
      }

      // Handle selection rectangle update
      if (isSelecting && !isPanning && !isDragging) {
        const rect = containerRef.current!.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;

        updateSelection(screenX, screenY);
      }
    };

    // Add global mouse up handler
    const handleGlobalMouseUp = (event: MouseEvent) => {
      if (doubleTapPanning) {
        setDoubleTapPanning(false);
        setIsPanning(false);
      }

      // Handle selection rectangle end
      if (isSelecting && selectionStart && selectionEnd) {
        const multiSelect = event.metaKey || event.ctrlKey;

        // Convert screen coordinates to canvas coordinates for selection logic
        const canvasStartX = (selectionStart.x - transform.x) / transform.k;
        const canvasStartY = (selectionStart.y - transform.y) / transform.k;
        const canvasEndX = (selectionEnd.x - transform.x) / transform.k;
        const canvasEndY = (selectionEnd.y - transform.y) / transform.k;

        selectComponentsInRectangle(
          canvasStartX,
          canvasStartY,
          canvasEndX,
          canvasEndY,
          multiSelect
        );
        endSelection();
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("mouseup", handleGlobalMouseUp);
    document.addEventListener("mousemove", handleGlobalMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("wheel", handleGlobalWheel);
      container.removeEventListener("contextmenu", (e) => e.preventDefault());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Only include essential dependencies to minimize re-runs for performance
    spacePressed,
    showZoomLevel,
  ]);

  // Initialize the store transform when D3 is ready
  useEffect(() => {
    if (svgRef.current) {
      const initialTransform = d3.zoomTransform(svgRef.current);
      setTransform({
        x: initialTransform.x,
        y: initialTransform.y,
        k: initialTransform.k,
      });
    }
  }, [setTransform]); // Include setTransform dependency

  // Render grid pattern - optimized to only update when necessary
  const renderGrid = useCallback(() => {
    if (!svgRef.current || !gridVisible) return null;

    const svg = d3.select(svgRef.current);

    // Remove existing grid
    svg.select(".grid").remove();

    const gridGroup = svg.append("g").attr("class", "grid");

    const { width, height } = svgRef.current.getBoundingClientRect();
    const scaledGridSize = gridSize * transform.k;

    // Only render grid if it's visible enough (performance optimization)
    if (scaledGridSize < 2) return null;

    // Calculate visible area with some padding
    const padding = scaledGridSize * 2;
    const startX =
      Math.floor((-transform.x - padding) / scaledGridSize) * scaledGridSize;
    const startY =
      Math.floor((-transform.y - padding) / scaledGridSize) * scaledGridSize;
    const endX = startX + width + padding * 2;
    const endY = startY + height + padding * 2;

    // Limit the number of grid lines for performance
    const maxLines = 200;
    const stepX = Math.max(scaledGridSize, (endX - startX) / maxLines);
    const stepY = Math.max(scaledGridSize, (endY - startY) / maxLines);

    // Draw vertical lines
    for (let x = startX; x <= endX; x += stepX) {
      gridGroup
        .append("line")
        .attr("x1", x + transform.x)
        .attr("y1", 0)
        .attr("x2", x + transform.x)
        .attr("y2", height)
        .attr("stroke", "#e5e7eb")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.5);
    }

    // Draw horizontal lines
    for (let y = startY; y <= endY; y += stepY) {
      gridGroup
        .append("line")
        .attr("x1", 0)
        .attr("y1", y + transform.y)
        .attr("x2", width)
        .attr("y2", y + transform.y)
        .attr("stroke", "#e5e7eb")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.5);
    }
  }, [gridVisible, gridSize, transform]); // Keep all transform dependencies for correctness

  // Re-render grid when transform changes - throttled for performance
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      renderGrid();
    }, 16); // ~60fps throttling

    return () => clearTimeout(timeoutId);
  }, [renderGrid]);

  // Handle drag and drop from sidebar
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";

    // Show drop indicator at cursor position
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;
      const canvasPos = screenToCanvas(screenX, screenY);
      const snappedPos = snapToGrid(canvasPos.x, canvasPos.y);
      setDropIndicator(snappedPos);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    // Only clear indicator when leaving the container completely
    if (!containerRef.current?.contains(event.relatedTarget as Node)) {
      setDropIndicator(null);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();

    const componentType = event.dataTransfer.getData("text/plain");
    if (!componentType) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Convert screen coordinates to canvas coordinates
    // First get the drop position relative to the container
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;

    // Transform to canvas coordinates using our utility function
    const canvasPos = screenToCanvas(screenX, screenY);

    // Snap to grid using our utility function
    const snappedPos = snapToGrid(canvasPos.x, canvasPos.y);

    // Debug logging for coordinate issues (can be removed later)
    if (showCoordinates) {
      console.log("Drop coordinates:", {
        screen: { x: screenX, y: screenY },
        canvas: canvasPos,
        snapped: snappedPos,
        transform,
        gridSize,
      });
    }

    // Clear drop indicator
    setDropIndicator(null);

    onDrop(componentType, snappedPos.x, snappedPos.y);
  };

  // Handle component dragging
  const handleComponentMouseDown = (
    event: React.MouseEvent,
    componentId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!selectedComponents.includes(componentId)) {
      selectComponent(componentId);
    }

    const startX = event.clientX;
    const startY = event.clientY;

    // Get initial positions of components to move
    const componentsToMove = selectedComponents.includes(componentId)
      ? selectedComponents
      : [componentId];

    const initialPositions = componentsToMove
      .map((id) => {
        const comp = components.find((c) => c.id === id);
        return comp ? { id, x: comp.x, y: comp.y } : null;
      })
      .filter(Boolean) as { id: string; x: number; y: number }[];

    setDragging(true, { x: startX, y: startY });

    // Disable double-tap panning when dragging components
    if (doubleTapPanning) {
      setDoubleTapPanning(false);
      setIsPanning(false);
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startX) / transform.k;
      const deltaY = (moveEvent.clientY - startY) / transform.k;

      // Update each component's position based on its initial position + delta
      initialPositions.forEach(({ id, x, y }) => {
        const newX = x + deltaX;
        const newY = y + deltaY;

        // Update component directly in the store using store getter to avoid stale closure
        useWhiteboardStore.getState().updateComponent(id, { x: newX, y: newY });
      });
    };

    const handleMouseUp = () => {
      setDragging(false);

      // Snap components to grid on mouse up
      const componentsToMove = selectedComponents.includes(componentId)
        ? selectedComponents
        : [componentId];

      componentsToMove.forEach((id) => {
        const currentComponents = useWhiteboardStore.getState().components;
        const comp = currentComponents.find((c) => c.id === id);
        if (comp) {
          const snappedPos = snapToGrid(comp.x, comp.y);
          useWhiteboardStore
            .getState()
            .updateComponent(id, { x: snappedPos.x, y: snappedPos.y });
        }
      });

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Touch gesture handling for trackpad and mobile devices
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let initialDistance = 0;
    let initialScale = transform.k;
    let touches: TouchList | null = null;

    const handleTouchStart = (event: TouchEvent) => {
      touches = event.touches;

      if (event.touches.length === 2) {
        // Simply having two fingers enables pan mode - no distance check needed
        event.preventDefault();
        setDoubleTapPanning(true);
        setIsPanning(true);

        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        setLastPointerPos({ x: centerX, y: centerY });

        // Store initial distance for potential zoom detection
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        initialScale = transform.k;
      } else if (event.touches.length === 1) {
        // Single finger - only for components or when already in pan mode
        const touch = event.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);

        // Only start single-finger pan if not touching a component
        if (
          (target === container || target === svgRef.current) &&
          !isDragging &&
          !doubleTapPanning
        ) {
          setLastPointerPos({ x: touch.clientX, y: touch.clientY });
          // Don't automatically start panning with single finger
        }
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (
        event.touches.length === 2 &&
        touches?.length === 2 &&
        doubleTapPanning
      ) {
        event.preventDefault();
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        // Check if this looks more like zoom (significant distance change) or pan
        const distanceChange = Math.abs(currentDistance - initialDistance);

        if (distanceChange > 30) {
          // Significant distance change = zoom gesture
          const scaleChange = currentDistance / initialDistance;
          const newScale = Math.max(
            0.05,
            Math.min(8, initialScale * scaleChange)
          );

          zoomTo(newScale);
        } else {
          // Small or no distance change = pan gesture
          const centerX = (touch1.clientX + touch2.clientX) / 2;
          const centerY = (touch1.clientY + touch2.clientY) / 2;

          const deltaX = centerX - lastPointerPos.x;
          const deltaY = centerY - lastPointerPos.y;

          setTransform({
            x: transform.x + deltaX,
            y: transform.y + deltaY,
            k: transform.k,
          });

          setLastPointerPos({ x: centerX, y: centerY });
        }
      } else if (event.touches.length === 1 && isPanning && !doubleTapPanning) {
        // Single finger pan (only when not in two-finger mode)
        event.preventDefault();
        const touch = event.touches[0];
        const deltaX = touch.clientX - lastPointerPos.x;
        const deltaY = touch.clientY - lastPointerPos.y;

        setTransform({
          x: transform.x + deltaX,
          y: transform.y + deltaY,
          k: transform.k,
        });

        setLastPointerPos({ x: touch.clientX, y: touch.clientY });
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      // Exit two-finger pan mode when lifting fingers
      if (event.touches.length < 2 && doubleTapPanning) {
        setDoubleTapPanning(false);
      }

      // Exit all pan modes when no touches remain
      if (event.touches.length === 0) {
        setIsPanning(false);
        setDoubleTapPanning(false);
      }

      touches = event.touches.length > 0 ? event.touches : null;

      // Reset zoom tracking when no touches remain
      if (event.touches.length === 0) {
        initialDistance = 0;
      }
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd);

    // Also listen for pointer events (Mac trackpad compatibility)
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch" && event.pressure > 0) {
        // Touch pointer detected
      }
    };

    container.addEventListener("pointerdown", handlePointerDown);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [
    transform,
    zoomTo,
    setTransform,
    isPanning,
    lastPointerPos,
    setIsPanning,
    setLastPointerPos,
    lastTapTime,
    isDragging,
    doubleTapPanning,
  ]);

  // Enhanced navigation controls component
  const NavigationControls: React.FC = () => (
    <div className="absolute top-4 right-4 flex flex-col gap-1 bg-white/90 backdrop-blur-sm rounded-lg p-1 border shadow-sm">
      <button
        onClick={() => {
          const currentTransform = d3.zoomTransform(svgRef.current!);
          const currentScale = currentTransform.k;
          let newScale;
          if (currentScale < 0.5) {
            newScale = Math.min(currentScale * 1.5, 8);
          } else if (currentScale < 1) {
            newScale = Math.min(currentScale * 1.3, 8);
          } else {
            newScale = Math.min(currentScale * 1.2, 8);
          }
          zoomTo(newScale);
        }}
        className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors"
        title="Zoom In (Ctrl/Cmd + Plus)"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <line x1="8" y1="11" x2="14" y2="11" />
          <line x1="11" y1="8" x2="11" y2="14" />
        </svg>
      </button>

      <button
        onClick={() => {
          const currentTransform = d3.zoomTransform(svgRef.current!);
          const currentScale = currentTransform.k;
          let newScale;
          if (currentScale > 2) {
            newScale = Math.max(currentScale / 1.2, 0.05);
          } else if (currentScale > 1) {
            newScale = Math.max(currentScale / 1.3, 0.05);
          } else {
            newScale = Math.max(currentScale / 1.5, 0.05);
          }
          zoomTo(newScale);
        }}
        className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors"
        title="Zoom Out (Ctrl/Cmd + Minus)"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>

      <button
        onClick={() => zoomTo(1)}
        className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors text-xs font-mono"
        title="Reset Zoom to 100% (1)"
      >
        1:1
      </button>

      <button
        onClick={fitToScreen}
        className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors"
        title="Fit to Screen (Shift + 1)"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      </button>
    </div>
  );

  // Utility functions for coordinate transformations
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const canvasX = (screenX - transform.x) / transform.k;
      const canvasY = (screenY - transform.y) / transform.k;
      return { x: canvasX, y: canvasY };
    },
    [transform]
  );

  const snapToGrid = useCallback(
    (x: number, y: number) => {
      return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize,
      };
    },
    [gridSize]
  );

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-gray-50 min-h-screen"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        cursor:
          isPanning || doubleTapPanning || trackpadPanning
            ? "grabbing"
            : spacePressed
            ? "grab"
            : isDragging
            ? "grabbing"
            : "default",
      }}
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          touchAction: "none", // Important for touch gestures
          cursor: "inherit",
        }}
      />

      {/* Render actual components */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
        }}
      >
        {components.map((component) => {
          const componentConfig = getComponent(component.type);
          if (!componentConfig) {
            return (
              <div
                key={component.id}
                className="absolute bg-red-500 text-white p-2"
                style={{ left: component.x, top: component.y }}
              >
                Unknown component: {component.type}
              </div>
            );
          }

          const Component = componentConfig.component;
          const isSelected = selectedComponents.includes(component.id);

          return (
            <div
              key={component.id}
              className={`absolute pointer-events-auto transition-opacity ${
                isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
              } ${isDragging && isSelected ? "opacity-75" : ""}`}
              style={{
                left: component.x,
                top: component.y,
                zIndex: component.zIndex || 0,
              }}
              onClick={(e) => {
                e.stopPropagation();
                const multiSelect = e.metaKey || e.ctrlKey;
                selectComponent(component.id, multiSelect);
              }}
            >
              <Component
                {...(component.props || componentConfig.defaultProps)}
                onHeaderMouseDown={(e: React.MouseEvent) =>
                  handleComponentMouseDown(e, component.id)
                }
                onDelete={() => removeComponent(component.id)}
              />
            </div>
          );
        })}
      </div>

      {/* Selection rectangle in screen coordinates (outside the transformed div) */}
      {isSelecting && selectionStart && selectionEnd && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-100/20 pointer-events-none z-50"
          style={{
            left: Math.min(selectionStart.x, selectionEnd.x),
            top: Math.min(selectionStart.y, selectionEnd.y),
            width: Math.abs(selectionEnd.x - selectionStart.x),
            height: Math.abs(selectionEnd.y - selectionStart.y),
          }}
        />
      )}

      {/* Navigation controls */}
      <NavigationControls />

      {/* Pan instructions */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border shadow-sm text-sm text-gray-600">
        <div className="font-medium mb-1">Navigation:</div>
        <div className="space-y-1 text-xs">
          <div>• Two-finger scroll: Pan</div>
          <div>• Double-click canvas: Pan mode</div>
          <div>• Space + drag: Pan</div>
          <div>• Cmd/Ctrl + scroll: Zoom</div>
          <div>• Middle-click drag: Pan</div>
        </div>
        <div className="font-medium mb-1 mt-2">Selection:</div>
        <div className="space-y-1 text-xs">
          <div>• Click & drag: Select area</div>
          <div>• Cmd/Ctrl + drag: Add to selection</div>
          <div>• Click component: Select single</div>
          <div>• Cmd/Ctrl + click: Multi-select</div>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-200">
          <button
            onClick={() => setShowCoordinates(!showCoordinates)}
            className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-700 transition-colors"
          >
            {showCoordinates ? "Hide" : "Show"} Coordinates
          </button>
        </div>
      </div>

      {/* Bottom indicators */}
      <div className="absolute bottom-4 right-4 space-y-2">
        <div className="bg-gray-800 text-white p-2 rounded text-sm">
          Zoom: {Math.round(transform.k * 100)}%
        </div>
        {showCoordinates && (
          <div className="bg-blue-800 text-white p-2 rounded text-xs font-mono">
            <div>
              Mouse: ({Math.round(mousePosition.x)},{" "}
              {Math.round(mousePosition.y)})
            </div>
            <div>
              Canvas: (
              {Math.round((mousePosition.x - transform.x) / transform.k)},{" "}
              {Math.round((mousePosition.y - transform.y) / transform.k)})
            </div>
            <div>
              Transform: x:{Math.round(transform.x)}, y:
              {Math.round(transform.y)}, k:{transform.k.toFixed(2)}
            </div>
            {zoomCenter && (
              <div>
                Zoom Center: ({Math.round(zoomCenter.x)},{" "}
                {Math.round(zoomCenter.y)})
              </div>
            )}
            {dropIndicator && (
              <div>
                Drop Target: ({Math.round(dropIndicator.x)},{" "}
                {Math.round(dropIndicator.y)})
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zoom center indicator (shows temporarily during zoom) */}
      {showZoomIndicator && zoomCenter && (
        <div
          className="absolute w-4 h-4 border-2 border-red-500 bg-red-200 rounded-full pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: zoomCenter.x,
            top: zoomCenter.y,
          }}
        />
      )}

      {/* Zoom level indicator (shows temporarily during zoom) */}
      {showZoomIndicator && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-lg font-mono pointer-events-none">
          {Math.round(transform.k * 100)}%
        </div>
      )}

      {/* Drop indicator - shows where component will be placed */}
      {dropIndicator && (
        <div
          className="absolute pointer-events-none z-40"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
          }}
        >
          <div
            className="absolute border-2 border-green-500 bg-green-100/30 rounded"
            style={{
              left: dropIndicator.x,
              top: dropIndicator.y,
              width: 100,
              height: 80,
            }}
          >
            <div className="text-xs text-green-700 p-1 font-mono">
              ({Math.round(dropIndicator.x)}, {Math.round(dropIndicator.y)})
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
