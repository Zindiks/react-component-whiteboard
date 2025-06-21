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

  // Zoom indicator state
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const [isActivelyZooming, setIsActivelyZooming] = useState(false);
  const zoomIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousZoomScale = useRef<number>(1);

  // Overview/Minimap state
  const [showOverview, setShowOverview] = useState(false);
  const overviewRef = useRef<HTMLDivElement>(null);

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
    }, 800);
  }, []);

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
      .scaleExtent([0.1, 7]) // Min 10%, Max 700%
      .filter((event) => {
        // Prevent zoom during marquee selection or component dragging
        if (isMarqueeActive) return false;

        // Disable wheel events for D3 zoom - we handle these globally now
        if (event.type === "wheel") {
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
      // Only handle zoom gestures (Ctrl/Cmd + wheel or pinch) and only when inside our container
      if ((event.ctrlKey || event.metaKey) && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const isInsideContainer =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

        if (!isInsideContainer) return; // Don't handle zoom outside our container

        event.preventDefault();
        event.stopPropagation();

        // Calculate zoom center point relative to the container
        const centerX = event.clientX - rect.left;
        const centerY = event.clientY - rect.top;

        // Determine zoom direction and factor
        const zoomIntensity = 0.007;
        const delta = -event.deltaY * zoomIntensity;
        const scaleFactor = Math.exp(delta);

        // Calculate new scale with limits
        const currentScale = transform.k;
        const newScale = Math.max(0.1, Math.min(7, currentScale * scaleFactor));

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
    };

    // Touch handlers for pinch-to-zoom
    let globalTouchStartDistance = 0;
    let globalTouchStartTransform = transform;
    let globalTouchCenter = { x: 0, y: 0 };

    const handleGlobalTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2 && containerRef.current) {
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
        event.touches.length === 2 &&
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
          0.1,
          Math.min(7, globalTouchStartTransform.k * scale)
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
      if (event.touches.length < 2) {
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
      } else if (event.key === "3" || event.key === "o" || event.key === "O") {
        event.preventDefault();
        setShowOverview(!showOverview);
      } else if (event.key === "Escape") {
        // Close overview if open
        if (showOverview) {
          setShowOverview(false);
        }
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
    window.addEventListener("contextmenu", handleContextMenu);

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
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [
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
    showZoomIndicatorTemporarily,
    showOverview,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (zoomIndicatorTimeoutRef.current) {
        clearTimeout(zoomIndicatorTimeoutRef.current);
      }
    };
  }, []);

  const handleDragStart = (id: number) => {
    // Bring the component to the front when starting to drag
    bringToFront(id);

    if (selectedComponents.length > 1 && selectedComponents.includes(id)) {
      // Multiple selected components: dragging one moves all selected
      const positions = selectedComponents.map((selectedId) => {
        const component = components.find((c) => c.id === selectedId);
        return { id: selectedId, x: component?.x || 0, y: component?.y || 0 };
      });
      setInitialPositions(positions);
    } else {
      // Single component drag - store initial position and select it
      const component = components.find((c) => c.id === id);
      if (component) {
        setInitialPositions([{ id, x: component.x, y: component.y }]);
        setSelectedComponents([id]);
      }
    }
  };

  const handleDrag = useCallback(
    (id: number, deltaX: number, deltaY: number) => {
      if (selectedComponents.length > 1 && selectedComponents.includes(id)) {
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
    [selectedComponents, initialPositions]
  );

  const handleSelect = useCallback((id: number) => {
    // Toggle selection for the component
    setSelectedComponents((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleZoom = useCallback((factor: number) => {
    if (!svgRef.current || !zoomBehavior.current) return;
    const svg = d3.select(svgRef.current);
    zoomBehavior.current.scaleBy(svg, factor);
    // Don't show indicator for manual button clicks
  }, []);

  const addNewComponent = (type: string, x?: number, y?: number) => {
    const newId = Math.max(...components.map((c) => c.id)) + 1;
    const highestZIndex = Math.max(...components.map((c) => c.zIndex || 0), 0);

    console.log(`Adding new ${type} component with ID: ${newId}`);
    setComponents((prev) => [
      ...prev,
      {
        id: newId,
        x: x ?? 200 + Math.random() * 200,
        y: y ?? 200 + Math.random() * 200,
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

  // Overview/Minimap functionality
  const getWhiteboardBounds = useCallback(() => {
    if (components.length === 0) {
      return { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };
    }

    const padding = 200;
    const bounds = components.reduce(
      (acc, comp) => ({
        minX: Math.min(acc.minX, comp.x),
        minY: Math.min(acc.minY, comp.y),
        maxX: Math.max(acc.maxX, comp.x + (comp.width || 200)),
        maxY: Math.max(acc.maxY, comp.y + (comp.height || 200)),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    return {
      minX: bounds.minX - padding,
      minY: bounds.minY - padding,
      maxX: bounds.maxX + padding,
      maxY: bounds.maxY + padding,
    };
  }, [components]);

  const navigateToComponent = useCallback((component: Component) => {
    if (!svgRef.current || !zoomBehavior.current) return;

    const svg = d3.select(svgRef.current);
    const targetX = component.x + (component.width || 200) / 2;
    const targetY = component.y + (component.height || 200) / 2;

    svg
      .transition()
      .duration(750)
      .call(
        zoomBehavior.current.transform,
        d3.zoomIdentity
          .translate(window.innerWidth / 2, window.innerHeight / 2)
          .scale(1)
          .translate(-targetX, -targetY)
      );

    setShowOverview(false);
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

      {/* Zoom indicator overlay */}
      {showZoomIndicator && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "500",
            fontFamily: "monospace",
            pointerEvents: "none",
            zIndex: 10000,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            animation: isActivelyZooming
              ? "zoomFadeIn 0.2s ease-out"
              : "zoomFadeOut 0.3s ease-in",
          }}
        >
          {Math.round(transform.k * 100)}%
        </div>
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
              zIndex={component.zIndex || 0}
            />
          ))}
      </div>
      <ControlPanel
        onZoom={handleZoom}
        selectedComponents={selectedComponents}
      />
      <Shelf onAddComponent={addNewComponent} transform={transform} />

      {/* Overview/Minimap overlay */}
      {showOverview && (
        <div
          ref={overviewRef}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            border: "1px solid #e2e8f0",
            zIndex: 10001,
            maxWidth: "80vw",
            maxHeight: "80vh",
            overflow: "hidden",
          }}
        >
          <Overview
            components={components}
            selectedComponents={selectedComponents}
            transform={transform}
            onNavigateToComponent={navigateToComponent}
            onClose={() => setShowOverview(false)}
            getWhiteboardBounds={getWhiteboardBounds}
          />
        </div>
      )}
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
  zIndex,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

  // Header-specific mouse down handler for dragging
  const handleHeaderMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!selected) {
      // Clicking an unselected component selects it
      onSelect(id);
    } else {
      // Clicking a selected component starts dragging all selected
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
  selectedComponents: number[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onZoom,
  selectedComponents,
}) => {
  return (
    <div
      data-control-panel
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
        Mode: Selection
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
          selection), 3/O (overview)
        </p>
        <p className="text-xs text-blue-600 mt-1">
          <strong>Mac Trackpad:</strong> 2-finger scroll = pan, pinch = zoom
        </p>
        <p className="text-xs text-green-600 mt-1">
          <strong>Overview:</strong> Press 3 or O for bird's eye view
        </p>
      </div>
    </div>
  );
};

interface ShelfProps {
  onAddComponent: (type: string, x: number, y: number) => void;
  transform: d3.ZoomTransform;
}

interface ComponentDefinition {
  type: string;
  label: string;
  icon: string;
  description: string;
}

interface Category {
  name: string;
  icon: string;
  components: ComponentDefinition[];
}

const COMPONENT_CATEGORIES: Category[] = [
  {
    name: "Utilities",
    icon: "⚙️",
    components: [
      {
        type: "timer",
        label: "Timer",
        icon: "⏰",
        description: "Countdown timer",
      },
      {
        type: "watch",
        label: "Watch",
        icon: "⌚",
        description: "Digital clock",
      },
      {
        type: "note",
        label: "Note",
        icon: "📝",
        description: "Markdown text editor",
      },
      {
        type: "confetti",
        label: "Confetti",
        icon: "🎉",
        description: "Celebration button",
      },
    ],
  },
  {
    name: "Data & Finance",
    icon: "📊",
    components: [
      {
        type: "weather",
        label: "Weather",
        icon: "🌤️",
        description: "Weather widget",
      },
      {
        type: "bitcoin",
        label: "Crypto Chart",
        icon: "💰",
        description: "Cryptocurrency prices",
      },
      {
        type: "currency",
        label: "Currency",
        icon: "💱",
        description: "Currency converter",
      },
    ],
  },
  {
    name: "Media",
    icon: "🎵",
    components: [
      {
        type: "youtubeVideo",
        label: "YouTube",
        icon: "🎬",
        description: "YouTube video player",
      },
      {
        type: "soundcloud",
        label: "SoundCloud",
        icon: "🔊",
        description: "SoundCloud track",
      },
      {
        type: "spotify",
        label: "Spotify",
        icon: "🎵",
        description: "Spotify player",
      },
      {
        type: "scrollingtext",
        label: "Scrolling Text",
        icon: "📣",
        description: "Animated text banner",
      },
    ],
  },
  {
    name: "Flow & Diagram",
    icon: "🔄",
    components: [
      {
        type: "flowCanvas",
        label: "Flow Canvas",
        icon: "🔄",
        description: "Flow diagram canvas",
      },
      {
        type: "flowNodeStart",
        label: "Start Node",
        icon: "▶️",
        description: "Flow start node",
      },
      {
        type: "flowNodeProcess",
        label: "Process Node",
        icon: "⚡",
        description: "Flow process node",
      },
      {
        type: "flowNodeDecision",
        label: "Decision Node",
        icon: "❓",
        description: "Flow decision node",
      },
      {
        type: "flowNodeEnd",
        label: "End Node",
        icon: "🏁",
        description: "Flow end node",
      },
    ],
  },
  {
    name: "Links & Web",
    icon: "🌐",
    components: [
      {
        type: "stylishlink",
        label: "Stylish Link",
        icon: "🔗",
        description: "Styled web link",
      },
    ],
  },
];

const DraggableComponentItem: React.FC<{
  component: ComponentDefinition;
  onDragStart: (type: string, event: React.DragEvent) => void;
}> = ({ component, onDragStart }) => {
  const handleDragStart = (event: React.DragEvent) => {
    onDragStart(component.type, event);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-center gap-2 p-2 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-colors"
      title={component.description}
    >
      <span className="text-lg">{component.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {component.label}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {component.description}
        </p>
      </div>
    </div>
  );
};

const CategorySection: React.FC<{
  category: Category;
  onDragStart: (type: string, event: React.DragEvent) => void;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ category, onDragStart, isExpanded, onToggle }) => {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{category.icon}</span>
          <span className="text-sm font-medium text-gray-700">
            {category.name}
          </span>
          <span className="text-xs text-gray-400">
            ({category.components.length})
          </span>
        </div>
        <span
          className={`text-gray-400 transition-transform ${
            isExpanded ? "rotate-90" : ""
          }`}
        >
          ▶
        </span>
      </button>
      {isExpanded && (
        <div className="px-2 pb-2 space-y-1">
          {category.components.map((component) => (
            <DraggableComponentItem
              key={component.type}
              component={component}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Shelf: React.FC<ShelfProps> = ({ onAddComponent, transform }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["Utilities"]) // Start with Utilities expanded
  );
  const [isDragOverBoard, setIsDragOverBoard] = useState(false);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const handleDragStart = (type: string, event: React.DragEvent) => {
    event.dataTransfer.setData("component-type", type);
    event.dataTransfer.effectAllowed = "copy";

    // Create a custom drag image
    const dragElement = document.createElement("div");
    dragElement.innerHTML = `<div style="
      padding: 8px 12px; 
      background: rgba(59, 130, 246, 0.9); 
      color: white; 
      border-radius: 6px; 
      font-size: 12px; 
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    ">+ ${
      COMPONENT_CATEGORIES.flatMap((c) => c.components).find(
        (c) => c.type === type
      )?.label
    }</div>`;
    dragElement.style.position = "absolute";
    dragElement.style.top = "-1000px";
    document.body.appendChild(dragElement);
    event.dataTransfer.setDragImage(dragElement, 0, 0);

    // Clean up drag image after drag starts
    setTimeout(() => {
      document.body.removeChild(dragElement);
    }, 0);
  };

  // Handle drop events on the whiteboard
  React.useEffect(() => {
    const handleDragOver = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes("component-type")) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setIsDragOverBoard(true);
      }
    };

    const handleDragLeave = (event: DragEvent) => {
      // Only hide indicator when leaving the window or entering a child element that doesn't accept drops
      if (
        !event.relatedTarget ||
        !(event.relatedTarget as Element).closest("[data-drop-zone]")
      ) {
        setIsDragOverBoard(false);
      }
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      const componentType = event.dataTransfer?.getData("component-type");
      if (componentType) {
        // Convert screen coordinates to whiteboard coordinates
        const x = (event.clientX - transform.x) / transform.k;
        const y = (event.clientY - transform.y) / transform.k;
        onAddComponent(componentType, x, y);
      }
      setIsDragOverBoard(false);
    };

    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("drop", handleDrop);
    };
  }, [onAddComponent, transform]);

  return (
    <>
      <div
        data-sidebar
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "280px",
          maxHeight: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Components</h3>
          <p className="text-xs text-gray-500 mt-1">
            Drag components to the canvas
          </p>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto">
          {COMPONENT_CATEGORIES.map((category) => (
            <CategorySection
              key={category.name}
              category={category}
              onDragStart={handleDragStart}
              isExpanded={expandedCategories.has(category.name)}
              onToggle={() => toggleCategory(category.name)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <div className="text-xs text-gray-600 space-y-1">
            <p>
              <strong>Usage:</strong>
            </p>
            <p>• Drag components to canvas</p>
            <p>• Delete: Select + Delete key</p>
            <p>• Multi-select: Marquee or Ctrl+click</p>
            <p>
              <strong>Shortcuts:</strong> 1 (reset), Shift+1 (fit), 2 (zoom
              selection)
            </p>
          </div>
        </div>
      </div>

      {/* Drop indicator overlay */}
      {isDragOverBoard && (
        <div
          data-drop-zone
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            border: "2px dashed #3b82f6",
            borderRadius: "8px",
            pointerEvents: "none",
            zIndex: 9998,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.9)",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "500",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            Drop to add component
          </div>
        </div>
      )}
    </>
  );
};

interface OverviewProps {
  components: {
    id: number;
    x: number;
    y: number;
    type: string;
    width?: number;
    height?: number;
    zIndex?: number;
  }[];
  selectedComponents: number[];
  transform: d3.ZoomTransform;
  onNavigateToComponent: (component: {
    id: number;
    x: number;
    y: number;
    type: string;
    width?: number;
    height?: number;
    zIndex?: number;
  }) => void;
  onClose: () => void;
  getWhiteboardBounds: () => {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

const Overview: React.FC<OverviewProps> = ({
  components,
  selectedComponents,
  transform,
  onNavigateToComponent,
  onClose,
  getWhiteboardBounds,
}) => {
  const bounds = getWhiteboardBounds();
  const boundsWidth = bounds.maxX - bounds.minX;
  const boundsHeight = bounds.maxY - bounds.minY;

  // Calculate overview dimensions
  const maxOverviewWidth = 600;
  const maxOverviewHeight = 400;
  const aspectRatio = boundsWidth / boundsHeight;

  let overviewWidth = maxOverviewWidth;
  let overviewHeight = maxOverviewWidth / aspectRatio;

  if (overviewHeight > maxOverviewHeight) {
    overviewHeight = maxOverviewHeight;
    overviewWidth = maxOverviewHeight * aspectRatio;
  }

  const scale = overviewWidth / boundsWidth;

  // Calculate current viewport rectangle in overview coordinates
  const viewportLeft = (-transform.x / transform.k - bounds.minX) * scale;
  const viewportTop = (-transform.y / transform.k - bounds.minY) * scale;
  const viewportWidth = (window.innerWidth / transform.k) * scale;
  const viewportHeight = (window.innerHeight / transform.k) * scale;

  const getComponentColor = (type: string) => {
    switch (type) {
      case "timer":
        return "#f59e0b";
      case "weather":
        return "#06b6d4";
      case "bitcoin":
        return "#f97316";
      case "currency":
        return "#10b981";
      case "note":
        return "#8b5cf6";
      case "confetti":
        return "#ec4899";
      case "watch":
        return "#6366f1";
      case "scrollingtext":
        return "#14b8a6";
      case "youtubeVideo":
        return "#ef4444";
      case "soundcloud":
        return "#f97316";
      case "spotify":
        return "#22c55e";
      case "stylishlink":
        return "#3b82f6";
      case "flowCanvas":
        return "#64748b";
      case "flowNodeStart":
        return "#10b981";
      case "flowNodeProcess":
        return "#3b82f6";
      case "flowNodeDecision":
        return "#f59e0b";
      case "flowNodeEnd":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Whiteboard Overview
          </h3>
          <p className="text-sm text-gray-500">
            {components.length} components • Click to navigate
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close overview"
        >
          ✕
        </button>
      </div>

      {/* Overview Canvas */}
      <div className="p-4">
        <div
          className="relative border border-gray-300 rounded-lg overflow-hidden"
          style={{
            width: `${overviewWidth}px`,
            height: `${overviewHeight}px`,
            backgroundColor: "#f8fafc",
          }}
        >
          {/* Grid pattern */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern
                id="overview-grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#overview-grid)" />
          </svg>

          {/* Current viewport indicator */}
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
            style={{
              left: `${Math.max(0, viewportLeft)}px`,
              top: `${Math.max(0, viewportTop)}px`,
              width: `${Math.min(
                overviewWidth - Math.max(0, viewportLeft),
                viewportWidth
              )}px`,
              height: `${Math.min(
                overviewHeight - Math.max(0, viewportTop),
                viewportHeight
              )}px`,
            }}
          />

          {/* Components */}
          {components.map((component) => {
            const x = (component.x - bounds.minX) * scale;
            const y = (component.y - bounds.minY) * scale;
            const width = (component.width || 200) * scale;
            const height = (component.height || 200) * scale;
            const isSelected = selectedComponents.includes(component.id);

            return (
              <div
                key={component.id}
                className={`absolute cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10 ${
                  isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
                }`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${Math.max(4, width)}px`,
                  height: `${Math.max(4, height)}px`,
                  backgroundColor: getComponentColor(component.type),
                  borderRadius: "2px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                onClick={() => onNavigateToComponent(component)}
                title={`${component.type} (ID: ${component.id})`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded border"></div>
            <span>Current View</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 ring-2 ring-blue-500 rounded border"></div>
            <span>Selected</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-4 grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-800">
              {components.length}
            </div>
            <div className="text-gray-500">Components</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-800">
              {selectedComponents.length}
            </div>
            <div className="text-gray-500">Selected</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-800">
              {Math.round(transform.k * 100)}%
            </div>
            <div className="text-gray-500">Zoom</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-3 text-xs text-gray-600 space-y-1">
          <p>
            <strong>Navigation:</strong>
          </p>
          <p>• Click any component to navigate to it</p>
          <p>
            • Press <kbd className="px-1 py-0.5 bg-gray-200 rounded">3</kbd> or{" "}
            <kbd className="px-1 py-0.5 bg-gray-200 rounded">O</kbd> to toggle
            overview
          </p>
          <p>
            • Press{" "}
            <kbd className="px-1 py-0.5 bg-gray-200 rounded">Escape</kbd> to
            close
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomGrid;
