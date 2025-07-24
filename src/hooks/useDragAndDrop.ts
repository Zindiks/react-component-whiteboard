/**
 * Drag and Drop Hook
 *
 * This hook provides comprehensive drag and drop functionality for the whiteboard.
 * It handles file drops, URL drops, component drops from sidebar, and various
 * media types (images, YouTube, SoundCloud, Spotify).
 */

import { useEffect } from "react";
import * as d3 from "d3";
import { getNextComponentId, getMaxZIndex } from "../utils/idUtils";
import { Component } from "../types/whiteboard";
import {
  isYouTubeUrl,
  isSoundCloudUrl,
  isSpotifyUrl,
} from "../utils/urlDetection";
import {
  COMPONENT_SIZES,
  DRAG_PREVIEW_CONSTANTS,
} from "../constants/appConstants";
import { dragDropLogger } from "../utils/componentLoggers";

export interface UseDragAndDropProps {
  transform: d3.ZoomTransform;
  components: Component[];
  setComponents: React.Dispatch<React.SetStateAction<Component[]>>;
  setIsDragOverBoard: (isDragOver: boolean) => void;
  setDragType: (type: "component" | "image" | null) => void;
  addNewComponent: (type: string, x: number, y: number) => void;
  setDragPreviewData: (data: {
    isVisible: boolean;
    componentType: string | null;
    mousePosition: { x: number; y: number };
  }) => void;
}

export const useDragAndDrop = ({
  transform,
  components,
  setComponents,
  setIsDragOverBoard,
  setDragType,
  addNewComponent,
  setDragPreviewData,
}: UseDragAndDropProps) => {
  useEffect(() => {
    const handleDragOver = (event: DragEvent) => {
      // Always prevent default to allow drops
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "copy";
      }

      // Set drag over state
      setIsDragOverBoard(true);

      // Check for component drag from sidebar
      if (
        event.dataTransfer &&
        event.dataTransfer.types.includes("text/plain")
      ) {
        setDragType("component");

        try {
          const componentType = event.dataTransfer.getData("text/plain");

          if (componentType) {
            setDragPreviewData({
              isVisible: true,
              componentType,
              mousePosition: { x: event.clientX, y: event.clientY },
            });
            return;
          }
        } catch {
          // Fallback for browsers that don't allow data access during dragover
          setDragPreviewData({
            isVisible: true,
            componentType: "timer",
            mousePosition: { x: event.clientX, y: event.clientY },
          });
          return;
        }
      }

      // Handle other drag types
      if (event.dataTransfer && event.dataTransfer.types.includes("Files")) {
        setDragType("image");
        setDragPreviewData({
          isVisible: true,
          componentType: "imageShape",
          mousePosition: { x: event.clientX, y: event.clientY },
        });
      } else {
        setDragType("image");
        setDragPreviewData({
          isVisible: true,
          componentType: "imageShape",
          mousePosition: { x: event.clientX, y: event.clientY },
        });
      }
    };

    const handleDragLeave = (event: DragEvent) => {
      if (
        !event.relatedTarget ||
        !(event.relatedTarget as Element).closest("[data-drop-zone]")
      ) {
        setIsDragOverBoard(false);
        setDragType(null);
        setDragPreviewData({
          isVisible: false,
          componentType: null,
          mousePosition: { x: 0, y: 0 },
        });
      }
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      setIsDragOverBoard(false);
      setDragType(null);

      // Clear drag preview
      setDragPreviewData({
        isVisible: false,
        componentType: null,
        mousePosition: { x: 0, y: 0 },
      });

      // Handle image file drops from outside browser (files) - check first
      const files = Array.from(event.dataTransfer?.files || []);
      const imageFile = files.find((file) => file.type.startsWith("image/"));

      if (imageFile) {
        // Convert screen coordinates to whiteboard coordinates
        const x = (event.clientX - transform.x) / transform.k;
        const y = (event.clientY - transform.y) / transform.k;

        // Read the file as data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageSrc = e.target?.result as string;

          // Create a temporary image to get natural dimensions
          const tempImg = new Image();
          tempImg.onload = () => {
            const naturalWidth = tempImg.naturalWidth;
            const naturalHeight = tempImg.naturalHeight;

            // Scale down if the image is too large
            const maxSize = 400; // Maximum dimension
            let width = naturalWidth;
            let height = naturalHeight;

            if (width > maxSize || height > maxSize) {
              const ratio = Math.min(maxSize / width, maxSize / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }

            createImageComponent(x, y, imageSrc, width, height);
          };

          tempImg.onerror = () => {
            dragDropLogger.error(
              "Failed to load image for dimension calculation",
              { imageSrc }
            );
            // Fallback to default size
            createImageComponent(
              x,
              y,
              imageSrc,
              COMPONENT_SIZES.DEFAULT_WIDTH,
              COMPONENT_SIZES.DEFAULT_HEIGHT
            );
          };

          tempImg.src = imageSrc;
        };

        reader.readAsDataURL(imageFile);
        return;
      }

      // Handle image URL drops from browser (drag from web pages)
      const urlData = event.dataTransfer?.getData("text/uri-list");
      const htmlData = event.dataTransfer?.getData("text/html");
      const plainData = event.dataTransfer?.getData("text/plain");

      if (urlData || htmlData || plainData) {
        let extractedUrl = "";

        if (urlData) {
          // Direct URL drag
          extractedUrl = urlData.split("\n")[0]; // Take first URL if multiple
        } else if (plainData && /^https?:\/\//.test(plainData.trim())) {
          // Plain text URL drag
          extractedUrl = plainData.trim();
        }

        // Check for media URLs first (YouTube, SoundCloud, Spotify)
        if (extractedUrl) {
          const x = (event.clientX - transform.x) / transform.k;
          const y = (event.clientY - transform.y) / transform.k;

          if (isYouTubeUrl(extractedUrl)) {
            createMediaComponent(x, y, extractedUrl, "youtubeVideo");
            return;
          }

          if (isSoundCloudUrl(extractedUrl)) {
            createMediaComponent(x, y, extractedUrl, "soundcloud");
            return;
          }

          if (isSpotifyUrl(extractedUrl)) {
            createMediaComponent(x, y, extractedUrl, "spotify");
            return;
          }
        }

        // If not a media URL, check for image URLs
        let imageUrl = extractedUrl;

        if (!imageUrl && htmlData) {
          // HTML drag - extract image src from img tag
          const imgMatch = htmlData.match(/<img[^>]+src=["']([^"']+)["']/i);
          if (imgMatch) {
            imageUrl = imgMatch[1];
          } else {
            // Try to extract any URL that might be an image from the HTML
            const urlMatch = htmlData.match(/https?:\/\/[^\s"'<>]+/g);
            if (urlMatch) {
              for (const url of urlMatch) {
                if (
                  /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i.test(url)
                ) {
                  imageUrl = url;
                  break;
                }
              }
            }
          }
        } else if (plainData && /^https?:\/\//.test(plainData.trim())) {
          // Plain text URL drag
          imageUrl = plainData.trim();
        }

        // Check if it's likely an image URL
        const isImageUrl =
          imageUrl &&
          (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|tif)(\?.*)?$/i.test(
            imageUrl
          ) ||
            imageUrl.includes("image") ||
            imageUrl.includes("img") ||
            imageUrl.includes("photo") ||
            imageUrl.includes("pic") ||
            // Check for common image hosting domains
            /\.(unsplash|pexels|pixabay|imgur|flickr|googleusercontent|amazonaws)\./.test(
              imageUrl
            ) ||
            // Check for data URLs
            imageUrl.startsWith("data:image/"));

        if (isImageUrl) {
          // Convert screen coordinates to whiteboard coordinates
          const x = (event.clientX - transform.x) / transform.k;
          const y = (event.clientY - transform.y) / transform.k;

          // Create a temporary image to get natural dimensions
          const tempImg = new Image();
          tempImg.onload = () => {
            const naturalWidth = tempImg.naturalWidth;
            const naturalHeight = tempImg.naturalHeight;

            // Scale down if the image is too large
            const maxSize = 400; // Maximum dimension
            let width = naturalWidth;
            let height = naturalHeight;

            if (width > maxSize || height > maxSize) {
              const ratio = Math.min(maxSize / width, maxSize / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }

            createImageComponent(x, y, imageUrl, width, height);
          };

          tempImg.onerror = () => {
            dragDropLogger.error(
              "Failed to load image URL for dimension calculation",
              { imageUrl }
            );
            // Fallback to default size
            createImageComponent(
              x,
              y,
              imageUrl,
              COMPONENT_SIZES.DEFAULT_WIDTH,
              COMPONENT_SIZES.DEFAULT_HEIGHT
            );
          };

          tempImg.crossOrigin = "anonymous"; // Try to handle CORS
          tempImg.src = imageUrl;
        }
      }

      // Handle component drops from sidebar (only if no files/URLs detected)
      const componentType = event.dataTransfer?.getData("text/plain");
      if (
        componentType &&
        !event.dataTransfer?.types.includes("text/html") &&
        !event.dataTransfer?.types.includes("text/uri-list") &&
        !event.dataTransfer?.types.includes("Files")
      ) {
        // This is likely a component drag from our sidebar

        // Convert screen coordinates to whiteboard coordinates
        const x = (event.clientX - transform.x) / transform.k;
        const y = (event.clientY - transform.y) / transform.k;

        // Get component dimensions for centering
        const previewSizes = DRAG_PREVIEW_CONSTANTS.PREVIEW_SIZES;
        const componentDimensions =
          previewSizes[componentType as keyof typeof previewSizes] ||
          previewSizes.timer;

        // Center the component on the mouse cursor (matching preview behavior)
        const centeredX = x - componentDimensions.width / 2;
        const centeredY = y - componentDimensions.height / 2;

        addNewComponent(componentType, centeredX, centeredY);
        return;
      }
    };

    const createImageComponent = (
      x: number,
      y: number,
      imageSrc: string,
      width: number,
      height: number
    ) => {
      const newId = getNextComponentId(components);
      const highestZIndex = getMaxZIndex(components);

      const newComponent: Component = {
        id: newId,
        x: x - width / 2, // Center the component on mouse cursor
        y: y - height / 2,
        type: "imageShape",
        width,
        height,
        zIndex: highestZIndex + 1,
        imageSrc,
      };

      setComponents((prev) => [...prev, newComponent]);
    };

    const createMediaComponent = (
      x: number,
      y: number,
      url: string,
      type: "youtubeVideo" | "soundcloud" | "spotify"
    ) => {
      const newId = getNextComponentId(components);
      const highestZIndex = getMaxZIndex(components);

      // Default dimensions for different media types
      let width: number, height: number;
      switch (type) {
        case "youtubeVideo":
          width = 400;
          height = 300;
          break;
        case "soundcloud":
        case "spotify":
          width = 400;
          height = 200;
          break;
      }

      const newComponent: Component = {
        id: newId,
        x: x - width / 2, // Center the component
        y: y - height / 2,
        type,
        width,
        height,
        zIndex: highestZIndex + 1,
        ...(type === "youtubeVideo" && { youtubeUrl: url }),
        ...(type === "soundcloud" && { soundcloudUrl: url }),
        ...(type === "spotify" && { spotifyUrl: url }),
      };

      setComponents((prev) => [...prev, newComponent]);
    };

    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("drop", handleDrop);
    };
  }, [
    transform,
    components,
    setComponents,
    setIsDragOverBoard,
    setDragType,
    addNewComponent,
    setDragPreviewData,
  ]);
};
