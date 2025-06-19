import React, { useRef, useEffect, useCallback } from "react";
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

  const {
    transform,
    setTransform,
    gridSize,
    gridVisible,
    components,
    selectedComponents,
    selectComponent,
    clearSelection,
    moveComponents,
    isDragging,
    setDragging,
  } = useWhiteboardStore();

  // Initialize D3 zoom behavior and grid
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;

    // Set SVG dimensions
    svg
      .attr("width", container.clientWidth)
      .attr("height", container.clientHeight);

    // Create zoom behavior
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on("zoom", (event) => {
        if (!isDragging) {
          setTransform({
            x: event.transform.x,
            y: event.transform.y,
            k: event.transform.k,
          });
        }
      });

    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);

    // Click to deselect
    svg.on("click", (event) => {
      if (event.target === svg.node()) {
        clearSelection();
      }
    });

    // Handle window resize
    const handleResize = () => {
      svg
        .attr("width", container.clientWidth)
        .attr("height", container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isDragging, setTransform, clearSelection]);

  // Update D3 transform when store transform changes
  useEffect(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;

    const svg = d3.select(svgRef.current);
    const newTransform = d3.zoomIdentity
      .translate(transform.x, transform.y)
      .scale(transform.k);

    svg.call(zoomBehaviorRef.current.transform, newTransform);
  }, [transform]);

  // Render grid pattern
  const renderGrid = useCallback(() => {
    if (!svgRef.current || !gridVisible) return null;

    const svg = d3.select(svgRef.current);

    // Remove existing grid
    svg.select(".grid").remove();

    const gridGroup = svg.append("g").attr("class", "grid");

    const { width, height } = svgRef.current.getBoundingClientRect();
    const scaledGridSize = gridSize * transform.k;

    // Calculate visible area
    const startX = Math.floor(-transform.x / scaledGridSize) * scaledGridSize;
    const startY = Math.floor(-transform.y / scaledGridSize) * scaledGridSize;
    const endX = startX + width + scaledGridSize;
    const endY = startY + height + scaledGridSize;

    // Draw vertical lines
    for (let x = startX; x <= endX; x += scaledGridSize) {
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
    for (let y = startY; y <= endY; y += scaledGridSize) {
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
  }, [gridVisible, gridSize, transform]);

  // Re-render grid when transform changes
  useEffect(() => {
    renderGrid();
  }, [renderGrid]);

  // Handle drag and drop from sidebar
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();

    const componentType = event.dataTransfer.getData("text/plain");
    if (!componentType) return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Convert screen coordinates to canvas coordinates
    const x = (event.clientX - rect.left - transform.x) / transform.k;
    const y = (event.clientY - rect.top - transform.y) / transform.k;

    // Snap to grid
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;

    onDrop(componentType, snappedX, snappedY);
  };

  // Handle component selection
  const handleComponentClick = (
    event: React.MouseEvent,
    componentId: string
  ) => {
    event.stopPropagation();
    const multiSelect = event.metaKey || event.ctrlKey;
    selectComponent(componentId, multiSelect);
  };

  // Handle component dragging
  const handleComponentMouseDown = (
    event: React.MouseEvent,
    componentId: string
  ) => {
    event.preventDefault();

    if (!selectedComponents.includes(componentId)) {
      selectComponent(componentId);
    }

    const startX = event.clientX;
    const startY = event.clientY;

    setDragging(true, { x: startX, y: startY });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startX) / transform.k;
      const deltaY = (moveEvent.clientY - startY) / transform.k;

      const componentsToMove = selectedComponents.includes(componentId)
        ? selectedComponents
        : [componentId];

      moveComponents(componentsToMove, deltaX, deltaY, true);
    };

    const handleMouseUp = () => {
      setDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-white"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      />

      {/* Render components */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
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
              className={`absolute pointer-events-auto cursor-move ${
                isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
              }`}
              style={{
                left: component.x,
                top: component.y,
                zIndex: component.zIndex || 0,
              }}
              onClick={(e) => handleComponentClick(e, component.id)}
              onMouseDown={(e) => handleComponentMouseDown(e, component.id)}
            >
              <Component
                {...(component.props || componentConfig.defaultProps)}
              />
            </div>
          );
        })}
      </div>

      {/* Grid size indicator */}
      {gridVisible && (
        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-600 border">
          Grid: {gridSize}px
        </div>
      )}
    </div>
  );
};

export default WhiteboardCanvas;
