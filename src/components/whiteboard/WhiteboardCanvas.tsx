import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";
import { ComponentFooter } from "../ComponentFooter";
import { CategorySidebar } from "../CategorySidebar";
import { DraggableComponent } from "../DraggableWhiteboardComponent";
import { GridBackground } from "../GridBackground";
import { FPSMonitor } from "../FPSMonitor";
import { usePerformance } from "../../hooks/usePerformance";
import { COMPONENT_CATEGORIES } from "../../constants/componentCategories";
import { Component } from "../../types/whiteboard";
import { useWhiteboardState } from "../../hooks/useWhiteboardState";
import { useZoomControls } from "../../hooks/useZoomControls";
import { usePanControls } from "../../hooks/usePanControls";
import {
  LAYOUT_CONSTANTS,
  COMPONENT_SIZES,
  Z_INDEX,
  COLORS,
  ANIMATIONS,
  TYPOGRAPHY,
  PERCENTAGE,
  GRID_CONSTANTS,
} from "../../constants/appConstants";
import { useSidebarControls } from "../../hooks/useSidebarControls";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { useEventHandlers } from "../../hooks/useEventHandlers";
import { useComponentCreators } from "../../hooks/useComponentCreators";
import { ControlPanel } from "../ControlPanel";
import {
  copySelectedComponents,
  handleComponentPaste,
  handleImagePasteFromClipboard,
  ComponentCreators,
  ComponentState,
  ComponentStateSetters,
} from "../../utils/clipboardOperations";
import { MarqueeOverlay } from "./MarqueeOverlay";
import { ZoomIndicatorOverlay } from "./ZoomIndicatorOverlay";
import { DragOverlay } from "./DragOverlay";
import { OverviewOverlay } from "./OverviewOverlay";

const WhiteboardCanvas = () => {
  // ...existing code from App.tsx's CustomGrid component...
  const { getGPUStyle } = usePerformance({
    targetFPS: 120,
    enableGPUAcceleration: true,
    batchUpdates: true,
  });
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
    handleDrag,
    handleSelect,
    handleDragStart,
  } = useWhiteboardState();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(GRID_CONSTANTS.ENABLED);
  const [gridSize, setGridSize] = useState<number>(GRID_CONSTANTS.SIZE);
  const [dynamicGridSizing, setDynamicGridSizing] = useState<boolean>(
    GRID_CONSTANTS.DYNAMIC_SIZING
  );
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showOverview, setShowOverview] = useState(false);
  const overviewRef = useRef<HTMLDivElement>(null);
  const {
    activeCategory,
    isSidebarOpen,
    isDragOverBoard,
    dragType,
    setIsDragOverBoard,
    setDragType,
    handleCategoryClick,
    handleCloseSidebar,
    getActiveCategory,
  } = useSidebarControls();
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
  useDragAndDrop({
    transform,
    components,
    setComponents,
    setIsDragOverBoard,
    setDragType,
    addNewComponent,
  });
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
  const handleCopyComponents = useCallback(() => {
    copySelectedComponents(components, selectedComponents, setCopiedComponents);
  }, [components, selectedComponents, setCopiedComponents]);
  const handlePasteComponents = useCallback(async () => {
    const creators: ComponentCreators = {
      createImageComponentAtMouse,
      createYouTubeComponentAtMouse,
      createSoundCloudComponentAtMouse,
      createSpotifyComponentAtMouse,
      createLinkPreviewComponentAtMouse,
    };
    const state: ComponentState = {
      components,
      selectedComponents,
      copiedComponents,
      mousePosition,
      transform,
    };
    const setters: ComponentStateSetters = {
      setComponents,
      setSelectedComponents,
      setCopiedComponents,
    };
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
  const handlePasteImageFromClipboard = useCallback(async () => {
    await handleImagePasteFromClipboard(createImageComponentAtMouse);
  }, [createImageComponentAtMouse]);
  const handleDragWithSnap = useCallback(
    (
      id: number,
      deltaX: number,
      deltaY: number,
      isShiftPressed: boolean = false
    ) => {
      let finalDeltaX = deltaX;
      let finalDeltaY = deltaY;
      if (isShiftPressed) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          finalDeltaY = 0;
        } else {
          finalDeltaX = 0;
        }
      }
      handleDrag(id, finalDeltaX, finalDeltaY, transform.k, snapToGrid);
    },
    [handleDrag, transform.k, snapToGrid]
  );
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
  useEffect(() => {
    const timeoutRef = zoomIndicatorTimeoutRef;
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [zoomIndicatorTimeoutRef]);
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
      <MarqueeOverlay
        isActive={isMarqueeActive}
        start={marqueeStart}
        end={marqueeEnd}
        border={COLORS.MARQUEE_BORDER}
        backgroundColor={COLORS.PRIMARY_BLUE_LIGHT}
        zIndex={Z_INDEX.MARQUEE_SELECTION}
      />
      {/* Zoom indicator overlay */}
      <ZoomIndicatorOverlay
        show={showZoomIndicator}
        isActivelyZooming={isActivelyZooming}
        zoomPercent={Math.round(transform.k * PERCENTAGE.HUNDRED_PERCENT)}
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
          boxShadow: `0 2px 8px ${COLORS.BLACK_SHADOW}`,
          backdropFilter: "blur(4px)",
          border: `1px solid ${COLORS.WHITE_BORDER}`,
        }}
        zIndex={Z_INDEX.ZOOM_INDICATOR}
        animation={
          isActivelyZooming ? ANIMATIONS.ZOOM_FADE_IN : ANIMATIONS.ZOOM_FADE_OUT
        }
      />
      <div style={transformContainerStyle}>
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
      {/* Drag overlay indicator */}
      <DragOverlay
        isDragOver={isDragOverBoard}
        dragType={dragType || ""}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.PRIMARY_BLUE_LIGHT,
          border: `3px dashed ${COLORS.PRIMARY_BLUE}`,
          borderRadius: TYPOGRAPHY.BORDER_RADIUS_LARGE,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        zIndex={Z_INDEX.DRAG_OVERLAY}
        message={
          dragType === "image" ? "📷 Drop image here" : "🔧 Drop component here"
        }
      />
      {/* Overview/Minimap overlay */}
      <OverviewOverlay
        show={showOverview}
        components={components}
        selectedComponents={selectedComponents}
        transform={transform}
        onNavigateToComponent={navigateToComponent}
        onClose={() => setShowOverview(false)}
        getWhiteboardBounds={getWhiteboardBounds}
        zIndex={Z_INDEX.OVERVIEW_MODAL}
        overviewRef={overviewRef}
      />
      <FPSMonitor enabled={true} position="top-right" />
    </div>
  );
};

export default WhiteboardCanvas;
