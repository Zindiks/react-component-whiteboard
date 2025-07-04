import { useCallback } from "react";
import * as d3 from "d3";
import { Component } from "../types/whiteboard";
import { COMPONENT_SIZES } from "../constants/appConstants";
import { widgetLogger } from "../utils/componentLoggers";

interface UseComponentCreatorsProps {
  components: Component[];
  setComponents: React.Dispatch<React.SetStateAction<Component[]>>;
  setSelectedComponents: (components: number[]) => void;
  mousePosition: { x: number; y: number };
  transform: d3.ZoomTransform;
}

export const useComponentCreators = ({
  components,
  setComponents,
  setSelectedComponents,
  mousePosition,
  transform,
}: UseComponentCreatorsProps) => {
  const createImageComponentAtMouse = useCallback(
    async (imageSrc: string): Promise<void> => {
      return new Promise((resolve) => {
        // Create a temporary image to get natural dimensions
        const tempImg = new Image();
        tempImg.onload = () => {
          const naturalWidth = tempImg.naturalWidth;
          const naturalHeight = tempImg.naturalHeight;

          // Scale down if the image is too large
          const maxSize = COMPONENT_SIZES.MAX_IMAGE_SIZE; // Maximum dimension
          let width = naturalWidth;
          let height = naturalHeight;

          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // Convert screen coordinates to whiteboard coordinates and center on mouse position
          const whiteboardX =
            (mousePosition.x - transform.x) / transform.k - width / 2;
          const whiteboardY =
            (mousePosition.y - transform.y) / transform.k - height / 2;

          // Create a new imageShape component at mouse position
          const newId = Math.max(...components.map((c) => c.id), 0) + 1;
          const highestZIndex = Math.max(
            ...components.map((c) => c.zIndex || 0),
            0
          );

          const newComponent: Component = {
            id: newId,
            x: whiteboardX,
            y: whiteboardY,
            type: "imageShape",
            width,
            height,
            zIndex: highestZIndex + 1,
            imageSrc,
          };

          setComponents((prev) => [...prev, newComponent]);
          setSelectedComponents([newId]); // Select the new component
          resolve();
        };

        tempImg.onerror = () => {
          widgetLogger.error("Failed to load image from URL", {
            imageUrl: imageSrc,
          });
          // Fallback to default size with whiteboard coordinates
          const whiteboardX =
            (mousePosition.x - transform.x) / transform.k - 100;
          const whiteboardY =
            (mousePosition.y - transform.y) / transform.k - 75;

          const newId = Math.max(...components.map((c) => c.id), 0) + 1;
          const highestZIndex = Math.max(
            ...components.map((c) => c.zIndex || 0),
            0
          );

          const newComponent: Component = {
            id: newId,
            x: whiteboardX,
            y: whiteboardY,
            type: "imageShape",
            width: COMPONENT_SIZES.IMAGE_FALLBACK_WIDTH,
            height: COMPONENT_SIZES.IMAGE_FALLBACK_HEIGHT,
            zIndex: highestZIndex + 1,
            imageSrc,
          };

          setComponents((prev) => [...prev, newComponent]);
          setSelectedComponents([newId]); // Select the new component
          resolve();
        };

        // Set CORS mode for external images
        tempImg.crossOrigin = "anonymous";
        tempImg.src = imageSrc;
      });
    },
    [
      components,
      mousePosition.x,
      mousePosition.y,
      transform,
      setComponents,
      setSelectedComponents,
    ]
  );

  // Helper function to create a YouTube component at mouse position
  const createYouTubeComponentAtMouse = useCallback(
    (youtubeUrl: string): void => {
      // Default size for YouTube videos (4:3 aspect ratio)
      const width = COMPONENT_SIZES.YOUTUBE_WIDTH;
      const height = COMPONENT_SIZES.YOUTUBE_HEIGHT;

      // Convert screen coordinates to whiteboard coordinates and center on mouse position
      const whiteboardX =
        (mousePosition.x - transform.x) / transform.k - width / 2;
      const whiteboardY =
        (mousePosition.y - transform.y) / transform.k - height / 2;

      // Create a new YouTube component at mouse position
      const newId = Math.max(...components.map((c) => c.id), 0) + 1;
      const highestZIndex = Math.max(
        ...components.map((c) => c.zIndex || 0),
        0
      );

      const newComponent: Component = {
        id: newId,
        x: whiteboardX,
        y: whiteboardY,
        type: "youtubeVideo",
        width,
        height,
        zIndex: highestZIndex + 1,
        youtubeUrl, // Store the URL for the component
      };

      setComponents((prev) => [...prev, newComponent]);
      setSelectedComponents([newId]); // Select the new component
      widgetLogger.info("Created YouTube video component", {
        componentId: newId,
        youtubeUrl,
        position: { x: whiteboardX, y: whiteboardY },
      });
    },
    [
      components,
      mousePosition.x,
      mousePosition.y,
      transform,
      setComponents,
      setSelectedComponents,
    ]
  );

  // Helper function to create a SoundCloud component at mouse position
  const createSoundCloudComponentAtMouse = useCallback(
    (soundcloudUrl: string): void => {
      // Default size for SoundCloud widgets
      const width = COMPONENT_SIZES.SOUNDCLOUD_WIDTH;
      const height = COMPONENT_SIZES.SOUNDCLOUD_HEIGHT;

      // Convert screen coordinates to whiteboard coordinates and center on mouse position
      const whiteboardX =
        (mousePosition.x - transform.x) / transform.k - width / 2;
      const whiteboardY =
        (mousePosition.y - transform.y) / transform.k - height / 2;

      // Create a new SoundCloud component at mouse position
      const newId = Math.max(...components.map((c) => c.id), 0) + 1;
      const highestZIndex = Math.max(
        ...components.map((c) => c.zIndex || 0),
        0
      );

      const newComponent: Component = {
        id: newId,
        x: whiteboardX,
        y: whiteboardY,
        type: "soundcloud",
        width,
        height,
        zIndex: highestZIndex + 1,
        soundcloudUrl, // Store the URL for the component
      };

      setComponents((prev) => [...prev, newComponent]);
      setSelectedComponents([newId]); // Select the new component
      widgetLogger.info("Created SoundCloud component", {
        componentId: newId,
        soundcloudUrl,
        position: { x: whiteboardX, y: whiteboardY },
      });
    },
    [
      components,
      mousePosition.x,
      mousePosition.y,
      transform,
      setComponents,
      setSelectedComponents,
    ]
  );

  // Helper function to create a Spotify component at mouse position
  const createSpotifyComponentAtMouse = useCallback(
    (spotifyUrl: string): void => {
      // Default size for Spotify widgets
      const width = COMPONENT_SIZES.SPOTIFY_WIDTH;
      const height = COMPONENT_SIZES.SPOTIFY_HEIGHT;

      // Convert screen coordinates to whiteboard coordinates and center on mouse position
      const whiteboardX =
        (mousePosition.x - transform.x) / transform.k - width / 2;
      const whiteboardY =
        (mousePosition.y - transform.y) / transform.k - height / 2;

      // Create a new Spotify component at mouse position
      const newId = Math.max(...components.map((c) => c.id), 0) + 1;
      const highestZIndex = Math.max(
        ...components.map((c) => c.zIndex || 0),
        0
      );

      const newComponent: Component = {
        id: newId,
        x: whiteboardX,
        y: whiteboardY,
        type: "spotify",
        width,
        height,
        zIndex: highestZIndex + 1,
        spotifyUrl, // Store the URL for the component
      };

      setComponents((prev) => [...prev, newComponent]);
      setSelectedComponents([newId]); // Select the new component
      widgetLogger.info("Created Spotify component", {
        componentId: newId,
        spotifyUrl,
        position: { x: whiteboardX, y: whiteboardY },
      });
    },
    [
      components,
      mousePosition.x,
      mousePosition.y,
      transform,
      setComponents,
      setSelectedComponents,
    ]
  );

  // Helper function to create a LinkPreview component at mouse position
  const createLinkPreviewComponentAtMouse = useCallback(
    (url: string): void => {
      // Convert screen coordinates to whiteboard coordinates and center on mouse position
      const width = COMPONENT_SIZES.LINK_PREVIEW_WIDTH;
      const height = COMPONENT_SIZES.LINK_PREVIEW_HEIGHT;
      const whiteboardX =
        (mousePosition.x - transform.x) / transform.k - width / 2;
      const whiteboardY =
        (mousePosition.y - transform.y) / transform.k - height / 2;

      const newId = Math.max(...components.map((c) => c.id), 0) + 1;
      const highestZIndex = Math.max(
        ...components.map((c) => c.zIndex || 0),
        0
      );

      const newComponent: Component = {
        id: newId,
        x: whiteboardX,
        y: whiteboardY,
        type: "linkpreview",
        width,
        height,
        zIndex: highestZIndex + 1,
        text: url, // Store URL in text field
      };

      setComponents((prev) => [...prev, newComponent]);
      setSelectedComponents([newId]); // Select the new component
    },
    [
      components,
      mousePosition.x,
      mousePosition.y,
      transform,
      setComponents,
      setSelectedComponents,
    ]
  );
  const createTextComponentAtMouse = useCallback(
    (text: string, styling?: Partial<Component>): void => {
      // Convert screen coordinates to whiteboard coordinates and center on mouse position
      const defaultWidth = COMPONENT_SIZES.DEFAULT_WIDTH;
      const defaultHeight = 100; // A reasonable height for text components

      const whiteboardX =
        (mousePosition.x - transform.x) / transform.k - defaultWidth / 2;
      const whiteboardY =
        (mousePosition.y - transform.y) / transform.k - defaultHeight / 2;

      // Create a new text component at mouse position
      const newId = Math.max(...components.map((c) => c.id), 0) + 1;
      const highestZIndex = Math.max(
        ...components.map((c) => c.zIndex || 0),
        0
      );

      const newComponent: Component = {
        id: newId,
        x: whiteboardX,
        y: whiteboardY,
        type: "text",
        width: styling?.width || defaultWidth,
        height: styling?.height || defaultHeight,
        zIndex: highestZIndex + 1,
        text: text.trim(),
        // Use provided styling or defaults
        fontSize: styling?.fontSize || 14,
        fontFamily: styling?.fontFamily || "Arial, sans-serif",
        textColor: styling?.textColor || "#374151",
        textAlign: styling?.textAlign || "left",
        fontWeight: styling?.fontWeight || "normal",
        fontStyle: styling?.fontStyle || "normal",
        // Include any other styling properties
        fillColor: styling?.fillColor,
        strokeColor: styling?.strokeColor,
        strokeWidth: styling?.strokeWidth,
        borderRadius: styling?.borderRadius,
      };

      setComponents((prev) => [...prev, newComponent]);
      setSelectedComponents([newId]); // Select the new component

      widgetLogger.info("Created text component from clipboard", {
        componentId: newId,
        textLength: text.length,
        position: { x: whiteboardX, y: whiteboardY },
        hasCustomStyling: !!styling,
      });
    },
    [components, mousePosition, transform, setComponents, setSelectedComponents]
  );

  const createShapeComponentAtMouse = useCallback(
    (shapeType: string, styling?: Partial<Component>): void => {
      // Convert screen coordinates to whiteboard coordinates and center on mouse position
      const defaultWidth = styling?.width || COMPONENT_SIZES.DEFAULT_WIDTH;
      const defaultHeight = styling?.height || COMPONENT_SIZES.DEFAULT_HEIGHT;

      const whiteboardX =
        (mousePosition.x - transform.x) / transform.k - defaultWidth / 2;
      const whiteboardY =
        (mousePosition.y - transform.y) / transform.k - defaultHeight / 2;

      // Create a new shape component at mouse position
      const newId = Math.max(...components.map((c) => c.id), 0) + 1;
      const highestZIndex = Math.max(
        ...components.map((c) => c.zIndex || 0),
        0
      );

      const newComponent: Component = {
        // Start with provided styling
        ...styling,
        // Override with required properties
        id: newId,
        x: whiteboardX,
        y: whiteboardY,
        type: shapeType,
        width: defaultWidth,
        height: defaultHeight,
        zIndex: highestZIndex + 1,
      };

      setComponents((prev) => [...prev, newComponent]);
      setSelectedComponents([newId]); // Select the new component

      widgetLogger.info("Created shape component from clipboard", {
        componentId: newId,
        shapeType: shapeType,
        position: { x: whiteboardX, y: whiteboardY },
        hasCustomStyling: !!styling,
      });
    },
    [components, mousePosition, transform, setComponents, setSelectedComponents]
  );

  return {
    createImageComponentAtMouse,
    createYouTubeComponentAtMouse,
    createSoundCloudComponentAtMouse,
    createSpotifyComponentAtMouse,
    createLinkPreviewComponentAtMouse,
    createTextComponentAtMouse,
    createShapeComponentAtMouse,
  };
};
