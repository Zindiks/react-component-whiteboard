import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { Plus, Minus } from "lucide-react";
import { Button } from "./components/ui/button";
import { Timer } from "./components/Timer";
import { Weather } from "./components/Weather";
import { BitcoinChart } from "./components/BitcoinChart";
import { CurrencyConverter } from "./components/CurrencyConverter";
import { TextNote } from "./components/TextNote";
import { ConfettiButton } from "./components/ConfettiButton";
import { Watch } from "./components/Watch";
import { ScrollingText } from "./components/ScrollingText";
import { YouTubeVideo } from "./components/YouTubeVideo";
import { SoundCloudWidget } from "./components/SoundCloudWidget";
import { SpotifyWidget } from "./components/SpotifyWidget";
import { StylishLink } from "./components/StylishLink";
import { FlowCanvas } from "./components/FlowCanvas";
import { FlowNode } from "./components/FlowNode";

const CustomGrid = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);

  // Marquee selection state
  const [isMarqueeActive, setIsMarqueeActive] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState({ x: 0, y: 0 });
  const [marqueeEnd, setMarqueeEnd] = useState({ x: 0, y: 0 });

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  interface Component {
    id: number;
    x: number;
    y: number;
    type: string;
    width?: number;
    height?: number;
    zIndex?: number;
  }

  const [components, setComponents] = useState<Component[]>([
    { id: 1, x: 100, y: 100, type: "timer", zIndex: 1 },
    { id: 2, x: 300, y: 200, type: "weather", zIndex: 2 },
    { id: 3, x: 600, y: 100, type: "bitcoin", zIndex: 3 },
    { id: 4, x: 100, y: 400, type: "currency", zIndex: 4 },
    { id: 5, x: 400, y: 400, type: "confetti", zIndex: 5 },
    { id: 6, x: 700, y: 400, type: "note", zIndex: 6 },
    { id: 7, x: 1000, y: 100, type: "watch", zIndex: 7 },
    { id: 8, x: 1000, y: 400, type: "scrollingtext", zIndex: 8 },
    { id: 9, x: 500, y: 200, type: "youtubeVideo", zIndex: 9 },
    { id: 10, x: 800, y: 200, type: "soundcloud", zIndex: 10 },
    { id: 11, x: 300, y: 600, type: "spotify", zIndex: 11 },
    { id: 12, x: 600, y: 600, type: "stylishlink", zIndex: 12 },
    {
      id: 13,
      x: 800,
      y: 600,
      type: "flowCanvas",
      width: 600,
      height: 300,
      zIndex: 13,
    },
    // Flow nodes for demonstration
    { id: 14, x: 1400, y: 100, type: "flowNodeStart", zIndex: 14 },
    { id: 15, x: 1550, y: 100, type: "flowNodeProcess", zIndex: 15 },
    { id: 16, x: 1700, y: 100, type: "flowNodeDecision", zIndex: 16 },
    { id: 17, x: 1850, y: 100, type: "flowNodeEnd", zIndex: 17 },
  ]);
  const [selectedComponents, setSelectedComponents] = useState<number[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [initialPositions, setInitialPositions] = useState<
    { id: number; x: number; y: number }[]
  >([]);

  const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(
    null
  );

  const handleDeleteComponent = useCallback((id: number) => {
    console.log(`Deleting component with ID: ${id}`);
    setComponents((prev) => prev.filter((component) => component.id !== id));
    setSelectedComponents((prev) =>
      prev.filter((selectedId) => selectedId !== id)
    );
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedComponents.length > 0) {
      setComponents((prev) =>
        prev.filter((component) => !selectedComponents.includes(component.id))
      );
      setSelectedComponents([]);
    }
  }, [selectedComponents]);

  // Enhanced pan and zoom utilities
  const getEventCoordinates = (event: MouseEvent | React.MouseEvent) => ({
    x: event.clientX,
    y: event.clientY,
  });

  const applyTransform = (newTransform: d3.ZoomTransform) => {
    if (!svgRef.current || !zoomBehavior.current) return;
    const svg = d3.select(svgRef.current);
    svg.call(zoomBehavior.current.transform, newTransform);
  };

  const resetZoom = useCallback(() => {
    if (!svgRef.current || !zoomBehavior.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(750)
      .call(zoomBehavior.current.transform, d3.zoomIdentity);
  }, []);

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
      2 // Max zoom level
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
  }, [components]);

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
      2 // Max zoom level
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
  }, [components, selectedComponents]);

  // Marquee selection utilities
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

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.attr("width", window.innerWidth).attr("height", window.innerHeight);

    // Enhanced zoom behavior with better filtering for Mac trackpad
    zoomBehavior.current = d3
      .zoom<SVGSVGElement, unknown>()
      .filter((event) => {
        // Prevent zoom during marquee selection or component dragging
        if (isMarqueeActive) return false;

        // Handle wheel events (mouse wheel and trackpad)
        if (event.type === "wheel") {
          // Mac trackpad pinch-to-zoom detection:
          // - ctrlKey is automatically set by browser for pinch gestures
          // - Small deltaY values with ctrlKey indicate pinch
          // - Large deltaY without ctrlKey is typically scroll
          if (event.ctrlKey || event.metaKey) {
            // This is a zoom gesture (pinch or Ctrl+scroll)
            return true;
          }
          // Regular scroll without modifiers should not trigger zoom
          return false;
        }

        // Allow middle mouse button for pan
        if (event.type === "mousedown" && event.button === 1) {
          return true;
        }

        // Allow right mouse button for pan
        if (event.type === "mousedown" && event.button === 2) {
          return true;
        }

        // Allow pan with space + left click
        if (
          event.type === "mousedown" &&
          event.button === 0 &&
          isSpacePressed
        ) {
          return true;
        }

        return false;
      })
      .on("zoom", (event) => {
        if (!isMultiSelectMode && !isMarqueeActive) {
          setTransform(event.transform);
        }
      });

    svg.call(zoomBehavior.current);

    // Enhanced keyboard event handling
    const handleKeyDown = (event: KeyboardEvent) => {
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
      } else if (event.key === "h" || event.key === "H") {
        setIsMultiSelectMode((prev) => !prev);
        setSelectedComponents([]); // Reset selection when mode changes
      } else if (event.key === "Delete" || event.key === "Backspace") {
        handleDeleteSelected();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === " ") {
        setIsSpacePressed(false);
      }
    };

    // Mouse event handlers for marquee selection and panning
    const handleMouseDown = (event: MouseEvent) => {
      const coords = getEventCoordinates(event);

      // Check if we clicked on a component (prevent marquee when clicking components)
      const target = event.target as HTMLElement;
      const isComponentClick = target.closest("[data-component]") !== null;

      if (event.button === 0 && !isSpacePressed && !isComponentClick) {
        // Left click without space on empty area - start marquee selection
        setIsMarqueeActive(true);
        setMarqueeStart(coords);
        setMarqueeEnd(coords);
      } else if (
        event.button === 1 ||
        event.button === 2 ||
        (event.button === 0 && isSpacePressed)
      ) {
        // Middle, right, or space+left click - start panning
        setIsPanning(true);
        setLastPanPoint(coords);
        event.preventDefault();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
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
    };

    const handleMouseUp = (event: MouseEvent) => {
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
    };

    // Enhanced trackpad gesture handling for Mac
    const handleWheel = (event: WheelEvent) => {
      // Distinguish between trackpad scroll and pinch gestures
      if (event.ctrlKey || event.metaKey) {
        // This is a pinch-to-zoom gesture (browser sets ctrlKey automatically)
        // Let D3 zoom behavior handle this
        return;
      }

      // This is a two-finger scroll gesture - use for panning
      event.preventDefault();

      // Apply momentum-based scaling for natural feel
      const deltaX = -event.deltaX * 0.5; // Reduce sensitivity and invert direction
      const deltaY = -event.deltaY * 0.5;

      const newTransform = transform.translate(
        deltaX / transform.k,
        deltaY / transform.k
      );
      applyTransform(newTransform);
    };

    // Enhanced touch handling for mobile devices
    let touchStartDistance = 0;
    let touchStartTransform = transform;
    let touchCenter = { x: 0, y: 0 };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        // Single finger - start panning
        const touch = event.touches[0];
        setIsPanning(true);
        setLastPanPoint({ x: touch.clientX, y: touch.clientY });
      } else if (event.touches.length === 2) {
        // Two fingers - prepare for pinch zoom
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        touchStartDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        touchCenter = {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2,
        };
        touchStartTransform = transform;
        setIsPanning(false); // Stop panning when second finger is added
        event.preventDefault(); // Prevent default pinch behavior
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1 && isPanning) {
        // Single finger pan
        const touch = event.touches[0];
        const coords = { x: touch.clientX, y: touch.clientY };
        const deltaX = coords.x - lastPanPoint.x;
        const deltaY = coords.y - lastPanPoint.y;

        const newTransform = transform.translate(
          deltaX / transform.k,
          deltaY / transform.k
        );
        applyTransform(newTransform);
        setLastPanPoint(coords);
        event.preventDefault();
      } else if (event.touches.length === 2) {
        // Two finger pinch zoom
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        if (touchStartDistance > 0) {
          const scale = currentDistance / touchStartDistance;
          const newScale = Math.max(
            0.1,
            Math.min(5, touchStartTransform.k * scale)
          ); // Limit zoom range

          // Calculate the center point in transform space
          const centerInTransformSpace = {
            x: (touchCenter.x - touchStartTransform.x) / touchStartTransform.k,
            y: (touchCenter.y - touchStartTransform.y) / touchStartTransform.k,
          };

          // Apply zoom centered on pinch center
          const newTransform = d3.zoomIdentity
            .translate(touchCenter.x, touchCenter.y)
            .scale(newScale)
            .translate(-centerInTransformSpace.x, -centerInTransformSpace.y);

          applyTransform(newTransform);
        }
        event.preventDefault();
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (event.touches.length === 0) {
        setIsPanning(false);
        touchStartDistance = 0;
      } else if (event.touches.length === 1) {
        // Transition back to single finger pan
        const touch = event.touches[0];
        setLastPanPoint({ x: touch.clientX, y: touch.clientY });
        setIsPanning(true);
      }
    };

    // Context menu prevention for right-click pan
    const handleContextMenu = (event: MouseEvent) => {
      if (event.button === 2) {
        event.preventDefault();
      }
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      svg.selectAll("*").remove();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    isMultiSelectMode,
    handleDeleteSelected,
    isMarqueeActive,
    isPanning,
    isSpacePressed,
    lastPanPoint,
    marqueeStart,
    marqueeEnd,
    transform,
    getComponentsInMarquee,
    resetZoom,
    zoomToFit,
    zoomToSelection,
  ]);

  const handleDragStart = (id: number) => {
    // Bring the component to the front when starting to drag
    bringToFront(id);

    if (isMultiSelectMode && selectedComponents.includes(id)) {
      // Multi-select mode: dragging a selected component moves all selected components
      const positions = selectedComponents.map((selectedId) => {
        const component = components.find((c) => c.id === selectedId);
        return { id: selectedId, x: component?.x || 0, y: component?.y || 0 };
      });
      setInitialPositions(positions);
    } else if (
      selectedComponents.length > 1 &&
      selectedComponents.includes(id)
    ) {
      // Not in multi-select mode, but we have multiple selected components and clicked on one of them
      // Move all selected components
      const positions = selectedComponents.map((selectedId) => {
        const component = components.find((c) => c.id === selectedId);
        return { id: selectedId, x: component?.x || 0, y: component?.y || 0 };
      });
      setInitialPositions(positions);
    } else {
      // Single component drag - store initial position
      const component = components.find((c) => c.id === id);
      if (component) {
        setInitialPositions([{ id, x: component.x, y: component.y }]);
        // If not in multi-select mode, clear other selections when dragging a single component
        if (!isMultiSelectMode) {
          setSelectedComponents([id]);
        }
      }
    }
  };

  const handleDrag = useCallback(
    (id: number, deltaX: number, deltaY: number) => {
      if (
        (isMultiSelectMode && selectedComponents.includes(id)) ||
        (selectedComponents.length > 1 && selectedComponents.includes(id))
      ) {
        // Moving multiple selected components
        setComponents((prevComponents) =>
          prevComponents.map((component) => {
            const initialPos = initialPositions.find(
              (pos) => pos.id === component.id
            );
            if (initialPos && selectedComponents.includes(component.id)) {
              return {
                ...component,
                x: initialPos.x + deltaX,
                y: initialPos.y + deltaY,
              };
            }
            return component;
          })
        );
      } else {
        // Single component drag
        const initialPos = initialPositions.find((pos) => pos.id === id);
        if (initialPos) {
          setComponents((prevComponents) =>
            prevComponents.map((component) =>
              component.id === id
                ? {
                    ...component,
                    x: initialPos.x + deltaX,
                    y: initialPos.y + deltaY,
                  }
                : component
            )
          );
        }
      }
    },
    [isMultiSelectMode, selectedComponents, initialPositions]
  );

  const handleSelect = useCallback(
    (id: number) => {
      if (isMultiSelectMode) {
        setSelectedComponents((prev) =>
          prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
      }
    },
    [isMultiSelectMode]
  );

  const handleZoom = useCallback((factor: number) => {
    if (!svgRef.current || !zoomBehavior.current) return;
    const svg = d3.select(svgRef.current);
    zoomBehavior.current.scaleBy(svg, factor);
  }, []);

  const addNewComponent = (type: string) => {
    const newId = Math.max(...components.map((c) => c.id)) + 1;
    const highestZIndex = Math.max(...components.map((c) => c.zIndex || 0), 0);

    console.log(`Adding new ${type} component with ID: ${newId}`);
    setComponents((prev) => [
      ...prev,
      {
        id: newId,
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 200,
        type,
        zIndex: highestZIndex + 1, // Place new component on top
      },
    ]);
  };

  const bringToFront = useCallback((id: number) => {
    setComponents((prevComponents) => {
      const highestZIndex = Math.max(
        ...prevComponents.map((comp) => comp.zIndex || 0),
        0
      );
      return prevComponents.map((component) =>
        component.id === id
          ? { ...component, zIndex: highestZIndex + 1 }
          : component
      );
    });
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <svg ref={svgRef}></svg>

      {/* Marquee selection overlay */}
      {isMarqueeActive && (
        <div
          style={{
            position: "absolute",
            left: `${Math.min(marqueeStart.x, marqueeEnd.x)}px`,
            top: `${Math.min(marqueeStart.y, marqueeEnd.y)}px`,
            width: `${Math.abs(marqueeEnd.x - marqueeStart.x)}px`,
            height: `${Math.abs(marqueeEnd.y - marqueeStart.y)}px`,
            border: "2px dashed #3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
          pointerEvents: "none",
        }}
      >
        {/* Sort components by z-index before rendering */}
        {[...components]
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
          .map((component) => (
            <DraggableComponent
              key={component.id}
              x={component.x}
              y={component.y}
              id={component.id}
              type={component.type}
              onDrag={handleDrag}
              onDragStart={handleDragStart}
              onSelect={handleSelect}
              onDelete={handleDeleteComponent}
              selected={selectedComponents.includes(component.id)}
              transform={transform}
              isMultiSelectMode={isMultiSelectMode}
              zIndex={component.zIndex || 0}
            />
          ))}
      </div>
      <ControlPanel
        onZoom={handleZoom}
        isMultiSelectMode={isMultiSelectMode}
        selectedComponents={selectedComponents}
      />
      <Shelf onAddComponent={addNewComponent} />
    </div>
  );
};

interface DraggableComponentProps {
  x: number;
  y: number;
  id: number;
  type: string;
  onDrag: (id: number, deltaX: number, deltaY: number) => void;
  onDragStart: (id: number) => void;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  selected: boolean;
  transform: d3.ZoomTransform;
  zIndex?: number;
  isMultiSelectMode: boolean;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  x,
  y,
  id,
  type,
  onDrag,
  onDragStart,
  onSelect,
  onDelete,
  selected,
  transform,
  isMultiSelectMode,
  zIndex,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

  // Header-specific mouse down handler for dragging
  const handleHeaderMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (isMultiSelectMode && !selected) {
      // In multi-select mode, clicking an unselected component selects it
      onSelect(id);
    } else if (isMultiSelectMode && selected) {
      // In multi-select mode, clicking a selected component starts dragging all selected
      setIsDragging(true);
      const mousePos = { x: event.clientX, y: event.clientY };
      setDragStartPos(mousePos);
      onDragStart(id);
    } else {
      // Normal mode - start dragging this component
      setIsDragging(true);
      const mousePos = { x: event.clientX, y: event.clientY };
      setDragStartPos(mousePos);
      onDragStart(id);
    }
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(id);
  };

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging) return;

      const currentMousePos = { x: event.clientX, y: event.clientY };
      const deltaX = (currentMousePos.x - dragStartPos.x) / transform.k;
      const deltaY = (currentMousePos.y - dragStartPos.y) / transform.k;

      onDrag(id, deltaX, deltaY);
    },
    [isDragging, dragStartPos, transform.k, onDrag, id]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  const renderComponent = () => {
    switch (type) {
      case "timer":
        return (
          <Timer
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "weather":
        return (
          <Weather
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "bitcoin":
        return (
          <BitcoinChart
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "currency":
        return (
          <CurrencyConverter
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "note":
        return (
          <TextNote
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "confetti":
        return (
          <ConfettiButton
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "watch":
        return (
          <Watch
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "scrollingtext":
        return (
          <ScrollingText
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "youtubeVideo":
        return (
          <YouTubeVideo
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "soundcloud":
        return (
          <SoundCloudWidget
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "spotify":
        return (
          <SpotifyWidget
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "stylishlink":
        return (
          <StylishLink
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "flowCanvas":
        return (
          <FlowCanvas
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "flowNodeStart":
        return (
          <FlowNode
            nodeType="start"
            label="Start"
            color="#10b981"
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "flowNodeProcess":
        return (
          <FlowNode
            nodeType="process"
            label="Process"
            color="#3b82f6"
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "flowNodeDecision":
        return (
          <FlowNode
            nodeType="decision"
            label="Decision"
            color="#f59e0b"
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "flowNodeEnd":
        return (
          <FlowNode
            nodeType="end"
            label="End"
            color="#ef4444"
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      default:
        return (
          <div className="w-20 bg-slate-800 rounded-md p-2">
            <p className="text-white text-center">{id}</p>
          </div>
        );
    }
  };

  return (
    <div
      data-component="true"
      className={`absolute pointer-events-auto ${
        selected ? "ring-2 ring-blue-500" : ""
      } group`}
      onWheel={(e) => {
        // Forward wheel events to the SVG to ensure whiteboard zoom works
        // even when hovering over components
        const svgElement = document.querySelector("svg");
        if (svgElement) {
          const wheelEvent = new WheelEvent("wheel", {
            deltaX: e.deltaX,
            deltaY: e.deltaY,
            deltaZ: e.deltaZ,
            deltaMode: e.deltaMode,
            clientX: e.clientX,
            clientY: e.clientY,
            bubbles: true,
            cancelable: true,
          });
          svgElement.dispatchEvent(wheelEvent);
        }
        e.preventDefault(); // Prevent component-specific zoom
      }}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        zIndex: zIndex,
      }}
    >
      {renderComponent()}
    </div>
  );
};

interface ControlPanelProps {
  onZoom: (factor: number) => void;
  isMultiSelectMode: boolean;
  selectedComponents: number[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onZoom,
  isMultiSelectMode,
  selectedComponents,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "10px",
        left: "10px",
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        maxWidth: "250px",
      }}
      className="flex flex-col gap-2"
    >
      <div className="flex gap-2">
        <Button onClick={() => onZoom(1.2)} variant={"ghost"} size="sm">
          <Plus className="w-4 h-4" />
        </Button>
        <Button onClick={() => onZoom(0.8)} variant={"ghost"} size="sm">
          <Minus className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-sm mt-2">
        Mode: {isMultiSelectMode ? "Multi-Select (H)" : "Pan"}
        {selectedComponents.length > 0 && (
          <span className="text-blue-600 ml-2">
            ({selectedComponents.length} selected)
          </span>
        )}
      </p>
      <div className="text-xs text-gray-600 mt-2 space-y-1">
        <p>
          <strong>Pan:</strong> Middle/Right-click drag, Space+drag, 2-finger
          scroll
        </p>
        <p>
          <strong>Zoom:</strong> Ctrl/Cmd+scroll, pinch-to-zoom
        </p>
        <p>
          <strong>Select:</strong> Left-click drag (marquee)
        </p>
        <p>
          <strong>Shortcuts:</strong> 1 (reset), Shift+1 (fit), 2 (zoom
          selection)
        </p>
        <p className="text-xs text-blue-600 mt-1">
          <strong>Mac Trackpad:</strong> 2-finger scroll = pan, pinch = zoom
        </p>
      </div>
    </div>
  );
};

interface ShelfProps {
  onAddComponent: (type: string) => void;
}

const Shelf: React.FC<ShelfProps> = ({ onAddComponent }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        width: "200px",
      }}
      className="flex flex-col gap-2"
    >
      <h3 className="text-sm font-semibold mb-2">Components</h3>
      <Button
        onClick={() => onAddComponent("timer")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        Add Timer
      </Button>
      <Button
        onClick={() => onAddComponent("weather")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        Add Weather
      </Button>
      <Button
        onClick={() => onAddComponent("bitcoin")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        💰 Add Crypto Chart
      </Button>
      <Button
        onClick={() => onAddComponent("currency")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        💱 Add Currency Converter
      </Button>
      <Button
        onClick={() => onAddComponent("note")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        📝 Add Markdown Note
      </Button>
      <Button
        onClick={() => onAddComponent("confetti")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        🎉 Add Confetti Button
      </Button>
      <Button
        onClick={() => onAddComponent("watch")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        ⌚ Add Watch
      </Button>
      <Button
        onClick={() => onAddComponent("scrollingtext")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        📣 Add Scrolling Text
      </Button>
      <Button
        onClick={() => onAddComponent("youtubeVideo")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        🎬 Add YouTube Video
      </Button>
      <Button
        onClick={() => onAddComponent("soundcloud")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        🔊 Add SoundCloud Track
      </Button>
      <Button
        onClick={() => onAddComponent("spotify")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        🎵 Add Spotify Player
      </Button>
      <Button
        onClick={() => onAddComponent("stylishlink")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        🔗 Add Stylish Link
      </Button>
      <Button
        onClick={() => onAddComponent("flowCanvas")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        🔄 Add Flow Connections
      </Button>
      <p className="text-xs text-gray-500 mt-2">
        Press 'H' to toggle multi-select mode
      </p>
      <p className="text-xs text-gray-500">
        Press 'Delete' to remove selected components
      </p>
      <p className="text-xs text-gray-500">
        Drag marquee or click components to select
      </p>
      <p className="text-xs text-gray-500">
        Drag any selected component to move all
      </p>
    </div>
  );
};

export default CustomGrid;
