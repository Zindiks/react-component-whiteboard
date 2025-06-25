/**
 * Clipboard Operations Utilities
 *
 * This module contains utility functions for handling clipboard operations
 * including copying components, pasting from clipboard, and detecting various
 * content types in clipboard data.
 */

import { Component } from "../types/whiteboard";
import { clipboardLogger } from "./componentLoggers";
import {
  isImageUrl,
  isYouTubeUrl,
  isSoundCloudUrl,
  isSpotifyUrl,
  isGenericUrl,
  extractImageFromHtml,
} from "./urlDetection";

// Shape types that can be copied
export const COPYABLE_SHAPE_TYPES = [
  "rectangle",
  "ellipse",
  "arrow",
  "line",
  "text",
  "imageShape",
];

/**
 * Interface for component creators - functions that create components at specified positions
 */
export interface ComponentCreators {
  createImageComponentAtMouse: (imageSrc: string) => Promise<void>;
  createYouTubeComponentAtMouse: (youtubeUrl: string) => void;
  createSoundCloudComponentAtMouse: (soundcloudUrl: string) => void;
  createSpotifyComponentAtMouse: (spotifyUrl: string) => void;
  createLinkPreviewComponentAtMouse: (url: string) => void;
}

/**
 * Interface for component state management
 */
export interface ComponentState {
  components: Component[];
  selectedComponents: number[];
  copiedComponents: Component[];
  mousePosition: { x: number; y: number };
  transform: { x: number; y: number; k: number };
}

/**
 * Interface for component state setters
 */
export interface ComponentStateSetters {
  setComponents: React.Dispatch<React.SetStateAction<Component[]>>;
  setSelectedComponents: React.Dispatch<React.SetStateAction<number[]>>;
  setCopiedComponents: React.Dispatch<React.SetStateAction<Component[]>>;
}

/**
 * Filters selected components to only include copyable shape types
 */
export const getSelectedCopyableComponents = (
  components: Component[],
  selectedComponents: number[]
): Component[] => {
  return components.filter(
    (c) =>
      selectedComponents.includes(c.id) && COPYABLE_SHAPE_TYPES.includes(c.type)
  );
};

/**
 * Copies selected components to the clipboard state
 */
export const copySelectedComponents = (
  components: Component[],
  selectedComponents: number[],
  setCopiedComponents: React.Dispatch<React.SetStateAction<Component[]>>
): number => {
  const selectedShapeComponents = getSelectedCopyableComponents(
    components,
    selectedComponents
  );

  if (selectedShapeComponents.length > 0) {
    setCopiedComponents(selectedShapeComponents);
    clipboardLogger.debug("Copied shape components", {
      count: selectedShapeComponents.length,
      componentIds: selectedShapeComponents.map((c) => c.id),
    });
  }

  return selectedShapeComponents.length;
};

/**
 * Converts screen coordinates to whiteboard coordinates
 */
export const screenToWhiteboardCoords = (
  screenX: number,
  screenY: number,
  transform: { x: number; y: number; k: number }
) => ({
  x: (screenX - transform.x) / transform.k,
  y: (screenY - transform.y) / transform.k,
});

/**
 * Creates new component IDs for pasted components
 */
export const generateNewComponentId = (components: Component[]): number => {
  return Math.max(...components.map((c) => c.id), 0) + 1;
};

/**
 * Gets the highest z-index among all components
 */
export const getHighestZIndex = (components: Component[]): number => {
  return Math.max(...components.map((c) => c.zIndex || 0), 0);
};

/**
 * Creates new components from copied components with new positions and IDs
 */
export const createPastedComponents = (
  copiedComponents: Component[],
  components: Component[],
  mousePosition: { x: number; y: number },
  transform: { x: number; y: number; k: number }
): Component[] => {
  const baseId = generateNewComponentId(components);
  const highestZIndex = getHighestZIndex(components);
  const whiteboardCoords = screenToWhiteboardCoords(
    mousePosition.x,
    mousePosition.y,
    transform
  );

  return copiedComponents.map((component, index) => ({
    ...component,
    id: baseId + index,
    x: whiteboardCoords.x - 50, // Offset slightly from mouse position
    y: whiteboardCoords.y - 50,
    zIndex: highestZIndex + 1 + index,
  }));
};

/**
 * Reads clipboard items for image data
 */
export const readClipboardImageData = async (
  clipboardItems: ClipboardItem[],
  createImageComponent: (imageSrc: string) => Promise<void>
): Promise<boolean> => {
  for (const clipboardItem of clipboardItems) {
    // Check for image data in clipboard
    for (const type of clipboardItem.types) {
      if (type.startsWith("image/")) {
        const imageBlob = await clipboardItem.getType(type);
        const imageSrc = URL.createObjectURL(imageBlob);
        await createImageComponent(imageSrc);
        return true;
      }
    }

    // Check for HTML content that might contain images
    if (clipboardItem.types.includes("text/html")) {
      const htmlBlob = await clipboardItem.getType("text/html");
      const htmlText = await htmlBlob.text();
      const imageUrl = extractImageFromHtml(htmlText);
      if (imageUrl) {
        await createImageComponent(imageUrl);
        return true;
      }
    }
  }

  return false;
};

/**
 * Processes clipboard text for various URL types
 */
export const processClipboardText = async (
  clipboardText: string,
  creators: ComponentCreators
): Promise<boolean> => {
  if (!clipboardText) return false;

  // Check for YouTube URLs first
  if (isYouTubeUrl(clipboardText)) {
    creators.createYouTubeComponentAtMouse(clipboardText);
    return true;
  }

  // Then check for SoundCloud URLs
  if (isSoundCloudUrl(clipboardText)) {
    creators.createSoundCloudComponentAtMouse(clipboardText);
    return true;
  }

  // Then check for Spotify URLs
  if (isSpotifyUrl(clipboardText)) {
    creators.createSpotifyComponentAtMouse(clipboardText);
    return true;
  }

  // Finally check for image URLs
  if (isImageUrl(clipboardText)) {
    await creators.createImageComponentAtMouse(clipboardText);
    return true;
  }

  // Check for generic URLs that can be previewed
  if (isGenericUrl(clipboardText)) {
    creators.createLinkPreviewComponentAtMouse(clipboardText);
    return true;
  }

  return false;
};

/**
 * Handles pasting components from clipboard or internal copy state
 */
export const handleComponentPaste = async (
  state: ComponentState,
  setters: ComponentStateSetters,
  creators: ComponentCreators
): Promise<void> => {
  const { copiedComponents, components, mousePosition, transform } = state;
  const { setComponents, setSelectedComponents } = setters;

  // If we have copied components, paste them first (prioritize component copy/paste)
  if (copiedComponents.length > 0) {
    const newComponents = createPastedComponents(
      copiedComponents,
      components,
      mousePosition,
      transform
    );

    setComponents((prev) => [...prev, ...newComponents]);

    // Select the newly pasted components
    const newIds = newComponents.map((c) => c.id);
    setSelectedComponents(newIds);

    clipboardLogger.info("Pasted copied components", {
      count: newComponents.length,
      componentTypes: newComponents.map((c) => c.type),
      mousePosition,
    });
    return;
  }

  // If no copied components, try to paste from clipboard
  try {
    // First, try to read clipboard items (for actual image data)
    if (navigator.clipboard && navigator.clipboard.read) {
      const clipboardItems = await navigator.clipboard.read();
      const imageProcessed = await readClipboardImageData(
        clipboardItems,
        creators.createImageComponentAtMouse
      );

      if (imageProcessed) return;
    }

    // Fallback: try to read text for various URL types
    const clipboardText = await navigator.clipboard.readText();
    const textProcessed = await processClipboardText(clipboardText, creators);

    if (!textProcessed) {
      clipboardLogger.debug("No supported content found in clipboard");
    }
  } catch (error) {
    clipboardLogger.warn("Clipboard access failed or no image content found", {
      error,
    });
  }
};

/**
 * Handles pasting only image content from clipboard (ignoring copied components)
 */
export const handleImagePasteFromClipboard = async (
  createImageComponent: (imageSrc: string) => Promise<void>
): Promise<void> => {
  try {
    // Try to read clipboard items (for actual image data)
    if (navigator.clipboard && navigator.clipboard.read) {
      const clipboardItems = await navigator.clipboard.read();
      const imageProcessed = await readClipboardImageData(
        clipboardItems,
        createImageComponent
      );

      if (imageProcessed) return;
    }

    // Fallback: try to read text for image URLs only
    const clipboardText = await navigator.clipboard.readText();
    if (clipboardText && isImageUrl(clipboardText)) {
      await createImageComponent(clipboardText);
      return;
    }

    clipboardLogger.debug("No image content found in clipboard");
  } catch (error) {
    clipboardLogger.error("Failed to paste image from clipboard", { error });
  }
};

/**
 * Type guard to check if clipboard supports reading
 */
export const supportsClipboardRead = (): boolean => {
  return !!(navigator.clipboard && navigator.clipboard.read);
};

/**
 * Type guard to check if clipboard supports reading text
 */
export const supportsClipboardReadText = (): boolean => {
  return !!(navigator.clipboard && navigator.clipboard.readText);
};
