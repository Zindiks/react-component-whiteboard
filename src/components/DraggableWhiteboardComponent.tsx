import React, { useState, useCallback, useEffect } from "react";
import * as d3 from "d3";
import { widgetLogger } from "../utils/componentLoggers";
import { Timer } from "./widgets/Timer";
import { Weather } from "./widgets/Weather";
import { BitcoinChart } from "./widgets/BitcoinChart";
import { CurrencyConverter } from "./widgets/CurrencyConverter";
import { TextNote } from "./widgets/TextNote";
import { ConfettiButton } from "./widgets/ConfettiButton";
import { Watch } from "./widgets/Watch";
import { ScrollingText } from "./widgets/ScrollingText";
import { YouTubeVideo } from "./widgets/YouTubeVideo";
import { SoundCloudWidget } from "./widgets/SoundCloudWidget";
import { SpotifyWidget } from "./widgets/SpotifyWidget";
import { StylishLink } from "./widgets/StylishLink";

import {
  RectangleShape,
  EllipseShape,
  ArrowShape,
  LineShape,
  TextShape,
  ImageShape,
} from "./shapes";
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
} from "lucide-react";

interface DraggableComponentProps {
  x: number;
  y: number;
  id: number;
  type: string;
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
  zIndex?: number;
  imageSrc?: string;
  width?: number;
  height?: number;
  text?: string;
  youtubeUrl?: string;
  soundcloudUrl?: string;
  spotifyUrl?: string;
  onResize?: (id: number, width: number, height: number) => void;
  onTextChange?: (id: number, text: string) => void;
  onImageChange?: (id: number, imageSrc: string) => void;
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({
  x,
  y,
  id,
  type,
  onDrag,
  onDragStart,
  onSelect,
  onDelete,
  selected,
  selectedCount = 1,
  transform,
  zIndex,
  imageSrc,
  width,
  height,
  text,
  youtubeUrl,
  soundcloudUrl,
  spotifyUrl,
  onResize,
  onTextChange,
  onImageChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [isAxisLocked, setIsAxisLocked] = useState(false);

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

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging) return;

      const currentMousePos = { x: event.clientX, y: event.clientY };
      const deltaX = (currentMousePos.x - dragStartPos.x) / transform.k;
      const deltaY = (currentMousePos.y - dragStartPos.y) / transform.k;

      // Detect if Shift key is pressed for axis lock
      const isShiftPressed = event.shiftKey;

      // Update axis lock state for visual feedback
      setIsAxisLocked(isShiftPressed);

      onDrag(id, deltaX, deltaY, isShiftPressed);
    },
    [isDragging, dragStartPos, transform.k, onDrag, id]
  );

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

  const componentMap = {
    timer: () => <Timer />,
    weather: () => <Weather />,
    bitcoin: () => <BitcoinChart width={width} height={height} />,
    currency: () => <CurrencyConverter />,
    note: () => <TextNote />,
    confetti: () => <ConfettiButton />,
    watch: () => <Watch />,
    scrollingtext: () => <ScrollingText />,
    youtubeVideo: () => (
      <YouTubeVideo initialUrl={youtubeUrl} width={width} height={height} />
    ),
    soundcloud: () => (
      <SoundCloudWidget
        initialUrl={soundcloudUrl}
        width={width}
        height={height}
      />
    ),
    spotify: () => (
      <SpotifyWidget initialUrl={spotifyUrl} width={width} height={height} />
    ),
    stylishlink: () => <StylishLink />,
    // Shape components (no headers, resizable, connectable)
    rectangle: () => (
      <RectangleShape
        x={0}
        y={0}
        width={width || 120}
        height={height || 80}
        selected={selected}
        onSelect={() => onSelect(id)}
        onResize={(newWidth, newHeight) => onResize?.(id, newWidth, newHeight)}
      />
    ),
    ellipse: () => (
      <EllipseShape
        x={0}
        y={0}
        width={width || 120}
        height={height || 80}
        selected={selected}
        onSelect={() => onSelect(id)}
        onResize={(newWidth, newHeight) => onResize?.(id, newWidth, newHeight)}
      />
    ),
    arrow: () => (
      <ArrowShape
        x={0}
        y={0}
        width={width || 150}
        height={height || 20}
        selected={selected}
        onSelect={() => onSelect(id)}
        onResize={(newWidth, newHeight) => onResize?.(id, newWidth, newHeight)}
      />
    ),
    line: () => (
      <LineShape
        x={0}
        y={0}
        width={width || 150}
        height={height || 20}
        selected={selected}
        onSelect={() => onSelect(id)}
        onResize={(newWidth, newHeight) => onResize?.(id, newWidth, newHeight)}
      />
    ),
    text: () => (
      <TextShape
        x={0}
        y={0}
        width={width || 150}
        height={height || 50}
        selected={selected}
        onSelect={() => onSelect(id)}
        onResize={(newWidth, newHeight) => onResize?.(id, newWidth, newHeight)}
        text={text || "Double-click to edit"}
        onTextChange={(newText) => onTextChange?.(id, newText)}
      />
    ),
    imageShape: () => (
      <ImageShape
        x={0}
        y={0}
        width={width || 200}
        height={height || 150}
        selected={selected}
        onSelect={() => onSelect(id)}
        onResize={(newWidth, newHeight) => onResize?.(id, newWidth, newHeight)}
        imageSrc={imageSrc}
        onImageChange={(newImageSrc) => {
          widgetLogger.debug("Image changed", {
            componentId: id,
            imageUrl:
              newImageSrc.substring(0, 100) +
              (newImageSrc.length > 100 ? "..." : ""),
          });
          onImageChange?.(id, newImageSrc);
        }}
      />
    ),
  };

  const renderComponent = () => {
    const componentFactory = componentMap[type as keyof typeof componentMap];

    if (componentFactory) {
      return componentFactory();
    }

    return (
      <div className="w-20 bg-slate-800 rounded-md p-2">
        <p className="text-white text-center">{id}</p>
      </div>
    );
  };

  // Check if this is a shape component (no header, different interaction)
  const isShapeComponent = [
    "rectangle",
    "ellipse",
    "arrow",
    "line",
    "text",
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
      {/* Floating header for selected widget components - only show for single selection */}
      {selected && !isShapeComponent && selectedCount === 1 && (
        <FloatingHeader
          {...getComponentMetadata()}
          onDelete={handleDeleteClick}
          x={x}
          y={y}
        />
      )}

      {/* Axis lock indicator */}
      {isAxisLocked && isDragging && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${x - 20}px`,
            top: `${y - 20}px`,
            zIndex: (zIndex || 0) + 1000,
          }}
        >
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded shadow-lg flex items-center">
            🔒 Axis Lock
          </div>
        </div>
      )}

      <div
        data-component="true"
        className={`absolute pointer-events-auto ${
          selected ? "ring-2 ring-blue-500" : ""
        } ${isAxisLocked && isDragging ? "ring-2 ring-orange-400" : ""} group`}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          zIndex: zIndex,
        }}
        onMouseDown={
          isShapeComponent ? handleShapeMouseDown : handleComponentMouseDown
        }
      >
        {renderComponent()}
      </div>
    </>
  );
};
