import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  memo,
} from "react";
import * as d3 from "d3";
import { usePerformance } from "../hooks/usePerformance";
import { ComponentRenderer } from "./ComponentRenderer";
import type { Component } from "../types/whiteboard";
import type {
  TextFormattingOptions,
  ShapeFormattingOptions,
  ImageFormattingOptions,
} from "../types/formatting";
import { FloatingHeader } from "./widgets/FloatingHeader";
import {
  Video,
  Timer as TimerIcon,
  Cloud,
  TrendingUp,
  DollarSign,
  StickyNote,
  Sparkles,
  Watch as WatchIcon,
  Type,
  Music,
  Headphones,
  ExternalLink,
  Link,
  Minimize2,
  LayoutGrid,
  Maximize2,
  Vote,
} from "lucide-react";
import { Button } from "./ui/button";

interface DraggableComponentProps {
  component: Component;
  onDrag: (
    id: number,
    deltaX: number,
    deltaY: number,
    isShiftPressed?: boolean
  ) => void;
  onDragStart: (id: number) => void;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  selected: boolean;
  selectedCount?: number; // Total number of selected components
  transform: d3.ZoomTransform;
  onResize?: (id: number, width: number, height: number) => void;
  onTextChange?: (id: number, text: string) => void;
  onImageChange?: (id: number, imageSrc: string) => void;
  isEditing?: boolean;
  onEditingChange?: (id: number, isEditing: boolean) => void;
  onFormattingChange?: (
    id: number,
    options:
      | Partial<TextFormattingOptions>
      | Partial<ShapeFormattingOptions>
      | Partial<ImageFormattingOptions>
  ) => void;
}

const DraggableComponentBase: React.FC<DraggableComponentProps> = ({
  component,
  onDrag,
  onDragStart,
  onSelect,
  onDelete,
  selected,
  selectedCount = 1,
  transform,
  onResize,
  onTextChange,
  onImageChange,
  isEditing,
  onEditingChange,
  onFormattingChange,
}) => {
  const { x, y, id, type, zIndex } = component;
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [isAxisLocked, setIsAxisLocked] = useState(false);
  const [linkPreviewDisplayMode, setLinkPreviewDisplayMode] = useState<
    "compact" | "medium" | "full"
  >("full");

  // Performance optimizations
  const { throttleRAF, getGPUStyle, batchUpdate } = usePerformance({
    targetFPS: 120,
    enableGPUAcceleration: true,
    batchUpdates: true,
  });

  const componentRef = useRef<HTMLDivElement>(null);

  // Memoize GPU-optimized styles
  const optimizedStyles = useMemo(
    () =>
      getGPUStyle({
        left: `${x}px`,
        top: `${y}px`,
        zIndex: zIndex,
      }),
    [x, y, zIndex, getGPUStyle]
  );

  // Utility function to check if the clicked element is interactive
  const isInteractiveElement = (element: HTMLElement): boolean => {
    return !!(
      element &&
      (element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        element.tagName === "SELECT" ||
        element.tagName === "BUTTON" ||
        element.tagName === "A" ||
        element.hasAttribute("contenteditable") ||
        element.closest(
          "input, textarea, select, button, a, [contenteditable]"
        ))
    );
  };

  // Mouse down handler for dragging (applies to entire component)
  const handleComponentMouseDown = (event: React.MouseEvent) => {
    // If clicking on an interactive element, let it handle the event naturally
    if (isInteractiveElement(event.target as HTMLElement)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Always prepare for dragging when clicking on a component
    setIsDragging(true);
    const mousePos = { x: event.clientX, y: event.clientY };
    setDragStartPos(mousePos);

    if (!selected) {
      // If clicking an unselected component, select it first then start drag
      onSelect(id);
    }

    // Start dragging for this component (whether it was selected or not)
    onDragStart(id);
  };

  // Shape-specific mouse down handler for dragging
  const handleShapeMouseDown = (event: React.MouseEvent) => {
    // If clicking on an interactive element, let it handle the event naturally
    if (isInteractiveElement(event.target as HTMLElement)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Always prepare for dragging when clicking on a shape
    setIsDragging(true);
    const mousePos = { x: event.clientX, y: event.clientY };
    setDragStartPos(mousePos);

    if (!selected) {
      // If clicking an unselected shape, select it first then start drag
      onSelect(id);
    }

    // Start dragging for this shape (whether it was selected or not)
    onDragStart(id);
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(id);
  };

  // Handle LinkPreview updates
  const handlePreviewUpdate = (
    componentId: number,
    previewData: { url: string; image?: string }
  ) => {
    onTextChange?.(componentId, previewData.url);
    if (previewData.image) {
      onImageChange?.(componentId, previewData.image);
    }
  };

  // Render display mode toggle buttons for LinkPreview floating header
  const renderLinkPreviewActions = () => (
    <div className="flex items-center space-x-1">
      <Button
        variant={linkPreviewDisplayMode === "compact" ? "default" : "outline"}
        size="sm"
        className="h-6 w-6 p-0"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setLinkPreviewDisplayMode("compact");
        }}
        title="Compact view"
      >
        <Minimize2 className="w-3 h-3" />
      </Button>
      <Button
        variant={linkPreviewDisplayMode === "medium" ? "default" : "outline"}
        size="sm"
        className="h-6 w-6 p-0"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setLinkPreviewDisplayMode("medium");
        }}
        title="Medium view"
      >
        <LayoutGrid className="w-3 h-3" />
      </Button>
      <Button
        variant={linkPreviewDisplayMode === "full" ? "default" : "outline"}
        size="sm"
        className="h-6 w-6 p-0"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setLinkPreviewDisplayMode("full");
        }}
        title="Full view"
      >
        <Maximize2 className="w-3 h-3" />
      </Button>
    </div>
  );

  // Create throttled mouse move handler
  const throttledMouseMoveRef = useRef<((event: MouseEvent) => void) | null>(
    null
  );

  useEffect(() => {
    throttledMouseMoveRef.current = throttleRAF((event: MouseEvent) => {
      if (!isDragging) return;

      const currentMousePos = { x: event.clientX, y: event.clientY };
      const deltaX = (currentMousePos.x - dragStartPos.x) / transform.k;
      const deltaY = (currentMousePos.y - dragStartPos.y) / transform.k;

      // Detect if Shift key is pressed for axis lock
      const isShiftPressed = event.shiftKey;

      // Batch state updates for performance
      batchUpdate(() => {
        setIsAxisLocked(isShiftPressed);
      });

      onDrag(id, deltaX, deltaY, isShiftPressed);
    });
  }, [
    isDragging,
    dragStartPos,
    transform.k,
    onDrag,
    id,
    throttleRAF,
    batchUpdate,
  ]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (throttledMouseMoveRef.current) {
      throttledMouseMoveRef.current(event);
    }
  }, []);

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsAxisLocked(false);
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

  // Check if this is a shape component (no header, different interaction)
  const isShapeComponent = [
    "rectangle",
    "ellipse",
    "arrow",
    "line",
    "text",
    "scrollingtext",
    "imageShape",
  ].includes(type);

  // Function to get component metadata for floating header
  const getComponentMetadata = () => {
    const metadata = {
      timer: { title: "Timer", icon: TimerIcon, iconColor: "bg-green-600" },
      youtubeVideo: {
        title: "YouTube Video",
        icon: Video,
        iconColor: "bg-red-600",
      },
      weather: { title: "Weather", icon: Cloud, iconColor: "bg-blue-500" },
      bitcoin: {
        title: "Bitcoin Chart",
        icon: TrendingUp,
        iconColor: "bg-orange-500",
      },
      currency: {
        title: "Currency Converter",
        icon: DollarSign,
        iconColor: "bg-green-500",
      },
      note: {
        title: "Text Note",
        icon: StickyNote,
        iconColor: "bg-yellow-500",
      },
      confetti: {
        title: "Confetti Button",
        icon: Sparkles,
        iconColor: "bg-purple-500",
      },
      watch: { title: "Watch", icon: WatchIcon, iconColor: "bg-gray-700" },
      scrollingtext: {
        title: "Scrolling Text",
        icon: Type,
        iconColor: "bg-indigo-500",
      },
      soundcloud: {
        title: "SoundCloud",
        icon: Music,
        iconColor: "bg-orange-600",
      },
      spotify: {
        title: "Spotify",
        icon: Headphones,
        iconColor: "bg-green-600",
      },
      stylishlink: {
        title: "Stylish Link",
        icon: ExternalLink,
        iconColor: "bg-blue-600",
      },
      linkpreview: {
        title: "Link Preview",
        icon: Link,
        iconColor: "bg-cyan-600",
      },
      voting: {
        title: "Voting",
        icon: Vote,
        iconColor: "bg-purple-600",
      },
      // Add more as needed
    };
    return (
      metadata[type as keyof typeof metadata] || {
        title: type,
        icon: Video,
        iconColor: "bg-gray-600",
      }
    );
  };

  return (
    <>
      {/* Floating header for linkpreview component only - only show for single selection */}
      {selected && type === "linkpreview" && selectedCount === 1 && (
        <FloatingHeader
          {...getComponentMetadata()}
          actions={renderLinkPreviewActions()}
          onDelete={handleDeleteClick}
          x={x}
          y={y}
        />
      )}

      {/* Axis lock indicator */}
      {isAxisLocked && isDragging && (
        <div
          className="absolute pointer-events-none"
          style={getGPUStyle({
            left: `${x - 20}px`,
            top: `${y - 20}px`,
            zIndex: (zIndex || 0) + 1000,
          })}
        >
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded shadow-lg flex items-center">
            🔒 Axis Lock
          </div>
        </div>
      )}

      <div
        ref={componentRef}
        data-component="true"
        data-testid="draggable-component"
        className={`absolute pointer-events-auto ${
          selected ? "ring-2 ring-blue-500" : ""
        } ${isAxisLocked && isDragging ? "ring-2 ring-orange-400" : ""} group`}
        style={optimizedStyles}
        onMouseDown={
          isShapeComponent ? handleShapeMouseDown : handleComponentMouseDown
        }
      >
        <ComponentRenderer
          component={component}
          selected={selected}
          onSelect={onSelect}
          onResize={onResize}
          onTextChange={onTextChange}
          onImageChange={onImageChange}
          onFormattingChange={onFormattingChange}
          isEditing={isEditing}
          onEditingChange={onEditingChange}
          linkPreviewDisplayMode={linkPreviewDisplayMode}
          onPreviewUpdate={handlePreviewUpdate}
          onDisplayModeChange={(mode) => setLinkPreviewDisplayMode(mode)}
        />
      </div>
    </>
  );
};

// Custom comparison function for React.memo
const areEqual = (
  prevProps: DraggableComponentProps,
  nextProps: DraggableComponentProps
) => {
  // Only re-render if relevant props change
  return (
    prevProps.component.x === nextProps.component.x &&
    prevProps.component.y === nextProps.component.y &&
    prevProps.component.width === nextProps.component.width &&
    prevProps.component.height === nextProps.component.height &&
    prevProps.selected === nextProps.selected &&
    prevProps.selectedCount === nextProps.selectedCount &&
    prevProps.component.zIndex === nextProps.component.zIndex &&
    prevProps.isEditing === nextProps.isEditing &&
    // Compare all component properties for deep equality
    JSON.stringify(prevProps.component) === JSON.stringify(nextProps.component)
  );
};

// Export the memoized component
export const DraggableComponent = memo(DraggableComponentBase, areEqual);
