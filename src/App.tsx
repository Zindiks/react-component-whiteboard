import { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { ComponentFooter } from "./components/ComponentFooter";
import { CategorySidebar } from "./components/CategorySidebar";
import { DraggableComponent } from "./components/DraggableWhiteboardComponent";
import { COMPONENT_CATEGORIES } from "./constants/componentCategories";
import { Component } from "./types/whiteboard";
import { useWhiteboardState } from "./hooks/useWhiteboardState";
import { useZoomControls } from "./hooks/useZoomControls";
import { usePanControls } from "./hooks/usePanControls";
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

const CustomGrid = () => {
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

  // Overview/Minimap state
  const [showOverview, setShowOverview] = useState(false);
  const overviewRef = useRef<HTMLDivElement>(null);

  // Use sidebar controls hook
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
  });

  // Use component creators hook
  const {
    createImageComponentAtMouse,
    createYouTubeComponentAtMouse,
    createSoundCloudComponentAtMouse,
    createSpotifyComponentAtMouse,
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
    setComponents,
    setSelectedComponents,
    setCopiedComponents,
  ]);

  // Function to force paste image from clipboard (ignoring copied components)
  const handlePasteImageFromClipboard = useCallback(async () => {
    // Use the utility function
    await handleImagePasteFromClipboard(createImageComponentAtMouse);
  }, [createImageComponentAtMouse]);

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

  const navigateToComponent = useCallback(
    (component: Component) => {
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
    },
    [zoomBehavior]
  );

  return (
    <div
      ref={containerRef}
      data-drop-zone
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

      {/* Drag overlay indicator */}
      {isDragOverBoard && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            border: "3px dashed #3b82f6",
            borderRadius: "12px",
            pointerEvents: "none",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.9)",
              color: "white",
              padding: "16px 24px",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "600",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            {dragType === "image"
              ? "📷 Drop image here"
              : "🔧 Drop component here"}
          </div>
        </div>
      )}

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

export default CustomGrid;
