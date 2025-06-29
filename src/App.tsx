import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import * as d3 from "d3";
import { ComponentFooter } from "./components/ComponentFooter";
import { CategorySidebar } from "./components/CategorySidebar";
import { DraggableComponent } from "./components/DraggableWhiteboardComponent";
import { GridBackground } from "./components/GridBackground";
import { FPSMonitor } from "./components/FPSMonitor";
import { DragPreviewOverlay } from "./components/whiteboard/DragPreviewOverlay";
import { WidgetHeader } from "./components/widgets/WidgetHeader";
import { WidgetFormattingOptions } from "./types/formatting";
import { usePerformance } from "./hooks/usePerformance";
import { COMPONENT_CATEGORIES } from "./constants/componentCategories";
import { Component } from "./types/whiteboard";
import { useWhiteboardState } from "./hooks/useWhiteboardState";
import { useZoomControls } from "./hooks/useZoomControls";
import { usePanControls } from "./hooks/usePanControls";
import {
  LAYOUT_CONSTANTS,
  COMPONENT_SIZES,
  Z_INDEX,
  COLORS,
  ANIMATIONS,
  TYPOGRAPHY,
  PERCENTAGE,
  GRID_CONSTANTS,
} from "./constants/appConstants";
import { useSidebarControls } from "./hooks/useSidebarControls";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useEventHandlers } from "./hooks/useEventHandlers";
import { useComponentCreators } from "./hooks/useComponentCreators";
import { Overview } from "./components/Overview";
import { ControlPanel } from "./components/ControlPanel";
import {
  copySelectedComponents,
  handleComponentPaste,
  handleImagePasteFromClipboard,
  ComponentCreators,
  ComponentState,
  ComponentStateSetters,
} from "./utils/clipboardOperations";
import { ComponentHeader } from "./components/ui/ComponentHeader";
import { Button } from "./components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import {
  X,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

const CustomGrid = () => {
  // Performance optimizations
  const { getGPUStyle } = usePerformance({
    targetFPS: 120,
    enableGPUAcceleration: true,
    batchUpdates: true,
  });

  // Use whiteboard state hook
  const {
    components,
    selectedComponents,
    copiedComponents,
    setComponents,
    setSelectedComponents,
    setCopiedComponents,
    handleDeleteComponent,
    handleDeleteSelected,
    addNewComponent,
    handleResizeComponent,
    handleTextChange,
    handleImageChange,
    handleFormattingChange,
    handleDrag,
    handleSelect,
    handleDragStart,
  } = useWhiteboardState();

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use zoom controls hook
  const {
    transform,
    showZoomIndicator,
    isActivelyZooming,
    setTransform,
    showZoomIndicatorTemporarily,
    applyTransform,
    resetZoom,
    zoomToFit,
    zoomToSelection,
    handleZoom,
    refs: { zoomBehavior, zoomIndicatorTimeoutRef, previousZoomScale },
  } = useZoomControls({
    svgRef,
    components,
    selectedComponents,
  });

  // Mouse position tracking for paste operations
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Drag preview state
  const [dragPreviewData, setDragPreviewData] = useState({
    isVisible: false,
    componentType: null as string | null,
    mousePosition: { x: 0, y: 0 },
  });

  // Grid toggle state
  const [showGrid, setShowGrid] = useState(GRID_CONSTANTS.ENABLED);

  // Grid style state
  // Grid size state
  const [gridSize, setGridSize] = useState<number>(GRID_CONSTANTS.SIZE);

  // Dynamic grid sizing state
  const [dynamicGridSizing, setDynamicGridSizing] = useState<boolean>(
    GRID_CONSTANTS.DYNAMIC_SIZING
  );

  // Snap to grid toggle state
  const [snapToGrid, setSnapToGrid] = useState(true);

  // Overview/Minimap state
  const [showOverview, setShowOverview] = useState(false);
  const overviewRef = useRef<HTMLDivElement>(null);

  // Use sidebar controls hook
  const {
    activeCategory,
    isSidebarOpen,
    setIsDragOverBoard,
    setDragType,
    handleCategoryClick,
    handleCloseSidebar,
    getActiveCategory,
  } = useSidebarControls();

  // Use pan controls hook
  const {
    isSpacePressed,
    isMarqueeActive,
    marqueeStart,
    marqueeEnd,
    setIsSpacePressed,
    handleMouseDown: panHandleMouseDown,
    handleMouseMove: panHandleMouseMove,
    handleMouseUp: panHandleMouseUp,
    handleContextMenu: panHandleContextMenu,
  } = usePanControls({
    components,
    transform,
    applyTransform,
    setSelectedComponents,
    setMousePosition,
  });

  // Use drag and drop hook
  useDragAndDrop({
    transform,
    components,
    setComponents,
    setIsDragOverBoard,
    setDragType,
    addNewComponent,
    setDragPreviewData,
  });

  // Use component creators hook
  const {
    createImageComponentAtMouse,
    createYouTubeComponentAtMouse,
    createSoundCloudComponentAtMouse,
    createSpotifyComponentAtMouse,
    createLinkPreviewComponentAtMouse,
  } = useComponentCreators({
    components,
    setComponents,
    setSelectedComponents,
    mousePosition,
    transform,
  });

  // Copy-paste functionality for all shape components
  const handleCopyComponents = useCallback(() => {
    copySelectedComponents(components, selectedComponents, setCopiedComponents);
  }, [components, selectedComponents, setCopiedComponents]);

  const handlePasteComponents = useCallback(async () => {
    // Create the component creators object
    const creators: ComponentCreators = {
      createImageComponentAtMouse,
      createYouTubeComponentAtMouse,
      createSoundCloudComponentAtMouse,
      createSpotifyComponentAtMouse,
      createLinkPreviewComponentAtMouse,
    };

    // Create the component state object
    const state: ComponentState = {
      components,
      selectedComponents,
      copiedComponents,
      mousePosition,
      transform,
    };

    // Create the setters object
    const setters: ComponentStateSetters = {
      setComponents,
      setSelectedComponents,
      setCopiedComponents,
    };

    // Use the utility function
    await handleComponentPaste(state, setters, creators);
  }, [
    components,
    selectedComponents,
    copiedComponents,
    mousePosition,
    transform,
    createImageComponentAtMouse,
    createYouTubeComponentAtMouse,
    createSoundCloudComponentAtMouse,
    createSpotifyComponentAtMouse,
    createLinkPreviewComponentAtMouse,
    setComponents,
    setSelectedComponents,
    setCopiedComponents,
  ]);

  // Function to force paste image from clipboard (ignoring copied components)
  const handlePasteImageFromClipboard = useCallback(async () => {
    // Use the utility function
    await handleImagePasteFromClipboard(createImageComponentAtMouse);
  }, [createImageComponentAtMouse]);

  // Wrapper for handleDrag that includes current zoom level for dynamic snap-to-grid
  const handleDragWithSnap = useCallback(
    (
      id: number,
      deltaX: number,
      deltaY: number,
      isShiftPressed: boolean = false
    ) => {
      let finalDeltaX = deltaX;
      let finalDeltaY = deltaY;

      // Apply axis lock if Shift is pressed
      if (isShiftPressed) {
        // Determine which axis has more movement to lock to that axis
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Lock to horizontal axis
          finalDeltaY = 0;
        } else {
          // Lock to vertical axis
          finalDeltaX = 0;
        }
      }

      handleDrag(id, finalDeltaX, finalDeltaY, transform.k, snapToGrid); // Pass current zoom level and snap state
    },
    [handleDrag, transform.k, snapToGrid]
  );

  // Use event handlers hook
  useEventHandlers({
    svgRef,
    containerRef,
    zoomBehavior: zoomBehavior,
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
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    const timeoutRef = zoomIndicatorTimeoutRef;
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [zoomIndicatorTimeoutRef]);

  // Overview/Minimap functionality
  const getWhiteboardBounds = useCallback(() => {
    if (components.length === 0) {
      return {
        minX: 0,
        minY: 0,
        maxX: LAYOUT_CONSTANTS.DEFAULT_WHITEBOARD_SIZE,
        maxY: LAYOUT_CONSTANTS.DEFAULT_WHITEBOARD_SIZE,
      };
    }

    const padding = LAYOUT_CONSTANTS.WHITEBOARD_PADDING;
    const bounds = components.reduce(
      (acc, comp) => ({
        minX: Math.min(acc.minX, comp.x),
        minY: Math.min(acc.minY, comp.y),
        maxX: Math.max(
          acc.maxX,
          comp.x + (comp.width || COMPONENT_SIZES.DEFAULT_WIDTH)
        ),
        maxY: Math.max(
          acc.maxY,
          comp.y + (comp.height || COMPONENT_SIZES.DEFAULT_HEIGHT)
        ),
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

  const navigateToComponent = useCallback(
    (component: Component) => {
      if (!svgRef.current || !zoomBehavior.current) return;

      const svg = d3.select(svgRef.current);
      const targetX =
        component.x + (component.width || COMPONENT_SIZES.DEFAULT_WIDTH) / 2;
      const targetY =
        component.y + (component.height || COMPONENT_SIZES.DEFAULT_HEIGHT) / 2;

      svg
        .transition()
        .duration(ANIMATIONS.NAVIGATION_DURATION)
        .call(
          zoomBehavior.current.transform,
          d3.zoomIdentity
            .translate(window.innerWidth / 2, window.innerHeight / 2)
            .scale(1)
            .translate(-targetX, -targetY)
        );

      setShowOverview(false);
    },
    [zoomBehavior]
  );

  // Memoize the GPU-optimized transform container style
  const transformContainerStyle = useMemo(
    () =>
      getGPUStyle({
        position: "absolute",
        top: 0,
        left: 0,
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
        pointerEvents: "none",
      }),
    [transform.x, transform.y, transform.k, getGPUStyle]
  );

  // Memoize sorted components for performance
  const sortedComponents = useMemo(
    () => [...components].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)),
    [components]
  );

  return (
    <div
      ref={containerRef}
      data-drop-zone
      className="bg-background"
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Grid Background SVG - separate layer behind everything */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <GridBackground
          transform={transform}
          enabled={showGrid}
          size={gridSize}
          dynamicSizing={dynamicGridSizing}
        />
      </svg>

      {/* Drag Preview Overlay */}
      <DragPreviewOverlay
        transform={transform}
        mousePosition={dragPreviewData.mousePosition}
        componentType={dragPreviewData.componentType}
        gridSize={gridSize}
        snapToGrid={snapToGrid}
        isVisible={dragPreviewData.isVisible}
      />

      {/* Main SVG for zoom/pan behavior */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "all",
          background: "transparent",
        }}
      />

      {/* Marquee selection overlay */}
      {isMarqueeActive && (
        <div
          style={{
            position: "absolute",
            left: `${Math.min(marqueeStart.x, marqueeEnd.x)}px`,
            top: `${Math.min(marqueeStart.y, marqueeEnd.y)}px`,
            width: `${Math.abs(marqueeEnd.x - marqueeStart.x)}px`,
            height: `${Math.abs(marqueeEnd.y - marqueeStart.y)}px`,
            border: COLORS.MARQUEE_BORDER,
            backgroundColor: COLORS.PRIMARY_BLUE_LIGHT,
            pointerEvents: "none",
            zIndex: Z_INDEX.MARQUEE_SELECTION,
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
            backgroundColor: COLORS.BLACK_OVERLAY,
            color: "white",
            padding: "8px 16px",
            borderRadius: TYPOGRAPHY.BORDER_RADIUS_LARGE,
            fontSize: "16px",
            fontWeight: TYPOGRAPHY.FONT_WEIGHT_MEDIUM,
            fontFamily: "monospace",
            pointerEvents: "none",
            zIndex: Z_INDEX.ZOOM_INDICATOR,
            boxShadow: `0 2px 8px ${COLORS.BLACK_SHADOW}`,
            backdropFilter: "blur(4px)",
            border: `1px solid ${COLORS.WHITE_BORDER}`,
            animation: isActivelyZooming
              ? ANIMATIONS.ZOOM_FADE_IN
              : ANIMATIONS.ZOOM_FADE_OUT,
          }}
        >
          {Math.round(transform.k * PERCENTAGE.HUNDRED_PERCENT)}%
        </div>
      )}

      <div style={transformContainerStyle}>
        {/* Render sorted components with GPU acceleration */}
        {sortedComponents.map((component) => (
          <DraggableComponent
            key={component.id}
            x={component.x}
            y={component.y}
            id={component.id}
            type={component.type}
            onDrag={handleDragWithSnap}
            onDragStart={handleDragStart}
            onSelect={handleSelect}
            onDelete={handleDeleteComponent}
            onResize={handleResizeComponent}
            onTextChange={handleTextChange}
            onImageChange={handleImageChange}
            selected={selectedComponents.includes(component.id)}
            selectedCount={selectedComponents.length}
            transform={transform}
            zIndex={component.zIndex || 0}
            imageSrc={component.imageSrc}
            width={component.width}
            height={component.height}
            text={component.text}
            youtubeUrl={component.youtubeUrl}
            soundcloudUrl={component.soundcloudUrl}
            spotifyUrl={component.spotifyUrl}
            fontSize={component.fontSize}
            fontFamily={component.fontFamily}
            textColor={component.textColor}
            textAlign={component.textAlign}
            fontWeight={component.fontWeight}
            fontStyle={component.fontStyle}
            fillColor={component.fillColor}
            strokeColor={component.strokeColor}
            strokeWidth={component.strokeWidth}
            borderRadius={component.borderRadius}
            strokeStyle={component.strokeStyle}
            arrowStyle={component.arrowStyle}
            arrowSize={component.arrowSize}
          />
        ))}
      </div>

      <ControlPanel
        onZoom={handleZoom}
        selectedComponents={selectedComponents}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        gridSize={gridSize}
        onGridSizeChange={setGridSize}
        dynamicGridSizing={dynamicGridSizing}
        onToggleDynamicGridSizing={() =>
          setDynamicGridSizing(!dynamicGridSizing)
        }
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid(!snapToGrid)}
      />

      {/* Component Footer and Sidebar */}
      <ComponentFooter
        categories={COMPONENT_CATEGORIES}
        onCategoryClick={handleCategoryClick}
        activeCategory={activeCategory || undefined}
      />

      <CategorySidebar
        category={getActiveCategory()}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />

      {/* Overview/Minimap overlay */}
      {showOverview && (
        <div
          ref={overviewRef}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background border rounded-xl shadow-2xl overflow-hidden"
          style={{
            zIndex: Z_INDEX.OVERVIEW_MODAL,
            maxWidth: "80vw",
            maxHeight: "80vh",
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

      {/* FPS Monitor for performance tracking */}
      <FPSMonitor enabled={true} position="top-right" />

      {/* Widget headers for selected widget components - only show for single selection */}
      {selectedComponents.length === 1 &&
        (() => {
          const selectedComponent = components.find(
            (c) => c.id === selectedComponents[0]
          );
          if (!selectedComponent) return null;

          const isWidgetComponent = [
            "timer",
            "weather",
            "bitcoin",
            "currency",
            "note",
            "confetti",
            "watch",
            "scrollingtext",
            "youtubeVideo",
            "soundcloud",
            "spotify",
            "stylishlink",
            "linkpreview",
          ].includes(selectedComponent.type);

          if (!isWidgetComponent) return null;

          const getWidgetTitle = (type: string) => {
            const metadata = {
              timer: "Timer",
              weather: "Weather",
              bitcoin: "Bitcoin Chart",
              currency: "Currency Converter",
              note: "Text Note",
              confetti: "Confetti Button",
              watch: "Watch",
              scrollingtext: "Scrolling Text",
              youtubeVideo: "YouTube Video",
              soundcloud: "SoundCloud",
              spotify: "Spotify",
              stylishlink: "Stylish Link",
              linkpreview: "Link Preview",
            };
            return metadata[type as keyof typeof metadata] || type;
          };

          // Calculate the actual position on screen (not transformed)
          const screenX = selectedComponent.x * transform.k + transform.x;
          const screenY = selectedComponent.y * transform.k + transform.y;
          const screenWidth = (selectedComponent.width || 200) * transform.k;

          return (
            <WidgetHeader
              options={{
                title: getWidgetTitle(selectedComponent.type),
                refreshInterval: 0,
                isVisible: true,
              }}
              onOptionsChange={(options: Partial<WidgetFormattingOptions>) => {
                // Handle widget formatting changes here if needed
                console.log(
                  `${selectedComponent.type} formatting changed:`,
                  options
                );
              }}
              position={{
                x: screenX + screenWidth / 2,
                y: screenY - 60,
              }}
              visible={true}
              onRefresh={() => {
                // Handle refresh for specific widget types
                console.log(`Refreshing ${selectedComponent.type}`);
              }}
              onClose={() => setSelectedComponents([])}
            />
          );
        })()}

      {/* Shape headers for selected shape components - only show for single selection */}
      {selectedComponents.length === 1 &&
        (() => {
          const selectedComponent = components.find(
            (c) => c.id === selectedComponents[0]
          );
          if (!selectedComponent) return null;

          const isShapeComponent = [
            "rectangle",
            "circle",
            "ellipse",
            "line",
            "arrow",
            "text",
            "image",
          ].includes(selectedComponent.type);

          if (!isShapeComponent) return null;

          // Calculate the actual position on screen (not transformed)
          const screenX = selectedComponent.x * transform.k + transform.x;
          const screenY = selectedComponent.y * transform.k + transform.y;
          const screenWidth = (selectedComponent.width || 200) * transform.k;

          return (
            <ComponentHeader
              position={{
                x: screenX + screenWidth / 2,
                y: screenY - 60,
              }}
              visible={true}
              headerWidth="auto"
              offsetY={-40}
            >
              {/* Shape-specific controls */}
              {selectedComponent.type === "text" && (
                <>
                  {/* Font Size */}
                  <Select
                    value={String(selectedComponent.fontSize || 16)}
                    onValueChange={(value) => {
                      handleFormattingChange(selectedComponent.id, {
                        fontSize: Number(value),
                      });
                    }}
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12px</SelectItem>
                      <SelectItem value="14">14px</SelectItem>
                      <SelectItem value="16">16px</SelectItem>
                      <SelectItem value="18">18px</SelectItem>
                      <SelectItem value="20">20px</SelectItem>
                      <SelectItem value="24">24px</SelectItem>
                      <SelectItem value="32">32px</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Font Family */}
                  <Select
                    value={selectedComponent.fontFamily || "Arial"}
                    onValueChange={(value) => {
                      handleFormattingChange(selectedComponent.id, {
                        fontFamily: value,
                      });
                    }}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">
                        Times New Roman
                      </SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Text Color Picker */}
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={selectedComponent.textColor || "#374151"}
                      onChange={(e) => {
                        handleFormattingChange(selectedComponent.id, {
                          textColor: e.target.value,
                        });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="w-8 h-8 rounded border border-border cursor-pointer"
                      title="Text Color"
                    />
                  </div>

                  {/* Text Align */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant={
                        selectedComponent.textAlign === "left"
                          ? "default"
                          : "ghost"
                      }
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFormattingChange(selectedComponent.id, {
                          textAlign: "left",
                        });
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="h-8 w-8"
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={
                        selectedComponent.textAlign === "center"
                          ? "default"
                          : "ghost"
                      }
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFormattingChange(selectedComponent.id, {
                          textAlign: "center",
                        });
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="h-8 w-8"
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={
                        selectedComponent.textAlign === "right"
                          ? "default"
                          : "ghost"
                      }
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFormattingChange(selectedComponent.id, {
                          textAlign: "right",
                        });
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="h-8 w-8"
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Bold/Italic */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant={
                        selectedComponent.fontWeight === "bold"
                          ? "default"
                          : "ghost"
                      }
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFormattingChange(selectedComponent.id, {
                          fontWeight:
                            selectedComponent.fontWeight === "bold"
                              ? "normal"
                              : "bold",
                        });
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="h-8 w-8"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={
                        selectedComponent.fontStyle === "italic"
                          ? "default"
                          : "ghost"
                      }
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFormattingChange(selectedComponent.id, {
                          fontStyle:
                            selectedComponent.fontStyle === "italic"
                              ? "normal"
                              : "italic",
                        });
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="h-8 w-8"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}

              {/* Shape formatting controls */}
              {(selectedComponent.type === "rectangle" ||
                selectedComponent.type === "circle" ||
                selectedComponent.type === "ellipse") && (
                <>
                  {/* Fill Color Picker */}
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium min-w-[40px] text-foreground">
                      Fill:
                    </span>
                    <input
                      type="color"
                      value={selectedComponent.fillColor || "#f3f4f6"}
                      onChange={(e) => {
                        handleFormattingChange(selectedComponent.id, {
                          fillColor: e.target.value,
                        } as Record<string, unknown>);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="w-8 h-8 rounded border border-border cursor-pointer"
                      title="Fill Color"
                    />
                  </div>

                  {/* Border Color Picker */}
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium min-w-[40px] text-foreground">
                      Border:
                    </span>
                    <input
                      type="color"
                      value={selectedComponent.strokeColor || "#9ca3af"}
                      onChange={(e) => {
                        handleFormattingChange(selectedComponent.id, {
                          strokeColor: e.target.value,
                        } as Record<string, unknown>);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="w-8 h-8 rounded border border-border cursor-pointer"
                      title="Border Color"
                    />
                  </div>

                  {/* Border Width */}
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium min-w-[40px] text-foreground">
                      Width:
                    </span>
                    <Select
                      value={String(selectedComponent.strokeWidth || 2)}
                      onValueChange={(value) => {
                        handleFormattingChange(selectedComponent.id, {
                          strokeWidth: Number(value),
                        } as Record<string, unknown>);
                      }}
                    >
                      <SelectTrigger className="w-16 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0px</SelectItem>
                        <SelectItem value="1">1px</SelectItem>
                        <SelectItem value="2">2px</SelectItem>
                        <SelectItem value="3">3px</SelectItem>
                        <SelectItem value="4">4px</SelectItem>
                        <SelectItem value="5">5px</SelectItem>
                        <SelectItem value="8">8px</SelectItem>
                        <SelectItem value="10">10px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Border Radius (for rectangle only) */}
                  {selectedComponent.type === "rectangle" && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium min-w-[40px] text-foreground">
                        Radius:
                      </span>
                      <Select
                        value={String(selectedComponent.borderRadius || 8)}
                        onValueChange={(value) => {
                          handleFormattingChange(selectedComponent.id, {
                            borderRadius: Number(value),
                          } as Record<string, unknown>);
                        }}
                      >
                        <SelectTrigger className="w-16 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0px</SelectItem>
                          <SelectItem value="4">4px</SelectItem>
                          <SelectItem value="8">8px</SelectItem>
                          <SelectItem value="12">12px</SelectItem>
                          <SelectItem value="16">16px</SelectItem>
                          <SelectItem value="20">20px</SelectItem>
                          <SelectItem value="24">24px</SelectItem>
                          <SelectItem value="32">32px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              {/* Line and Arrow specific controls */}
              {(selectedComponent.type === "line" ||
                selectedComponent.type === "arrow") && (
                <>
                  {/* Stroke Color Picker */}
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium min-w-[40px] text-foreground">
                      Color:
                    </span>
                    <input
                      type="color"
                      value={selectedComponent.strokeColor || "#9ca3af"}
                      onChange={(e) => {
                        handleFormattingChange(selectedComponent.id, {
                          strokeColor: e.target.value,
                        } as Record<string, unknown>);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="w-8 h-8 rounded border border-border cursor-pointer"
                      title="Stroke Color"
                    />
                  </div>

                  {/* Stroke Width */}
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium min-w-[40px] text-foreground">
                      Width:
                    </span>
                    <Select
                      value={String(selectedComponent.strokeWidth || 2)}
                      onValueChange={(value) => {
                        handleFormattingChange(selectedComponent.id, {
                          strokeWidth: Number(value),
                        } as Record<string, unknown>);
                      }}
                    >
                      <SelectTrigger className="w-16 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1px</SelectItem>
                        <SelectItem value="2">2px</SelectItem>
                        <SelectItem value="3">3px</SelectItem>
                        <SelectItem value="4">4px</SelectItem>
                        <SelectItem value="5">5px</SelectItem>
                        <SelectItem value="8">8px</SelectItem>
                        <SelectItem value="10">10px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Stroke Style */}
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium min-w-[40px] text-foreground">
                      Style:
                    </span>
                    <Select
                      value={selectedComponent.strokeStyle || "solid"}
                      onValueChange={(value) => {
                        handleFormattingChange(selectedComponent.id, {
                          strokeStyle: value as "solid" | "dashed" | "dotted",
                        } as Record<string, unknown>);
                      }}
                    >
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="dashed">Dashed</SelectItem>
                        <SelectItem value="dotted">Dotted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Arrow Style (for arrow only) */}
                  {selectedComponent.type === "arrow" && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium min-w-[40px] text-foreground">
                        Arrow:
                      </span>
                      <Select
                        value={selectedComponent.arrowStyle || "arrow"}
                        onValueChange={(value) => {
                          handleFormattingChange(selectedComponent.id, {
                            arrowStyle: value as
                              | "none"
                              | "arrow"
                              | "double-arrow",
                          } as Record<string, unknown>);
                        }}
                      >
                        <SelectTrigger className="w-20 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="arrow">Arrow</SelectItem>
                          <SelectItem value="double-arrow">Double</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Arrow Size (for arrow only) */}
                  {selectedComponent.type === "arrow" && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium min-w-[40px] text-foreground">
                        Size:
                      </span>
                      <Select
                        value={String(selectedComponent.arrowSize || 10)}
                        onValueChange={(value) => {
                          handleFormattingChange(selectedComponent.id, {
                            arrowSize: Number(value),
                          } as Record<string, unknown>);
                        }}
                      >
                        <SelectTrigger className="w-16 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">Small</SelectItem>
                          <SelectItem value="10">Medium</SelectItem>
                          <SelectItem value="14">Large</SelectItem>
                          <SelectItem value="18">XL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              {/* Image specific controls */}
              {selectedComponent.type === "image" && (
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium min-w-[40px] text-foreground">
                    Radius:
                  </span>
                  <Select
                    value={String(selectedComponent.borderRadius || 8)}
                    onValueChange={(value) => {
                      handleFormattingChange(selectedComponent.id, {
                        borderRadius: Number(value),
                      } as Record<string, unknown>);
                    }}
                  >
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0px</SelectItem>
                      <SelectItem value="4">4px</SelectItem>
                      <SelectItem value="8">8px</SelectItem>
                      <SelectItem value="12">12px</SelectItem>
                      <SelectItem value="16">16px</SelectItem>
                      <SelectItem value="20">20px</SelectItem>
                      <SelectItem value="24">24px</SelectItem>
                      <SelectItem value="32">32px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedComponents([]);
                }}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </ComponentHeader>
          );
        })()}
    </div>
  );
};

export default CustomGrid;
