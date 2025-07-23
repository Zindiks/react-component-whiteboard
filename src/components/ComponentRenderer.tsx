import React from "react";
import { Timer } from "./widgets/Timer";
import { Weather } from "./widgets/Weather";
import { BitcoinChart } from "./widgets/BitcoinChart";
import { CurrencyConverter } from "./widgets/CurrencyConverter";
import { TextNote } from "./widgets/TextNote";
import { ConfettiButton } from "./widgets/ConfettiButton";
import { Watch } from "./widgets/Watch";
import { YouTubeVideo } from "./widgets/YouTubeVideo";
import { SoundCloudWidget } from "./widgets/SoundCloudWidget";
import { SpotifyWidget } from "./widgets/SpotifyWidget";
import { StylishLink } from "./widgets/StylishLink";
import { LinkPreview } from "./widgets/LinkPreview";
import { Voting } from "./widgets/Voting";

import {
  RectangleShape,
  EllipseShape,
  ArrowShape,
  LineShape,
  TextShape,
  ScrollingTextShape,
  ImageShape,
  GroupedShape,
} from "./shapes";
import type {
  TextFormattingOptions,
  ShapeFormattingOptions,
  ImageFormattingOptions,
} from "../types/formatting";
import type { Component } from "../types/whiteboard";

interface ComponentRendererProps {
  component: Component;
  selected: boolean;
  onSelect: (id: number) => void;
  onResize?: (id: number, width: number, height: number) => void;
  onTextChange?: (id: number, text: string) => void;
  onImageChange?: (id: number, imageSrc: string) => void;
  onFormattingChange?: (
    id: number,
    options:
      | Partial<TextFormattingOptions>
      | Partial<ShapeFormattingOptions>
      | Partial<ImageFormattingOptions>
  ) => void;
  isEditing?: boolean;
  onEditingChange?: (id: number, isEditing: boolean) => void;
  linkPreviewDisplayMode?: "compact" | "medium" | "full";
  onPreviewUpdate?: (
    id: number,
    previewData: { url: string; image?: string }
  ) => void;
  onDisplayModeChange?: (mode: "compact" | "medium" | "full") => void;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  selected,
  onSelect,
  onResize,
  onTextChange,
  onImageChange,
  onFormattingChange,
  isEditing,
  onEditingChange,
  linkPreviewDisplayMode = "full",
  onPreviewUpdate,
  onDisplayModeChange,
}) => {
  const {
    id,
    type,
    width,
    height,
    text,
    youtubeUrl,
    soundcloudUrl,
    spotifyUrl,
    imageSrc,
    fontSize,
    fontFamily,
    textColor,
    textAlign,
    fontWeight,
    fontStyle,
    fillColor,
    strokeColor,
    strokeWidth,
    borderRadius,
    strokeStyle,
    arrowStyle,
    arrowSize,
    rotation,
    opacity,
    scrollDirection,
    scrollSpeed,
    pauseOnHover,
    bounceOnEnd,
    backgroundColor,
  } = component;

  const componentMap = {
    timer: () => <Timer />,
    weather: () => <Weather />,
    bitcoin: () => <BitcoinChart width={width} height={height} />,
    currency: () => <CurrencyConverter />,
    note: () => <TextNote />,
    confetti: () => <ConfettiButton />,
    watch: () => <Watch />,
    scrollingtext: () => (
      <ScrollingTextShape
        x={0}
        y={0}
        width={width || 300}
        height={height || 60}
        selected={selected}
        onSelect={() => onSelect(id)}
        onResize={(newWidth, newHeight) => onResize?.(id, newWidth, newHeight)}
        text={text || "Scrolling text - double-click to edit"}
        onTextChange={(newText) => onTextChange?.(id, newText)}
        onFontSizeChange={(newFontSize) =>
          onFormattingChange?.(id, {
            fontSize: newFontSize,
          } as Partial<TextFormattingOptions>)
        }
        fontSize={fontSize}
        fontFamily={fontFamily}
        textColor={textColor}
        textAlign={textAlign}
        fontWeight={fontWeight}
        fontStyle={fontStyle}
        backgroundColor={backgroundColor}
        scrollDirection={scrollDirection || "horizontal"}
        scrollSpeed={scrollSpeed || 50}
        pauseOnHover={pauseOnHover ?? true}
        bounceOnEnd={bounceOnEnd ?? false}
        isEditing={isEditing}
        onEditingChange={(editing) => onEditingChange?.(id, editing)}
      />
    ),
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
    voting: () => <Voting />,
    linkpreview: () => (
      <LinkPreview
        initialUrl={text} // Use text field to store the URL
        width={width}
        height={height}
        displayMode={linkPreviewDisplayMode}
        onPreviewUpdate={(previewData) => {
          // Store the URL in the text field and preview image in imageSrc
          onPreviewUpdate?.(id, previewData);
        }}
        onDisplayModeChange={onDisplayModeChange}
      />
    ),
    // Shape components (no headers, resizable, connectable)
    rectangle: () => (
      <RectangleShape
        x={0}
        y={0}
        width={width || 150}
        height={height || 100}
        selected={selected}
        onSelect={() => onSelect(id)}
        onResize={(newWidth, newHeight) => onResize?.(id, newWidth, newHeight)}
        fillColor={fillColor}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        borderRadius={borderRadius}
        text={text}
        onTextChange={(newText) => onTextChange?.(id, newText)}
        fontSize={fontSize}
        fontFamily={fontFamily}
        textColor={textColor}
        textAlign={textAlign}
        fontWeight={fontWeight}
        fontStyle={fontStyle}
      />
    ),
    ellipse: () => (
      <EllipseShape
        x={0}
        y={0}
        width={width || 150}
        height={height || 100}
        selected={selected}
        onSelect={() => onSelect(id)}
        onResize={(newWidth, newHeight) => onResize?.(id, newWidth, newHeight)}
        fillColor={fillColor}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        text={text}
        onTextChange={(newText) => onTextChange?.(id, newText)}
        fontSize={fontSize}
        fontFamily={fontFamily}
        textColor={textColor}
        textAlign={textAlign}
        fontWeight={fontWeight}
        fontStyle={fontStyle}
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
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        strokeStyle={strokeStyle}
        arrowStyle={arrowStyle}
        arrowSize={arrowSize}
        text={text}
        onTextChange={(newText) => onTextChange?.(id, newText)}
        fontSize={fontSize}
        fontFamily={fontFamily}
        textColor={textColor}
        fontWeight={fontWeight}
        fontStyle={fontStyle}
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
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        strokeStyle={strokeStyle}
        text={text}
        onTextChange={(newText) => onTextChange?.(id, newText)}
        fontSize={fontSize}
        fontFamily={fontFamily}
        textColor={textColor}
        fontWeight={fontWeight}
        fontStyle={fontStyle}
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
        onFontSizeChange={(newFontSize) =>
          onFormattingChange?.(id, {
            fontSize: newFontSize,
          } as Partial<TextFormattingOptions>)
        }
        fontSize={fontSize}
        fontFamily={fontFamily}
        textColor={textColor}
        textAlign={textAlign}
        fontWeight={fontWeight}
        fontStyle={fontStyle}
        isEditing={isEditing}
        onEditingChange={(editing) => onEditingChange?.(id, editing)}
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
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        borderRadius={borderRadius}
        rotation={rotation || 0}
        opacity={opacity || 1}
        onImageChange={(newImageSrc) => onImageChange?.(id, newImageSrc)}
        onFormattingChange={(options) => onFormattingChange?.(id, options)}
      />
    ),
    groupFrame: () => (
      <GroupedShape
        x={0}
        y={0}
        width={width || 200}
        height={height || 150}
        selected={selected}
        onSelect={() => onSelect(id)}
        onResize={(newWidth, newHeight) => onResize?.(id, newWidth, newHeight)}
        groupName={text || "Frame"}
        onGroupNameChange={(newName) => onTextChange?.(id, newName)}
        groupType="frame"
        showHeader={true}
        collapsible={false}
      />
    ),
    groupContainer: () => (
      <GroupedShape
        x={0}
        y={0}
        width={width || 200}
        height={height || 150}
        selected={selected}
        onSelect={() => onSelect(id)}
        onResize={(newWidth, newHeight) => onResize?.(id, newWidth, newHeight)}
        groupName={text || "Container"}
        onGroupNameChange={(newName) => onTextChange?.(id, newName)}
        groupType="container"
        showHeader={true}
        collapsible={true}
        collapsed={false}
      />
    ),
  };

  const componentFactory = componentMap[type as keyof typeof componentMap];

  if (componentFactory) {
    return componentFactory();
  }

  // Fallback for unknown component types
  return (
    <div className="w-20 bg-slate-800 rounded-md p-2">
      <p className="text-white text-center">{id}</p>
    </div>
  );
};
