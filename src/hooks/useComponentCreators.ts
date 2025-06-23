import { useCallback } from "react";
import * as d3 from "d3";
import { Component } from "../types/whiteboard";

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
          const maxSize = 400; // Maximum dimension
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
          console.error("Failed to load image from URL:", imageSrc);
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
            width: 200,
            height: 150,
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
      const width = 400;
      const height = 300; // 400 * 3/4 = 300

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
      console.log(`Created YouTube video component from URL: ${youtubeUrl}`);
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
      const width = 400;
      const height = 200;

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
      console.log(`Created SoundCloud component from URL: ${soundcloudUrl}`);
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
      const width = 400;
      const height = 200;

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
      console.log(`Created Spotify component from URL: ${spotifyUrl}`);
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

  return {
    createImageComponentAtMouse,
    createYouTubeComponentAtMouse,
    createSoundCloudComponentAtMouse,
    createSpotifyComponentAtMouse,
  };
};
