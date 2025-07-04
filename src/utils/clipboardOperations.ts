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
  // Widget types
  "youtubeVideo",
  "soundcloud",
  "spotify",
  "scrollingtext",
  "linkPreview",
  "timer",
  "watch",
  "note",
  "confetti",
  "weather",
  "bitcoin",
  "currency",
];

/**
 * Interface for component creators - functions that create components at specified positions
 */
export interface ComponentCreators {
  createImageComponentAtMouse: (imageSrc: string) => Promise<void>;
  createTextComponentAtMouse: (
    text: string,
    styling?: Partial<Component>
  ) => void;
  createShapeComponentAtMouse: (
    shapeType: string,
    styling?: Partial<Component>
  ) => void;
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
 * Copies selected components to the clipboard state and optionally to system clipboard
 */
export const copySelectedComponents = async (
  components: Component[],
  selectedComponents: number[],
  setCopiedComponents: React.Dispatch<React.SetStateAction<Component[]>>
): Promise<number> => {
  const selectedShapeComponents = getSelectedCopyableComponents(
    components,
    selectedComponents
  );

  if (selectedShapeComponents.length > 0) {
    setCopiedComponents(selectedShapeComponents);
    await markInternalCopy(); // Mark that this is an internal copy

    // For single component, copy its content to system clipboard
    if (selectedShapeComponents.length === 1) {
      const contentCopied = await copyComponentContentToClipboard(
        selectedShapeComponents[0]
      );
      clipboardLogger.debug("Copied single component", {
        count: selectedShapeComponents.length,
        componentIds: selectedShapeComponents.map((c) => c.id),
        systemClipboardContent: contentCopied,
      });
    }
    // For multiple components, copy rich component data to system clipboard
    else {
      try {
        // Create rich component data that preserves all styling and properties
        const richComponentData = createRichComponentData(
          selectedShapeComponents
        );
        await navigator.clipboard.writeText(richComponentData);

        clipboardLogger.debug("Copied multiple components with rich data", {
          count: selectedShapeComponents.length,
          componentIds: selectedShapeComponents.map((c) => c.id),
          componentTypes: selectedShapeComponents.map((c) => c.type),
          systemClipboardContent: true,
          dataLength: richComponentData.length,
        });
      } catch (error) {
        clipboardLogger.warn(
          "Failed to copy rich component data to system clipboard",
          { error }
        );

        // Fallback to summary format
        try {
          const summary = selectedShapeComponents
            .map((comp, index) => {
              let content = `${index + 1}. ${comp.type}`;
              if (comp.text) content += `: ${comp.text}`;
              else if (comp.youtubeUrl) content += `: ${comp.youtubeUrl}`;
              else if (comp.soundcloudUrl) content += `: ${comp.soundcloudUrl}`;
              else if (comp.spotifyUrl) content += `: ${comp.spotifyUrl}`;
              else if (comp.imageSrc) content += `: ${comp.imageSrc}`;
              return content;
            })
            .join("\n");

          if (summary.trim()) {
            await navigator.clipboard.writeText(
              `Copied ${selectedShapeComponents.length} components:\n${summary}`
            );
          }
        } catch (fallbackError) {
          clipboardLogger.warn("Failed to copy fallback summary", {
            fallbackError,
          });
        }
      }
    }
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
  if (copiedComponents.length === 0) return [];

  const baseId = generateNewComponentId(components);
  const highestZIndex = getHighestZIndex(components);
  const whiteboardCoords = screenToWhiteboardCoords(
    mousePosition.x,
    mousePosition.y,
    transform
  );

  // Calculate the center point of the copied components group
  const bounds = copiedComponents.reduce(
    (acc, comp) => ({
      minX: Math.min(acc.minX, comp.x),
      minY: Math.min(acc.minY, comp.y),
      maxX: Math.max(acc.maxX, comp.x + (comp.width || 200)),
      maxY: Math.max(acc.maxY, comp.y + (comp.height || 200)),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );

  const groupCenterX = (bounds.minX + bounds.maxX) / 2;
  const groupCenterY = (bounds.minY + bounds.maxY) / 2;

  // Calculate offset to position group center at mouse position
  const offsetX = whiteboardCoords.x - groupCenterX;
  const offsetY = whiteboardCoords.y - groupCenterY;

  return copiedComponents.map((component, index) => ({
    ...component,
    id: baseId + index,
    x: component.x + offsetX, // Preserve relative positioning
    y: component.y + offsetY, // Preserve relative positioning
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
 * Processes clipboard text for various URL types and plain text
 */
export const processClipboardText = async (
  clipboardText: string,
  creators: ComponentCreators
): Promise<boolean> => {
  if (!clipboardText) return false;

  // Check if it's our rich component data format first (multiple components)
  const richComponentData = parseRichComponentData(clipboardText);
  if (richComponentData) {
    // Rich component data should be handled by the main paste function, not here
    // Return false to allow the main paste function to handle it
    return false;
  }

  // Check if it's our rich text format (single text component)
  const richTextData = parseRichTextData(clipboardText);
  if (richTextData) {
    creators.createTextComponentAtMouse(
      richTextData.text,
      richTextData.styling
    );
    return true;
  }

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

  // If it's not a URL but contains meaningful text, create a text component
  const trimmedText = clipboardText.trim();
  if (trimmedText.length > 0) {
    creators.createTextComponentAtMouse(trimmedText);
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
  const { setComponents, setSelectedComponents, setCopiedComponents } = setters;

  // Check if clipboard has new content that differs from our copied components
  let hasExternalClipboardContent = false;
  try {
    // Try to read clipboard text to see if it's different from our copied components
    const clipboardText = await navigator.clipboard.readText();

    // If we have any clipboard text content, prioritize it over internal copied components
    if (clipboardText && clipboardText.trim().length > 0) {
      hasExternalClipboardContent = true;
    }

    // Also check for image data in clipboard
    if (
      !hasExternalClipboardContent &&
      navigator.clipboard &&
      navigator.clipboard.read
    ) {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith("image/") || type === "text/html") {
            hasExternalClipboardContent = true;
            break;
          }
        }
        if (hasExternalClipboardContent) break;
      }
    }
  } catch {
    // If we can't read clipboard, fall back to original behavior
  }

  // If there's external clipboard content, prioritize it over internal copied components
  if (hasExternalClipboardContent) {
    // Process the external clipboard content
    try {
      // First check for text content that might be rich component data
      const clipboardText = await navigator.clipboard.readText();

      // Check if it's our rich component data format (multiple components)
      const richComponentData = parseRichComponentData(clipboardText);
      if (richComponentData) {
        const newComponents = createPastedComponents(
          richComponentData,
          components,
          mousePosition,
          transform
        );

        setComponents((prev) => [...prev, ...newComponents]);

        // Select the newly pasted components
        const newIds = newComponents.map((c) => c.id);
        setSelectedComponents(newIds);

        clipboardLogger.info("Pasted rich component data from clipboard", {
          count: newComponents.length,
          componentTypes: newComponents.map((c) => c.type),
          mousePosition,
        });

        // Clear copied components after successful external paste
        setCopiedComponents([]);
        return;
      }

      // Next, try to read clipboard items (for actual image data)
      if (navigator.clipboard && navigator.clipboard.read) {
        const clipboardItems = await navigator.clipboard.read();
        const imageProcessed = await readClipboardImageData(
          clipboardItems,
          creators.createImageComponentAtMouse
        );

        if (imageProcessed) {
          // Clear copied components only after successful external paste
          setCopiedComponents([]);
          return;
        }
      }

      // Fallback: try to process text for various URL types and rich text
      const textProcessed = await processClipboardText(clipboardText, creators);

      if (textProcessed) {
        // Clear copied components only after successful external paste
        setCopiedComponents([]);
        return;
      }

      clipboardLogger.debug("No supported content found in clipboard");
    } catch (error) {
      clipboardLogger.warn("Failed to process external clipboard content", {
        error,
      });
    }
  }

  // If we have copied components and no external content was processed, paste them
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

  // If no copied components and no external content, try to paste from clipboard anyway
  try {
    // First check for text content that might be rich component data
    const clipboardText = await navigator.clipboard.readText();

    // Check if it's our rich component data format (multiple components)
    const richComponentData = parseRichComponentData(clipboardText);
    if (richComponentData) {
      const newComponents = createPastedComponents(
        richComponentData,
        components,
        mousePosition,
        transform
      );

      setComponents((prev) => [...prev, ...newComponents]);

      // Select the newly pasted components
      const newIds = newComponents.map((c) => c.id);
      setSelectedComponents(newIds);

      clipboardLogger.info(
        "Pasted rich component data from clipboard (fallback)",
        {
          count: newComponents.length,
          componentTypes: newComponents.map((c) => c.type),
          mousePosition,
        }
      );
      return;
    }

    // Next, try to read clipboard items (for actual image data)
    if (navigator.clipboard && navigator.clipboard.read) {
      const clipboardItems = await navigator.clipboard.read();
      const imageProcessed = await readClipboardImageData(
        clipboardItems,
        creators.createImageComponentAtMouse
      );

      if (imageProcessed) return;
    }

    // Fallback: try to process text for various URL types and rich text
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

// Store last known clipboard text to detect changes
let lastKnownClipboardText: string | null = null;
let lastCopySource: "internal" | "external" | null = null;

/**
 * Marks that content was copied from within the whiteboard
 */
export const markInternalCopy = async (): Promise<void> => {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      lastKnownClipboardText = await navigator.clipboard.readText();
    }
    lastCopySource = "internal";
    clipboardLogger.debug("Marked internal copy", {
      clipboardText: lastKnownClipboardText?.substring(0, 50) + "...",
    });
  } catch {
    // If we can't read clipboard, just mark as internal
    lastCopySource = "internal";
    lastKnownClipboardText = null;
    clipboardLogger.debug("Marked internal copy (no clipboard access)");
  }
};

/**
 * Checks if the clipboard content has changed since last internal copy
 */
export const hasClipboardChangedExternally = async (): Promise<boolean> => {
  try {
    const currentClipboardText = await navigator.clipboard.readText();

    // If we never recorded an internal copy, don't assume external change
    if (lastCopySource !== "internal") {
      return false;
    }

    // If we don't have a last known text but we had an internal copy, something changed
    if (lastKnownClipboardText === null) {
      return false; // Be conservative - don't assume external change
    }

    // If the text has changed and the last copy was internal, it's external
    if (currentClipboardText !== lastKnownClipboardText) {
      lastKnownClipboardText = currentClipboardText;
      lastCopySource = "external";
      return true;
    }

    return false;
  } catch {
    // If we can't read clipboard, assume no change
    return false;
  }
};

/**
 * Clears the clipboard tracking state
 */
export const clearClipboardTracking = (): void => {
  lastKnownClipboardText = null;
  lastCopySource = null;
};

/**
 * Clears copied components when they are no longer valid (e.g., deleted)
 */
export const clearCopiedComponentsIfInvalid = (
  copiedComponents: Component[],
  currentComponents: Component[],
  setCopiedComponents: React.Dispatch<React.SetStateAction<Component[]>>
): void => {
  if (copiedComponents.length === 0) return;

  // Check if any of the copied components no longer exist
  const invalidComponents = copiedComponents.filter(
    (copied) => !currentComponents.some((current) => current.id === copied.id)
  );

  if (invalidComponents.length > 0) {
    setCopiedComponents([]); // Clear all copied components if any are invalid
    clearClipboardTracking(); // Also clear clipboard tracking
    clipboardLogger.debug(
      "Cleared copied components due to invalid references",
      {
        invalidCount: invalidComponents.length,
      }
    );
  }
};

/**
 * Copies component content to the system clipboard
 */
export const copyComponentContentToClipboard = async (
  component: Component
): Promise<boolean> => {
  try {
    let textToCopy = "";

    switch (component.type) {
      case "text": {
        // For text components, try to copy rich text data that includes styling
        const richTextData = createRichTextData(component);
        if (richTextData) {
          textToCopy = richTextData;
        } else {
          textToCopy = component.text || "";
        }
        break;
      }
      case "youtubeVideo":
        textToCopy = component.youtubeUrl || "";
        break;
      case "soundcloud":
        textToCopy = component.soundcloudUrl || "";
        break;
      case "spotify":
        textToCopy = component.spotifyUrl || "";
        break;
      case "linkPreview":
        textToCopy = component.text || ""; // URL is stored in text field for link previews
        break;
      case "imageShape":
        textToCopy = component.imageSrc || "";
        break;
      case "scrollingtext":
        textToCopy = component.text || "";
        break;
      default:
        // For other components, we don't copy content to clipboard
        return false;
    }

    if (textToCopy.trim()) {
      await navigator.clipboard.writeText(textToCopy);
      clipboardLogger.info("Copied component content to system clipboard", {
        componentType: component.type,
        contentLength: textToCopy.length,
        componentId: component.id,
        isRichText:
          component.type === "text" &&
          textToCopy.includes("whiteboardRichText"),
      });
      return true;
    }

    return false;
  } catch (error) {
    clipboardLogger.warn(
      "Failed to copy component content to system clipboard",
      {
        error,
        componentType: component.type,
        componentId: component.id,
      }
    );
    return false;
  }
};

/**
 * Copies only the content of selected components to system clipboard (not for internal paste)
 */
export const copySelectedComponentsContentOnly = async (
  components: Component[],
  selectedComponents: number[]
): Promise<boolean> => {
  const selectedShapeComponents = getSelectedCopyableComponents(
    components,
    selectedComponents
  );

  if (selectedShapeComponents.length === 1) {
    // For single component, copy its content
    return await copyComponentContentToClipboard(selectedShapeComponents[0]);
  } else if (selectedShapeComponents.length > 1) {
    // For multiple components, copy all their content as separate lines
    const contentItems: string[] = [];

    for (const component of selectedShapeComponents) {
      let content = "";
      switch (component.type) {
        case "text":
          content = component.text || "";
          break;
        case "youtubeVideo":
          content = component.youtubeUrl || "";
          break;
        case "soundcloud":
          content = component.soundcloudUrl || "";
          break;
        case "spotify":
          content = component.spotifyUrl || "";
          break;
        case "linkPreview":
          content = component.text || "";
          break;
        case "imageShape":
          content = component.imageSrc || "";
          break;
        case "scrollingtext":
          content = component.text || "";
          break;
      }

      if (content.trim()) {
        contentItems.push(content.trim());
      }
    }

    if (contentItems.length > 0) {
      try {
        await navigator.clipboard.writeText(contentItems.join("\n"));
        clipboardLogger.info(
          "Copied multiple components content to system clipboard",
          {
            componentCount: selectedShapeComponents.length,
            contentItemCount: contentItems.length,
          }
        );
        return true;
      } catch (error) {
        clipboardLogger.warn("Failed to copy multiple components content", {
          error,
        });
        return false;
      }
    }
  }

  return false;
};

/**
 * Extracts styling information from a text component
 */
export const extractTextStyling = (
  component: Component
): Partial<Component> => {
  const styling: Partial<Component> = {};

  // Extract text-specific styling
  if (component.fontSize) styling.fontSize = component.fontSize;
  if (component.fontFamily) styling.fontFamily = component.fontFamily;
  if (component.textColor) styling.textColor = component.textColor;
  if (component.textAlign) styling.textAlign = component.textAlign;
  if (component.fontWeight) styling.fontWeight = component.fontWeight;
  if (component.fontStyle) styling.fontStyle = component.fontStyle;

  // Extract shape styling that might apply to text components
  if (component.fillColor) styling.fillColor = component.fillColor;
  if (component.strokeColor) styling.strokeColor = component.strokeColor;
  if (component.strokeWidth) styling.strokeWidth = component.strokeWidth;
  if (component.borderRadius) styling.borderRadius = component.borderRadius;

  // Extract dimensions
  if (component.width) styling.width = component.width;
  if (component.height) styling.height = component.height;

  return styling;
};

/**
 * Creates a rich text data structure for clipboard operations
 */
export const createRichTextData = (component: Component): string | null => {
  if (component.type !== "text" || !component.text) return null;

  const styling = extractTextStyling(component);

  // Create a rich text data object that can be stored in clipboard
  const richTextData = {
    text: component.text,
    styling: styling,
    type: "whiteboardRichText",
    version: "1.0",
  };

  return JSON.stringify(richTextData);
};

/**
 * Parses rich text data from clipboard
 */
export const parseRichTextData = (
  clipboardText: string
): { text: string; styling: Partial<Component> } | null => {
  try {
    const data = JSON.parse(clipboardText);
    if (data.type === "whiteboardRichText" && data.text && data.styling) {
      return {
        text: data.text,
        styling: data.styling,
      };
    }
  } catch {
    // Not valid JSON or not our rich text format
  }
  return null;
};

/**
 * Creates rich component data for clipboard operations (multiple components)
 */
export const createRichComponentData = (components: Component[]): string => {
  const richComponentData = {
    components: components.map((comp) => ({
      ...comp,
      // Remove position data - will be recalculated on paste
      x: comp.x,
      y: comp.y,
      id: comp.id, // Keep original ID for reference, will be regenerated on paste
    })),
    type: "whiteboardComponents",
    version: "1.0",
    timestamp: Date.now(),
  };

  return JSON.stringify(richComponentData);
};

/**
 * Parses rich component data from clipboard
 */
export const parseRichComponentData = (
  clipboardText: string
): Component[] | null => {
  try {
    const data = JSON.parse(clipboardText);
    if (
      data.type === "whiteboardComponents" &&
      data.components &&
      Array.isArray(data.components)
    ) {
      return data.components;
    }
  } catch {
    // Not valid JSON or not our component format
  }
  return null;
};
