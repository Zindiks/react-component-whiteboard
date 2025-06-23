import React, { useState, useCallback, useEffect } from "react";
import * as d3 from "d3";
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
import { FlowCanvas } from "./widgets/FlowCanvas";
import { FlowNode } from "./widgets/FlowNode";
import {
  RectangleShape,
  EllipseShape,
  ArrowShape,
  LineShape,
  TextShape,
  ImageShape,
} from "./shapes";

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

  const componentMap = {
    timer: () => (
      <Timer
        onHeaderMouseDown={handleHeaderMouseDown}
        onDelete={handleDeleteClick}
      />
    ),
    weather: () => (
      <Weather
        onHeaderMouseDown={handleHeaderMouseDown}
        onDelete={handleDeleteClick}
      />
    ),
    bitcoin: () => (
      <BitcoinChart
        onHeaderMouseDown={handleHeaderMouseDown}
        onDelete={handleDeleteClick}
      />
    ),
    currency: () => (
      <CurrencyConverter
        onHeaderMouseDown={handleHeaderMouseDown}
        onDelete={handleDeleteClick}
      />
    ),
    note: () => (
      <TextNote
        onHeaderMouseDown={handleHeaderMouseDown}
        onDelete={handleDeleteClick}
      />
    ),
    confetti: () => (
      <ConfettiButton
        onHeaderMouseDown={handleHeaderMouseDown}
        onDelete={handleDeleteClick}
      />
    ),
    watch: () => (
      <Watch
        onHeaderMouseDown={handleHeaderMouseDown}
        onDelete={handleDeleteClick}
      />
    ),
    scrollingtext: () => (
      <ScrollingText
        onHeaderMouseDown={handleHeaderMouseDown}
        onDelete={handleDeleteClick}
      />
    ),
    youtubeVideo: () => (
      <YouTubeVideo
        initialUrl={youtubeUrl}
        width={width}
        height={height}
        onHeaderMouseDown={handleHeaderMouseDown}
        onDelete={handleDeleteClick}
      />
    ),
    soundcloud: () => (
      <SoundCloudWidget
        initialUrl={soundcloudUrl}
        width={width}
        height={height}
        onHeaderMouseDown={handleHeaderMouseDown}
        onDelete={handleDeleteClick}
      />
    ),
    spotify: () => (
      <SpotifyWidget
        initialUrl={spotifyUrl}
        width={width}
        height={height}
        onHeaderMouseDown={handleHeaderMouseDown}
        onDelete={handleDeleteClick}
      />
    ),
    stylishlink: () => (
      <StylishLink
        onHeaderMouseDown={handleHeaderMouseDown}
        onDelete={handleDeleteClick}
      />
    ),
    flowCanvas: () => (
      <FlowCanvas
        onHeaderMouseDown={handleHeaderMouseDown}
        onDelete={handleDeleteClick}
      />
    ),
    flowNodeStart: () => (
      <FlowNode
        nodeType="start"
        label="Start"
        color="#10b981"
        onHeaderMouseDown={handleHeaderMouseDown}
        onDelete={handleDeleteClick}
      />
    ),
    flowNodeProcess: () => (
      <FlowNode
        nodeType="process"
        label="Process"
        color="#3b82f6"
        onHeaderMouseDown={handleHeaderMouseDown}
        onDelete={handleDeleteClick}
      />
    ),
    flowNodeDecision: () => (
      <FlowNode
        nodeType="decision"
        label="Decision"
        color="#f59e0b"
        onHeaderMouseDown={handleHeaderMouseDown}
        onDelete={handleDeleteClick}
      />
    ),
    flowNodeEnd: () => (
      <FlowNode
        nodeType="end"
        label="End"
        color="#ef4444"
        onHeaderMouseDown={handleHeaderMouseDown}
        onDelete={handleDeleteClick}
      />
    ),
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
          console.log("Image changed:", newImageSrc);
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

  // Shape-specific mouse down handler for dragging
  const handleShapeMouseDown = (event: React.MouseEvent) => {
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
      onMouseDown={isShapeComponent ? handleShapeMouseDown : undefined}
    >
      {renderComponent()}
    </div>
  );
};
