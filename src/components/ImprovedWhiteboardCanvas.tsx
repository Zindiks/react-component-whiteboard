import React, { useRef, useEffect, useCallback, useState } from "react";
import { useWhiteboardStore } from "@/store/whiteboard";
import { getComponent } from "@/components/ComponentRegistry";

interface Point {
  x: number;
  y: number;
}

interface WhiteboardCanvasProps {
  onDrop: (componentType: string, x: number, y: number) => void;
}

export const ImprovedWhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  onDrop,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Navigation state
  const [isPanning, setIsPanning] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const [lastPointerPos, setLastPointerPos] = useState<Point>({ x: 0, y: 0 });
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);

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

  // Coordinate conversion utilities
  const screenToCanvas = useCallback(
    (screenPoint: Point): Point => {
      return {
        x: (screenPoint.x - transform.x) / transform.k,
        y: (screenPoint.y - transform.y) / transform.k,
      };
    },
    [transform]
  );

  const canvasToScreen = useCallback(
    (canvasPoint: Point): Point => {
      return {
        x: canvasPoint.x * transform.k + transform.x,
        y: canvasPoint.y * transform.k + transform.y,
      };
    },
    [transform]
  );

  const getMousePosition = useCallback((event: MouseEvent): Point => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }, []);

  // Show zoom indicator temporarily
  const showZoomLevel = useCallback(() => {
    setShowZoomIndicator(true);
    setTimeout(() => setShowZoomIndicator(false), 1500);
  }, []);

  // Cursor-centered zoom
  const zoomToPoint = useCallback(
    (targetScale: number, focalPoint: Point) => {
      // Clamp scale to reasonable limits
      const clampedScale = Math.max(0.1, Math.min(5, targetScale));

      // Calculate what canvas point is at the focal point
      const canvasPoint = screenToCanvas(focalPoint);

      // Calculate new transform to keep that canvas point at the focal point
      const newTransform = {
        x: focalPoint.x - canvasPoint.x * clampedScale,
        y: focalPoint.y - canvasPoint.y * clampedScale,
        k: clampedScale,
      };

      setTransform(newTransform);
      showZoomLevel();
    },
    [screenToCanvas, setTransform, showZoomLevel]
  );

  // Pan by delta amount
  const panBy = useCallback(
    (deltaX: number, deltaY: number) => {
      setTransform({
        x: transform.x + deltaX,
        y: transform.y + deltaY,
        k: transform.k,
      });
    },
    [transform, setTransform]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
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
            // Fit to screen - center viewport on components
            if (components.length > 0 && containerRef.current) {
              const container = containerRef.current;
              let minX = Infinity,
                minY = Infinity,
                maxX = -Infinity,
                maxY = -Infinity;

              components.forEach((component) => {
                const width = component.width || 250;
                const height = component.height || 200;
                minX = Math.min(minX, component.x);
                minY = Math.min(minY, component.y);
                maxX = Math.max(maxX, component.x + width);
                maxY = Math.max(maxY, component.y + height);
              });

              const contentWidth = maxX - minX;
              const contentHeight = maxY - minY;
              const padding = 100;

              const scaleX =
                (container.clientWidth - padding * 2) / contentWidth;
              const scaleY =
                (container.clientHeight - padding * 2) / contentHeight;
              const scale = Math.min(scaleX, scaleY, 1);

              const centerX = (minX + maxX) / 2;
              const centerY = (minY + maxY) / 2;

              setTransform({
                x: container.clientWidth / 2 - centerX * scale,
                y: container.clientHeight / 2 - centerY * scale,
                k: scale,
              });
            }
          } else {
            // 100% zoom to center
            if (containerRef.current) {
              const container = containerRef.current;
              const center = {
                x: container.clientWidth / 2,
                y: container.clientHeight / 2,
              };
              zoomToPoint(1, center);
            }
          }
          break;
        case "=":
        case "+":
          if (cmdCtrlKey) {
            event.preventDefault();
            const newScale = Math.min(transform.k * 1.2, 5);
            if (containerRef.current) {
              const container = containerRef.current;
              const center = {
                x: container.clientWidth / 2,
                y: container.clientHeight / 2,
              };
              zoomToPoint(newScale, center);
            }
          }
          break;
        case "-":
          if (cmdCtrlKey) {
            event.preventDefault();
            const newScale = Math.max(transform.k / 1.2, 0.1);
            if (containerRef.current) {
              const container = containerRef.current;
              const center = {
                x: container.clientWidth / 2,
                y: container.clientHeight / 2,
              };
              zoomToPoint(newScale, center);
            }
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
  }, [components, transform.k, setTransform, zoomToPoint]);

  // Mouse and wheel event handling
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      // Two-finger pan (trackpad horizontal scroll)
      if (!event.ctrlKey && !event.metaKey && Math.abs(event.deltaX) > 0) {
        panBy(-event.deltaX, -event.deltaY);
        return;
      }

      // Zoom with Ctrl/Cmd + wheel
      if (event.ctrlKey || event.metaKey) {
        const mousePos = getMousePosition(event);
        const delta = -event.deltaY;
        const zoomSpeed = 0.001;
        const scaleFactor = 1 + delta * zoomSpeed;
        const newScale = transform.k * scaleFactor;

        zoomToPoint(newScale, mousePos);
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      const mousePos = getMousePosition(event);

      // Start selection rectangle on empty canvas
      if (event.button === 0 && event.target === container && !spacePressed) {
        if (!event.metaKey && !event.ctrlKey) {
          clearSelection();
        }
        startSelection(mousePos.x, mousePos.y);
        return;
      }

      // Pan with space + left click, middle click, or right click
      if (
        (event.button === 0 && spacePressed) ||
        event.button === 1 ||
        event.button === 2
      ) {
        event.preventDefault();
        setIsPanning(true);
        setLastPointerPos(mousePos);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const mousePos = getMousePosition(event);

      // Handle panning
      if (isPanning) {
        const deltaX = mousePos.x - lastPointerPos.x;
        const deltaY = mousePos.y - lastPointerPos.y;
        panBy(deltaX, deltaY);
        setLastPointerPos(mousePos);
      }

      // Handle selection rectangle
      if (isSelecting) {
        updateSelection(mousePos.x, mousePos.y);
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (isPanning) {
        setIsPanning(false);
      }

      // End selection rectangle
      if (isSelecting && selectionStart && selectionEnd) {
        const multiSelect = event.metaKey || event.ctrlKey;

        // Convert screen coordinates to canvas coordinates
        const canvasStart = screenToCanvas(selectionStart);
        const canvasEnd = screenToCanvas(selectionEnd);

        selectComponentsInRectangle(
          canvasStart.x,
          canvasStart.y,
          canvasEnd.x,
          canvasEnd.y,
          multiSelect
        );
        endSelection();
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("contextmenu", (e) => e.preventDefault());

    // Global listeners for mouse events that can happen outside the container
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("contextmenu", (e) => e.preventDefault());
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    transform,
    isPanning,
    lastPointerPos,
    spacePressed,
    isSelecting,
    selectionStart,
    selectionEnd,
    getMousePosition,
    panBy,
    zoomToPoint,
    screenToCanvas,
    clearSelection,
    startSelection,
    updateSelection,
    endSelection,
    selectComponentsInRectangle,
  ]);

  // Handle drag and drop
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const componentType = event.dataTransfer.getData("text/plain");
    if (!componentType || !containerRef.current) return;

    const mousePos = getMousePosition(event.nativeEvent as MouseEvent);
    const canvasPos = screenToCanvas(mousePos);

    // Snap to grid
    const snappedX = Math.round(canvasPos.x / gridSize) * gridSize;
    const snappedY = Math.round(canvasPos.y / gridSize) * gridSize;

    onDrop(componentType, snappedX, snappedY);
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

    const startPos = getMousePosition(event.nativeEvent);
    const componentsToMove = selectedComponents.includes(componentId)
      ? selectedComponents
      : [componentId];

    const initialPositions = componentsToMove
      .map((id) => {
        const comp = components.find((c) => c.id === id);
        return comp ? { id, x: comp.x, y: comp.y } : null;
      })
      .filter(Boolean) as { id: string; x: number; y: number }[];

    setDragging(true, startPos);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = getMousePosition(moveEvent);
      const deltaCanvas = screenToCanvas({
        x: currentPos.x - startPos.x,
        y: currentPos.y - startPos.y,
      });
      const zeroCanvas = screenToCanvas({ x: 0, y: 0 });
      const actualDelta = {
        x: deltaCanvas.x - zeroCanvas.x,
        y: deltaCanvas.y - zeroCanvas.y,
      };

      initialPositions.forEach(({ id, x, y }) => {
        useWhiteboardStore.getState().updateComponent(id, {
          x: x + actualDelta.x,
          y: y + actualDelta.y,
        });
      });
    };

    const handleMouseUp = () => {
      setDragging(false);

      // Snap to grid
      componentsToMove.forEach((id) => {
        const comp = useWhiteboardStore
          .getState()
          .components.find((c) => c.id === id);
        if (comp) {
          const snappedX = Math.round(comp.x / gridSize) * gridSize;
          const snappedY = Math.round(comp.y / gridSize) * gridSize;
          useWhiteboardStore.getState().updateComponent(id, {
            x: snappedX,
            y: snappedY,
          });
        }
      });

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Render grid
  const renderGrid = () => {
    if (!gridVisible) return null;

    const gridLines = [];
    const { width, height } = containerRef.current?.getBoundingClientRect() || {
      width: 0,
      height: 0,
    };

    // Calculate visible area in canvas coordinates
    const topLeft = screenToCanvas({ x: 0, y: 0 });
    const bottomRight = screenToCanvas({ x: width, y: height });

    const startX = Math.floor(topLeft.x / gridSize) * gridSize;
    const endX = Math.ceil(bottomRight.x / gridSize) * gridSize;
    const startY = Math.floor(topLeft.y / gridSize) * gridSize;
    const endY = Math.ceil(bottomRight.y / gridSize) * gridSize;

    // Vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      const screenX = canvasToScreen({ x, y: 0 }).x;
      gridLines.push(
        <line
          key={`v-${x}`}
          x1={screenX}
          y1={0}
          x2={screenX}
          y2={height}
          stroke="#e5e7eb"
          strokeWidth={0.5}
          opacity={0.5}
        />
      );
    }

    // Horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      const screenY = canvasToScreen({ x: 0, y }).y;
      gridLines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={screenY}
          x2={width}
          y2={screenY}
          stroke="#e5e7eb"
          strokeWidth={0.5}
          opacity={0.5}
        />
      );
    }

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {gridLines}
      </svg>
    );
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-gray-50"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        cursor: isPanning
          ? "grabbing"
          : spacePressed
          ? "grab"
          : isDragging
          ? "grabbing"
          : "default",
      }}
    >
      {/* Grid */}
      {renderGrid()}

      {/* Canvas content */}
      <div
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
          transformOrigin: "0 0",
        }}
      >
        {components.map((component) => {
          const componentConfig = getComponent(component.type);
          if (!componentConfig) return null;

          const Component = componentConfig.component;
          const isSelected = selectedComponents.includes(component.id);

          return (
            <div
              key={component.id}
              className={`absolute pointer-events-auto transition-opacity ${
                isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
              }`}
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

      {/* Selection rectangle */}
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

      {/* Zoom indicator */}
      {showZoomIndicator && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-lg font-mono pointer-events-none">
          {Math.round(transform.k * 100)}%
        </div>
      )}

      {/* Navigation info */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border shadow-sm text-sm text-gray-600">
        <div className="font-medium mb-1">Navigation:</div>
        <div className="space-y-1 text-xs">
          <div>• Two-finger scroll: Pan</div>
          <div>• Space + drag: Pan</div>
          <div>• Cmd/Ctrl + scroll: Zoom to cursor</div>
          <div>• 1: Reset zoom (Shift+1: Fit to screen)</div>
          <div>• Cmd/Ctrl +/-: Zoom in/out</div>
        </div>
      </div>

      {/* Zoom level display */}
      <div className="absolute bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-sm font-mono">
        {Math.round(transform.k * 100)}%
      </div>
    </div>
  );
};
