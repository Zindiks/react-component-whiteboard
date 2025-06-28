/**
 * Drag and Drop Hook
 *
 * This hook provides comprehensive drag and drop functionality for the whiteboard.
 * It handles file drops, URL drops, component drops from sidebar, and various
 * media types (images, YouTube, SoundCloud, Spotify).
 */

import { useEffect } from "react";
import { ZoomTransform } from "d3-zoom";
import { Component } from "../types/whiteboard";
import {
  isYouTubeUrl,
  isSoundCloudUrl,
  isSpotifyUrl,
} from "../utils/urlDetection";
import { COMPONENT_SIZES } from "../constants/appConstants";
import { dragDropLogger } from "../utils/componentLoggers";

export interface UseDragAndDropProps {
  transform: ZoomTransform;
  components: Component[];
  setComponents: React.Dispatch<React.SetStateAction<Component[]>>;
  setIsDragOverBoard: (isDragOver: boolean) => void;
  setDragType: (type: "component" | "image" | null) => void;
  addNewComponent: (type: string, x: number, y: number) => void;
}

export const useDragAndDrop = ({
  transform,
  components,
  setComponents,
  setIsDragOverBoard,
  setDragType,
  addNewComponent,
}: UseDragAndDropProps) => {
  useEffect(() => {
    const handleDragOver = (event: DragEvent) => {
      // Allow image file drops from outside browser (check files first)
      if (event.dataTransfer?.types.includes("Files")) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setIsDragOverBoard(true);
        setDragType("image");
        return;
      }

      // Allow image URL drops from browser (check URLs second)
      if (
        event.dataTransfer?.types.includes("text/uri-list") ||
        event.dataTransfer?.types.includes("text/html")
      ) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setIsDragOverBoard(true);
        setDragType("image");
        return;
      }

      // Check for component drops from sidebar (only text/plain without other types)
      if (
        event.dataTransfer?.types.includes("text/plain") &&
        !event.dataTransfer?.types.includes("text/html") &&
        !event.dataTransfer?.types.includes("text/uri-list") &&
        !event.dataTransfer?.types.includes("Files")
      ) {
        // This is likely a component drag from our sidebar
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setIsDragOverBoard(true);
        setDragType("component");
        return;
      }

      // Check for plain text URLs (like dragging from address bar)
      if (
        event.dataTransfer?.types.includes("text/plain") &&
        event.dataTransfer?.types.length === 1
      ) {
        // Try to get the plain text to see if it's a URL
        try {
          const plainText = event.dataTransfer.getData("text/plain");
          if (plainText && /^https?:\/\//.test(plainText.trim())) {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
            setIsDragOverBoard(true);
            setDragType("image");
            return;
          }
        } catch {
          // Can't access data during dragover in some browsers
        }
      }

      // Log if we don't handle this drag type (optional debug)
      // const types = Array.from(event.dataTransfer?.types || []);
      // if (types.length > 0) {
      //   console.log("❌ Unhandled drag type:", types);
      // }
    };

    const handleDragLeave = (event: DragEvent) => {
      if (
        !event.relatedTarget ||
        !(event.relatedTarget as Element).closest("[data-drop-zone]")
      ) {
        setIsDragOverBoard(false);
        setDragType(null);
      }
    };

    const createImageComponent = (
      x: number,
      y: number,
      imageSrc: string,
      width: number,
      height: number
    ) => {
      const newId = Math.max(...components.map((c) => c.id), 0) + 1;
      const highestZIndex = Math.max(
        ...components.map((c) => c.zIndex || 0),
        0
      );

      const newComponent: Component = {
        id: newId,
        x,
        y,
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
      const newId = Math.max(...components.map((c) => c.id), 0) + 1;
      const highestZIndex = Math.max(
        ...components.map((c) => c.zIndex || 0),
        0
      );

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

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      setIsDragOverBoard(false);
      setDragType(null);

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
        addNewComponent(componentType, x, y);
        return;
      }
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
  ]);
};
