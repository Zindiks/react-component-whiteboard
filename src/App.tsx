import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { Plus, Minus } from "lucide-react";
import { Button } from "./components/ui/button";
import { ComponentFooter } from "./components/ComponentFooter";
import { CategorySidebar } from "./components/CategorySidebar";
import { DraggableComponent } from "./components/DraggableWhiteboardComponent";

interface ComponentDefinition {
  type: string;
  label: string;
  icon: string;
  description: string;
}

interface Category {
  name: string;
  icon: string;
  components: ComponentDefinition[];
}

const COMPONENT_CATEGORIES: Category[] = [
  {
    name: "Utilities",
    icon: "⚙️",
    components: [
      {
        type: "timer",
        label: "Timer",
        icon: "⏰",
        description: "Countdown timer",
      },
      {
        type: "watch",
        label: "Watch",
        icon: "⌚",
        description: "Digital clock",
      },
      {
        type: "note",
        label: "Note",
        icon: "📝",
        description: "Markdown text editor",
      },
      {
        type: "confetti",
        label: "Confetti",
        icon: "🎉",
        description: "Celebration button",
      },
    ],
  },
  {
    name: "Data & Finance",
    icon: "📊",
    components: [
      {
        type: "weather",
        label: "Weather",
        icon: "🌤️",
        description: "Weather widget",
      },
      {
        type: "bitcoin",
        label: "Crypto Chart",
        icon: "💰",
        description: "Cryptocurrency prices",
      },
      {
        type: "currency",
        label: "Currency",
        icon: "💱",
        description: "Currency converter",
      },
    ],
  },
  {
    name: "Media",
    icon: "🎵",
    components: [
      {
        type: "youtubeVideo",
        label: "YouTube",
        icon: "🎬",
        description: "YouTube video player",
      },
      {
        type: "soundcloud",
        label: "SoundCloud",
        icon: "🔊",
        description: "SoundCloud track",
      },
      {
        type: "spotify",
        label: "Spotify",
        icon: "🎵",
        description: "Spotify player",
      },
      {
        type: "scrollingtext",
        label: "Scrolling Text",
        icon: "📣",
        description: "Animated text banner",
      },
    ],
  },
  {
    name: "Links & Web",
    icon: "🌐",
    components: [
      {
        type: "stylishlink",
        label: "Stylish Link",
        icon: "🔗",
        description: "Styled web link",
      },
    ],
  },
  {
    name: "Shapes",
    icon: "🔷",
    components: [
      {
        type: "rectangle",
        label: "Rectangle",
        icon: "⬜",
        description: "Rectangle shape",
      },
      {
        type: "ellipse",
        label: "Ellipse",
        icon: "🔵",
        description: "Ellipse/Circle shape",
      },
      {
        type: "arrow",
        label: "Arrow",
        icon: "➡️",
        description: "Arrow line",
      },
      {
        type: "line",
        label: "Line",
        icon: "➖",
        description: "Straight line",
      },
      {
        type: "text",
        label: "Text",
        icon: "📝",
        description: "Text shape",
      },
      {
        type: "imageShape",
        label: "Image",
        icon: "🖼️",
        description: "Image shape",
      },
    ],
  },
];

const CustomGrid = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);

  // Marquee selection state
  const [isMarqueeActive, setIsMarqueeActive] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState({ x: 0, y: 0 });
  const [marqueeEnd, setMarqueeEnd] = useState({ x: 0, y: 0 });

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Zoom indicator state
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const [isActivelyZooming, setIsActivelyZooming] = useState(false);
  const zoomIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousZoomScale = useRef<number>(1);

  // Overview/Minimap state
  const [showOverview, setShowOverview] = useState(false);
  const overviewRef = useRef<HTMLDivElement>(null);

  // Sidebar state
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDragOverBoard, setIsDragOverBoard] = useState(false);
  const [dragType, setDragType] = useState<"component" | "image" | null>(null);

  // Mouse position tracking for paste operations
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [copiedComponents, setCopiedComponents] = useState<Component[]>([]);

  interface Component {
    id: number;
    x: number;
    y: number;
    type: string;
    width?: number;
    height?: number;
    zIndex?: number;
    imageSrc?: string; // For image components
    text?: string; // For text components
    youtubeUrl?: string; // For YouTube video components
    soundcloudUrl?: string; // For SoundCloud components
    spotifyUrl?: string; // For Spotify components
  }

  const [components, setComponents] = useState<Component[]>([
    { id: 1, x: 100, y: 100, type: "timer", zIndex: 1 },
    { id: 2, x: 300, y: 200, type: "weather", zIndex: 2 },
    { id: 3, x: 600, y: 100, type: "bitcoin", zIndex: 3 },
    { id: 4, x: 100, y: 400, type: "currency", zIndex: 4 },
    { id: 5, x: 400, y: 400, type: "confetti", zIndex: 5 },
    { id: 6, x: 700, y: 400, type: "note", zIndex: 6 },
    { id: 7, x: 1000, y: 100, type: "watch", zIndex: 7 },
    { id: 8, x: 1000, y: 400, type: "scrollingtext", zIndex: 8 },
    { id: 9, x: 500, y: 200, type: "youtubeVideo", zIndex: 9 },
    { id: 10, x: 800, y: 200, type: "soundcloud", zIndex: 10 },
    { id: 11, x: 300, y: 600, type: "spotify", zIndex: 11 },
    { id: 12, x: 600, y: 600, type: "stylishlink", zIndex: 12 },
  ]);
  const [selectedComponents, setSelectedComponents] = useState<number[]>([]);
  const [initialPositions, setInitialPositions] = useState<
    { id: number; x: number; y: number }[]
  >([]);

  const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(
    null
  );

  const handleDeleteComponent = useCallback((id: number) => {
    console.log(`Deleting component with ID: ${id}`);
    setComponents((prev) => prev.filter((component) => component.id !== id));
    setSelectedComponents((prev) =>
      prev.filter((selectedId) => selectedId !== id)
    );
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedComponents.length > 0) {
      setComponents((prev) =>
        prev.filter((component) => !selectedComponents.includes(component.id))
      );
      setSelectedComponents([]);
    }
  }, [selectedComponents]);

  // Copy-paste functionality for all shape components
  const handleCopyComponents = useCallback(() => {
    // Shape types that can be copied
    const shapeTypes = [
      "rectangle",
      "ellipse",
      "arrow",
      "line",
      "text",
      "imageShape",
    ];

    // Filter selected components to include all shape types
    const selectedShapeComponents = components.filter(
      (c) => selectedComponents.includes(c.id) && shapeTypes.includes(c.type)
    );

    if (selectedShapeComponents.length > 0) {
      setCopiedComponents(selectedShapeComponents);
      console.log(
        `Copied ${selectedShapeComponents.length} shape component(s)`
      );
    }
  }, [components, selectedComponents]);

  // Helper function to check if a string is likely an image URL
  const isImageUrl = (url: string): boolean => {
    try {
      // Handle data URLs
      if (url.startsWith("data:image/")) {
        return true;
      }

      // Handle blob URLs
      if (url.startsWith("blob:")) {
        return true;
      }

      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();

      // Check for explicit image file extensions
      const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".svg",
        ".bmp",
        ".ico",
        ".tiff",
        ".tif",
        ".avif",
      ];
      if (imageExtensions.some((ext) => pathname.endsWith(ext))) {
        return true;
      }

      // Check for URLs that contain image-related keywords
      const imageKeywords = [
        "image",
        "img",
        "photo",
        "picture",
        "pic",
        "avatar",
        "thumbnail",
        "thumb",
      ];
      if (
        imageKeywords.some((keyword) => url.toLowerCase().includes(keyword))
      ) {
        return true;
      }

      // Check for common image hosting domains
      const imageHosts = [
        "imgur.com",
        "i.imgur.com",
        "unsplash.com",
        "images.unsplash.com",
        "pexels.com",
        "images.pexels.com",
        "pixabay.com",
        "flickr.com",
        "live.staticflickr.com",
        "googleusercontent.com",
        "amazonaws.com",
        "cloudinary.com",
        "githubusercontent.com",
      ];

      if (imageHosts.some((host) => urlObj.hostname.includes(host))) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  // Helper function to extract image URL from HTML content
  const extractImageFromHtml = useCallback(
    (htmlText: string): string | null => {
      try {
        // Create a temporary DOM element to parse HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlText;

        // Look for img tags
        const imgTags = tempDiv.querySelectorAll("img");
        for (const img of imgTags) {
          const src = img.src || img.getAttribute("src");
          if (src && isImageUrl(src)) {
            return src;
          }
        }

        // Look for background images in style attributes
        const elementsWithStyle = tempDiv.querySelectorAll(
          '[style*="background"]'
        );
        for (const element of elementsWithStyle) {
          const style = element.getAttribute("style") || "";
          const backgroundMatch = style.match(
            /background-image:\s*url\(['"]?([^'"]+)['"]?\)/
          );
          if (
            backgroundMatch &&
            backgroundMatch[1] &&
            isImageUrl(backgroundMatch[1])
          ) {
            return backgroundMatch[1];
          }
        }

        // Look for any URLs in the text that might be images
        const urlRegex = /https?:\/\/[^\s"'<>]+/g;
        const urls = htmlText.match(urlRegex);
        if (urls) {
          for (const url of urls) {
            if (isImageUrl(url)) {
              return url;
            }
          }
        }

        return null;
      } catch (error) {
        console.error("Error extracting image from HTML:", error);
        return null;
      }
    },
    []
  );

  // Helper function to create an image component at mouse position
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
    [components, mousePosition.x, mousePosition.y, transform]
  );

  // Helper function to detect YouTube URLs
  const isYouTubeUrl = useCallback((url: string): boolean => {
    if (!url || typeof url !== "string") return false;

    try {
      const urlObj = new URL(url.trim());
      const hostname = urlObj.hostname.toLowerCase();

      // Check for various YouTube URL patterns
      return (
        hostname === "youtube.com" ||
        hostname === "www.youtube.com" ||
        hostname === "youtu.be" ||
        hostname === "m.youtube.com" ||
        hostname === "music.youtube.com" ||
        // Also check for YouTube embeds
        hostname === "youtube-nocookie.com" ||
        hostname === "www.youtube-nocookie.com" ||
        // Check if the URL contains youtube in path for some edge cases
        urlObj.href.includes("youtube.com/watch") ||
        urlObj.href.includes("youtube.com/embed") ||
        urlObj.href.includes("youtu.be/")
      );
    } catch {
      // If URL parsing fails, try simple string matching
      const lowerUrl = url.toLowerCase();
      return (
        lowerUrl.includes("youtube.com/watch") ||
        lowerUrl.includes("youtu.be/") ||
        lowerUrl.includes("youtube.com/embed") ||
        lowerUrl.includes("youtube.com/v/") ||
        lowerUrl.includes("m.youtube.com/watch")
      );
    }
  }, []);

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
    [components, mousePosition.x, mousePosition.y, transform]
  );

  // Helper function to detect SoundCloud URLs
  const isSoundCloudUrl = useCallback((url: string): boolean => {
    if (!url || typeof url !== "string") return false;

    try {
      const urlObj = new URL(url.trim());
      const hostname = urlObj.hostname.toLowerCase();

      // Check for SoundCloud URL patterns
      return (
        hostname === "soundcloud.com" ||
        hostname === "www.soundcloud.com" ||
        hostname === "m.soundcloud.com" ||
        hostname === "on.soundcloud.com" ||
        urlObj.href.includes("soundcloud.com/")
      );
    } catch {
      // If URL parsing fails, try simple string matching
      const lowerUrl = url.toLowerCase();
      return (
        lowerUrl.includes("soundcloud.com/") ||
        lowerUrl.includes("on.soundcloud.com")
      );
    }
  }, []);

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
    [components, mousePosition.x, mousePosition.y, transform]
  );

  // Helper function to detect Spotify URLs
  const isSpotifyUrl = useCallback((url: string): boolean => {
    if (!url || typeof url !== "string") return false;

    try {
      const urlObj = new URL(url.trim());
      const hostname = urlObj.hostname.toLowerCase();

      // Check for Spotify URL patterns
      return (
        hostname === "spotify.com" ||
        hostname === "www.spotify.com" ||
        hostname === "open.spotify.com" ||
        hostname === "play.spotify.com" ||
        urlObj.href.includes("spotify.com/") ||
        // Also check for spotify: protocol links
        url.startsWith("spotify:")
      );
    } catch {
      // If URL parsing fails, try simple string matching
      const lowerUrl = url.toLowerCase();
      return (
        lowerUrl.includes("spotify.com/") ||
        lowerUrl.includes("open.spotify.com") ||
        lowerUrl.startsWith("spotify:")
      );
    }
  }, []);

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
    [components, mousePosition.x, mousePosition.y, transform]
  );

  const handlePasteComponents = useCallback(async () => {
    // If we have copied components, paste them first (prioritize component copy/paste)
    if (copiedComponents.length > 0) {
      const newComponents = copiedComponents.map((component) => {
        const newId =
          Math.max(...components.map((c) => c.id), 0) + 1 + Math.random();
        const highestZIndex = Math.max(
          ...components.map((c) => c.zIndex || 0),
          0
        );

        return {
          ...component,
          id: Math.floor(newId),
          x: (mousePosition.x - transform.x) / transform.k - 50, // Convert screen coords to whiteboard coords and offset slightly
          y: (mousePosition.y - transform.y) / transform.k - 50,
          zIndex: highestZIndex + 1,
        };
      });

      setComponents((prev) => [...prev, ...newComponents]);

      // Select the newly pasted components
      const newIds = newComponents.map((c) => c.id);
      setSelectedComponents(newIds);

      console.log(
        `Pasted ${newComponents.length} shape component(s) at mouse position`
      );
      return;
    }

    // If no copied components, try to paste from clipboard
    try {
      // First, try to read clipboard items (for actual image data)
      if (navigator.clipboard && navigator.clipboard.read) {
        const clipboardItems = await navigator.clipboard.read();

        for (const clipboardItem of clipboardItems) {
          // Check for image data in clipboard
          for (const type of clipboardItem.types) {
            if (type.startsWith("image/")) {
              const imageBlob = await clipboardItem.getType(type);
              const imageSrc = URL.createObjectURL(imageBlob);
              await createImageComponentAtMouse(imageSrc);
              return;
            }
          }

          // Check for HTML content that might contain images
          if (clipboardItem.types.includes("text/html")) {
            const htmlBlob = await clipboardItem.getType("text/html");
            const htmlText = await htmlBlob.text();
            const imageUrl = extractImageFromHtml(htmlText);
            if (imageUrl) {
              await createImageComponentAtMouse(imageUrl);
              return;
            }
          }
        }
      }

      // Fallback: try to read text for YouTube, SoundCloud, Spotify URLs or image URLs
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        // First check for YouTube URLs
        if (isYouTubeUrl(clipboardText)) {
          createYouTubeComponentAtMouse(clipboardText);
          return;
        }
        // Then check for SoundCloud URLs
        if (isSoundCloudUrl(clipboardText)) {
          createSoundCloudComponentAtMouse(clipboardText);
          return;
        }
        // Then check for Spotify URLs
        if (isSpotifyUrl(clipboardText)) {
          createSpotifyComponentAtMouse(clipboardText);
          return;
        }
        // Finally check for image URLs
        if (isImageUrl(clipboardText)) {
          await createImageComponentAtMouse(clipboardText);
          return;
        }
      }
    } catch (error) {
      console.log("Clipboard access failed or no image content found:", error);
    }
  }, [
    copiedComponents,
    components,
    mousePosition.x,
    mousePosition.y,
    transform,
    createImageComponentAtMouse,
    extractImageFromHtml,
    isYouTubeUrl,
    createYouTubeComponentAtMouse,
    isSoundCloudUrl,
    createSoundCloudComponentAtMouse,
    isSpotifyUrl,
    createSpotifyComponentAtMouse,
  ]);

  // Function to force paste image from clipboard (ignoring copied components)
  const handlePasteImageFromClipboard = useCallback(async () => {
    try {
      // Try to read clipboard items (for actual image data)
      if (navigator.clipboard && navigator.clipboard.read) {
        const clipboardItems = await navigator.clipboard.read();

        for (const clipboardItem of clipboardItems) {
          // Check for image data in clipboard
          for (const type of clipboardItem.types) {
            if (type.startsWith("image/")) {
              const imageBlob = await clipboardItem.getType(type);
              const imageSrc = URL.createObjectURL(imageBlob);
              await createImageComponentAtMouse(imageSrc);
              return;
            }
          }

          // Check for HTML content that might contain images
          if (clipboardItem.types.includes("text/html")) {
            const htmlBlob = await clipboardItem.getType("text/html");
            const htmlText = await htmlBlob.text();
            const imageUrl = extractImageFromHtml(htmlText);
            if (imageUrl) {
              await createImageComponentAtMouse(imageUrl);
              return;
            }
          }
        }
      }

      // Fallback: try to read text for image URLs
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && isImageUrl(clipboardText)) {
        await createImageComponentAtMouse(clipboardText);
        return;
      }

      console.log("No image content found in clipboard");
    } catch (error) {
      console.log("Failed to paste image from clipboard:", error);
    }
  }, [createImageComponentAtMouse, extractImageFromHtml]);

  // Enhanced pan and zoom utilities
  const getEventCoordinates = (event: MouseEvent | React.MouseEvent) => ({
    x: event.clientX,
    y: event.clientY,
  });

  const showZoomIndicatorTemporarily = useCallback(() => {
    // Only show for actual zoom gestures, not manual buttons
    setIsActivelyZooming(true);
    setShowZoomIndicator(true);

    // Clear existing timeout
    if (zoomIndicatorTimeoutRef.current) {
      clearTimeout(zoomIndicatorTimeoutRef.current);
    }

    // Set new timeout to hide indicator after 800ms (shorter for better UX)
    zoomIndicatorTimeoutRef.current = setTimeout(() => {
      setIsActivelyZooming(false);
      setShowZoomIndicator(false);
    }, 800);
  }, []);

  const applyTransform = (newTransform: d3.ZoomTransform) => {
    if (!svgRef.current || !zoomBehavior.current) return;
    const svg = d3.select(svgRef.current);
    svg.call(zoomBehavior.current.transform, newTransform);
  };

  const resetZoom = useCallback(() => {
    if (!svgRef.current || !zoomBehavior.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(750)
      .call(zoomBehavior.current.transform, d3.zoomIdentity);
  }, []);

  const zoomToFit = useCallback(() => {
    if (!svgRef.current || !zoomBehavior.current || components.length === 0)
      return;

    const padding = 50;
    const bounds = components.reduce(
      (acc, comp) => ({
        minX: Math.min(acc.minX, comp.x),
        minY: Math.min(acc.minY, comp.y),
        maxX: Math.max(acc.maxX, comp.x + (comp.width || 200)),
        maxY: Math.max(acc.maxY, comp.y + (comp.height || 200)),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    const width = bounds.maxX - bounds.minX + padding * 2;
    const height = bounds.maxY - bounds.minY + padding * 2;
    const centerX = bounds.minX + (bounds.maxX - bounds.minX) / 2;
    const centerY = bounds.minY + (bounds.maxY - bounds.minY) / 2;

    const scale = Math.min(
      window.innerWidth / width,
      window.innerHeight / height,
      7 // Max zoom level (700%)
    );

    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(750)
      .call(
        zoomBehavior.current.transform,
        d3.zoomIdentity
          .translate(window.innerWidth / 2, window.innerHeight / 2)
          .scale(scale)
          .translate(-centerX, -centerY)
      );
  }, [components]);

  const zoomToSelection = useCallback(() => {
    if (
      !svgRef.current ||
      !zoomBehavior.current ||
      selectedComponents.length === 0
    )
      return;

    const selectedComps = components.filter((comp) =>
      selectedComponents.includes(comp.id)
    );
    const padding = 50;
    const bounds = selectedComps.reduce(
      (acc, comp) => ({
        minX: Math.min(acc.minX, comp.x),
        minY: Math.min(acc.minY, comp.y),
        maxX: Math.max(acc.maxX, comp.x + (comp.width || 200)),
        maxY: Math.max(acc.maxY, comp.y + (comp.height || 200)),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    const width = bounds.maxX - bounds.minX + padding * 2;
    const height = bounds.maxY - bounds.minY + padding * 2;
    const centerX = bounds.minX + (bounds.maxX - bounds.minX) / 2;
    const centerY = bounds.minY + (bounds.maxY - bounds.minY) / 2;

    const scale = Math.min(
      window.innerWidth / width,
      window.innerHeight / height,
      7 // Max zoom level (700%)
    );

    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(750)
      .call(
        zoomBehavior.current.transform,
        d3.zoomIdentity
          .translate(window.innerWidth / 2, window.innerHeight / 2)
          .scale(scale)
          .translate(-centerX, -centerY)
      );
  }, [components, selectedComponents]);

  // Marquee selection utilities
  const getComponentsInMarquee = useCallback(() => {
    const left = Math.min(marqueeStart.x, marqueeEnd.x);
    const right = Math.max(marqueeStart.x, marqueeEnd.x);
    const top = Math.min(marqueeStart.y, marqueeEnd.y);
    const bottom = Math.max(marqueeStart.y, marqueeEnd.y);

    return components.filter((comp) => {
      // Convert component coordinates to screen coordinates
      const screenX = comp.x * transform.k + transform.x;
      const screenY = comp.y * transform.k + transform.y;
      const compWidth = (comp.width || 200) * transform.k;
      const compHeight = (comp.height || 200) * transform.k;

      return (
        screenX < right &&
        screenX + compWidth > left &&
        screenY < bottom &&
        screenY + compHeight > top
      );
    });
  }, [marqueeStart, marqueeEnd, components, transform]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.attr("width", window.innerWidth).attr("height", window.innerHeight);

    // Enhanced zoom behavior with better filtering for Mac trackpad
    zoomBehavior.current = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 7]) // Min 10%, Max 700%
      .filter((event) => {
        // Prevent zoom during marquee selection or component dragging
        if (isMarqueeActive) return false;

        // Disable wheel events for D3 zoom - we handle these globally now
        if (event.type === "wheel") {
          return false;
        }

        // Allow middle mouse button for pan
        if (event.type === "mousedown" && event.button === 1) {
          return true;
        }

        // Allow right mouse button for pan
        if (event.type === "mousedown" && event.button === 2) {
          return true;
        }

        // Allow pan with space + left click
        if (
          event.type === "mousedown" &&
          event.button === 0 &&
          isSpacePressed
        ) {
          return true;
        }

        return false;
      })
      .on("zoom", (event) => {
        if (!isMarqueeActive) {
          const currentScale = event.transform.k;
          const scaleChanged =
            Math.abs(currentScale - previousZoomScale.current) > 0.001;

          setTransform(event.transform);

          // Only show indicator if scale changed (actual zoom), not just pan
          if (scaleChanged) {
            showZoomIndicatorTemporarily();
            previousZoomScale.current = currentScale;
          }
        }
      });

    svg.call(zoomBehavior.current);

    // Global zoom event handlers to capture zoom gestures everywhere within the whiteboard
    const handleGlobalWheel = (event: WheelEvent) => {
      // Only handle zoom gestures (Ctrl/Cmd + wheel or pinch) and only when inside our container
      if ((event.ctrlKey || event.metaKey) && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const isInsideContainer =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

        if (!isInsideContainer) return; // Don't handle zoom outside our container

        event.preventDefault();
        event.stopPropagation();

        // Calculate zoom center point relative to the container
        const centerX = event.clientX - rect.left;
        const centerY = event.clientY - rect.top;

        // Determine zoom direction and factor
        const zoomIntensity = 0.015; // Increased from 0.007 for faster zoom
        const delta = -event.deltaY * zoomIntensity;
        const scaleFactor = Math.exp(delta);

        // Calculate new scale with limits
        const currentScale = transform.k;
        const newScale = Math.max(0.1, Math.min(7, currentScale * scaleFactor));

        if (
          newScale !== currentScale &&
          svgRef.current &&
          zoomBehavior.current
        ) {
          // Calculate the point in transform space
          const pointInTransformSpace = {
            x: (centerX - transform.x) / transform.k,
            y: (centerY - transform.y) / transform.k,
          };

          // Apply zoom centered on mouse position
          const newTransform = d3.zoomIdentity
            .translate(centerX, centerY)
            .scale(newScale)
            .translate(-pointInTransformSpace.x, -pointInTransformSpace.y);

          const svg = d3.select(svgRef.current);
          svg.call(zoomBehavior.current.transform, newTransform);
        }
      }
    };

    // Touch handlers for pinch-to-zoom
    let globalTouchStartDistance = 0;
    let globalTouchStartTransform = transform;
    let globalTouchCenter = { x: 0, y: 0 };

    const handleGlobalTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2 && containerRef.current) {
        // Check if the touch is within our container
        const rect = containerRef.current.getBoundingClientRect();
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;

        const isInsideContainer =
          centerX >= rect.left &&
          centerX <= rect.right &&
          centerY >= rect.top &&
          centerY <= rect.bottom;

        if (!isInsideContainer) return; // Don't handle touches outside our container

        globalTouchStartDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        globalTouchCenter = { x: centerX, y: centerY };
        globalTouchStartTransform = transform;
        event.preventDefault();
      }
    };

    const handleGlobalTouchMove = (event: TouchEvent) => {
      if (
        event.touches.length === 2 &&
        globalTouchStartDistance > 0 &&
        containerRef.current
      ) {
        // Check if we're still inside the container
        const rect = containerRef.current.getBoundingClientRect();
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;

        const isInsideContainer =
          centerX >= rect.left &&
          centerX <= rect.right &&
          centerY >= rect.top &&
          centerY <= rect.bottom;

        if (!isInsideContainer) return;

        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        const scale = currentDistance / globalTouchStartDistance;
        const newScale = Math.max(
          0.1,
          Math.min(7, globalTouchStartTransform.k * scale)
        );

        // Calculate the center point in transform space
        const centerInTransformSpace = {
          x:
            (globalTouchCenter.x - rect.left - globalTouchStartTransform.x) /
            globalTouchStartTransform.k,
          y:
            (globalTouchCenter.y - rect.top - globalTouchStartTransform.y) /
            globalTouchStartTransform.k,
        };

        // Apply zoom centered on pinch center
        const newTransform = d3.zoomIdentity
          .translate(
            globalTouchCenter.x - rect.left,
            globalTouchCenter.y - rect.top
          )
          .scale(newScale)
          .translate(-centerInTransformSpace.x, -centerInTransformSpace.y);

        if (svgRef.current && zoomBehavior.current) {
          const svg = d3.select(svgRef.current);
          svg.call(zoomBehavior.current.transform, newTransform);
        }
        event.preventDefault();
      }
    };

    const handleGlobalTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 2) {
        globalTouchStartDistance = 0;
      }
    };

    // Add global event listeners to capture zoom gestures everywhere
    document.addEventListener("wheel", handleGlobalWheel, { passive: false });
    document.addEventListener("touchstart", handleGlobalTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleGlobalTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", handleGlobalTouchEnd);

    // Enhanced keyboard event handling
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for our custom shortcuts
      if (event.key === " ") {
        event.preventDefault();
        setIsSpacePressed(true);
      } else if (event.key === "1") {
        event.preventDefault();
        if (event.shiftKey) {
          zoomToFit();
        } else {
          resetZoom();
        }
      } else if (event.key === "2") {
        event.preventDefault();
        zoomToSelection();
      } else if (event.key === "3" || event.key === "o" || event.key === "O") {
        event.preventDefault();
        setShowOverview(!showOverview);
      } else if (event.key === "Escape") {
        // Close overview if open, otherwise deselect all components
        if (showOverview) {
          setShowOverview(false);
        } else {
          setSelectedComponents([]);
        }
      } else if (event.key === "Delete" || event.key === "Backspace") {
        handleDeleteSelected();
      } else if (event.key === "c" && (event.ctrlKey || event.metaKey)) {
        // Copy selected shape components
        event.preventDefault();
        handleCopyComponents();
      } else if (event.key === "v" && (event.ctrlKey || event.metaKey)) {
        // Paste components at mouse position
        event.preventDefault();
        if (event.shiftKey) {
          // Ctrl+Shift+V: Force paste image from clipboard (ignore copied components)
          handlePasteImageFromClipboard();
        } else {
          // Ctrl+V: Normal paste (components first, then images)
          handlePasteComponents();
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === " ") {
        setIsSpacePressed(false);
      }
    };

    // Mouse event handlers for marquee selection and panning
    const handleMouseDown = (event: MouseEvent) => {
      const coords = getEventCoordinates(event);

      // Check if we clicked on a component (prevent marquee when clicking components)
      const target = event.target as HTMLElement;
      const isComponentClick = target.closest("[data-component]") !== null;

      // Check if we clicked on the sidebar or control panel (prevent marquee when clicking UI)
      const isSidebarClick = target.closest("[data-sidebar]") !== null;
      const isControlPanelClick =
        target.closest("[data-control-panel]") !== null;
      const isUIClick = isSidebarClick || isControlPanelClick;

      if (
        event.button === 0 &&
        !isSpacePressed &&
        !isComponentClick &&
        !isUIClick
      ) {
        // Left click without space on empty area - start marquee selection
        setIsMarqueeActive(true);
        setMarqueeStart(coords);
        setMarqueeEnd(coords);
      } else if (
        event.button === 1 ||
        event.button === 2 ||
        (event.button === 0 && isSpacePressed)
      ) {
        // Middle, right, or space+left click - start panning (but not on UI elements)
        if (!isUIClick) {
          setIsPanning(true);
          setLastPanPoint(coords);
          event.preventDefault();
        }
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const coords = getEventCoordinates(event);

      if (isMarqueeActive) {
        setMarqueeEnd(coords);
      } else if (isPanning) {
        const deltaX = coords.x - lastPanPoint.x;
        const deltaY = coords.y - lastPanPoint.y;

        const newTransform = transform.translate(
          deltaX / transform.k,
          deltaY / transform.k
        );
        applyTransform(newTransform);
        setLastPanPoint(coords);
      }

      // Update mouse position for paste operations
      setMousePosition(coords);
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (isMarqueeActive) {
        // Complete marquee selection
        const selectedInMarquee = getComponentsInMarquee();
        if (event.ctrlKey || event.metaKey) {
          // Add to existing selection
          setSelectedComponents((prev) => [
            ...new Set([...prev, ...selectedInMarquee.map((comp) => comp.id)]),
          ]);
        } else {
          // Replace selection
          setSelectedComponents(selectedInMarquee.map((comp) => comp.id));
        }
        setIsMarqueeActive(false);
      } else if (isPanning) {
        setIsPanning(false);
      }
    };

    // Context menu prevention for right-click pan
    const handleContextMenu = (event: MouseEvent) => {
      if (event.button === 2) {
        event.preventDefault();
      }
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      svg.selectAll("*").remove();

      // Cleanup global event listeners
      document.removeEventListener("wheel", handleGlobalWheel);
      document.removeEventListener("touchstart", handleGlobalTouchStart);
      document.removeEventListener("touchmove", handleGlobalTouchMove);
      document.removeEventListener("touchend", handleGlobalTouchEnd);

      // Cleanup window event listeners
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [
    handleDeleteSelected,
    isMarqueeActive,
    isPanning,
    isSpacePressed,
    lastPanPoint,
    marqueeStart,
    marqueeEnd,
    transform,
    getComponentsInMarquee,
    resetZoom,
    zoomToFit,
    zoomToSelection,
    showZoomIndicatorTemporarily,
    showOverview,
    handleCopyComponents,
    handlePasteComponents,
    handlePasteImageFromClipboard,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (zoomIndicatorTimeoutRef.current) {
        clearTimeout(zoomIndicatorTimeoutRef.current);
      }
    };
  }, []);

  const handleDragStart = (id: number) => {
    // Bring the component to the front when starting to drag
    bringToFront(id);

    if (selectedComponents.length > 1 && selectedComponents.includes(id)) {
      // Multiple selected components: dragging one moves all selected
      const positions = selectedComponents.map((selectedId) => {
        const component = components.find((c) => c.id === selectedId);
        return { id: selectedId, x: component?.x || 0, y: component?.y || 0 };
      });
      setInitialPositions(positions);
    } else {
      // Single component drag - store initial position and select it
      const component = components.find((c) => c.id === id);
      if (component) {
        setInitialPositions([{ id, x: component.x, y: component.y }]);
        setSelectedComponents([id]);
      }
    }
  };

  const handleDrag = useCallback(
    (id: number, deltaX: number, deltaY: number) => {
      if (selectedComponents.length > 1 && selectedComponents.includes(id)) {
        // Moving multiple selected components
        setComponents((prevComponents) =>
          prevComponents.map((component) => {
            const initialPos = initialPositions.find(
              (pos) => pos.id === component.id
            );
            if (initialPos && selectedComponents.includes(component.id)) {
              return {
                ...component,
                x: initialPos.x + deltaX,
                y: initialPos.y + deltaY,
              };
            }
            return component;
          })
        );
      } else {
        // Single component drag
        const initialPos = initialPositions.find((pos) => pos.id === id);
        if (initialPos) {
          setComponents((prevComponents) =>
            prevComponents.map((component) =>
              component.id === id
                ? {
                    ...component,
                    x: initialPos.x + deltaX,
                    y: initialPos.y + deltaY,
                  }
                : component
            )
          );
        }
      }
    },
    [selectedComponents, initialPositions]
  );

  const handleSelect = useCallback((id: number) => {
    // Single selection only - replace any existing selection
    setSelectedComponents([id]);
  }, []);

  const handleZoom = useCallback((factor: number) => {
    if (!svgRef.current || !zoomBehavior.current) return;
    const svg = d3.select(svgRef.current);
    zoomBehavior.current.scaleBy(svg, factor);
    // Don't show indicator for manual button clicks
  }, []);

  const addNewComponent = useCallback(
    (type: string, x?: number, y?: number) => {
      const newId = Math.max(...components.map((c) => c.id)) + 1;
      const highestZIndex = Math.max(
        ...components.map((c) => c.zIndex || 0),
        0
      );

      console.log(`Adding new ${type} component with ID: ${newId}`);

      // Create base component
      const newComponent: Component = {
        id: newId,
        x: x ?? 200 + Math.random() * 200,
        y: y ?? 200 + Math.random() * 200,
        type,
        zIndex: highestZIndex + 1, // Place new component on top
      };

      // Add default properties for shape components
      if (["rectangle", "ellipse"].includes(type)) {
        newComponent.width = 120;
        newComponent.height = 80;
      } else if (["arrow", "line"].includes(type)) {
        newComponent.width = 150;
        newComponent.height = 20;
      } else if (type === "text") {
        newComponent.width = 150;
        newComponent.height = 50;
        newComponent.text = "Double-click to edit";
      } else if (type === "imageShape") {
        newComponent.width = 200;
        newComponent.height = 150;
      }

      setComponents((prev) => [...prev, newComponent]);
    },
    [components]
  );

  // Category and sidebar handlers
  const handleCategoryClick = useCallback(
    (categoryName: string) => {
      if (activeCategory === categoryName && isSidebarOpen) {
        // If same category is clicked while sidebar is open, close it
        setIsSidebarOpen(false);
        setActiveCategory(null);
      } else {
        // Open sidebar with new category
        setActiveCategory(categoryName);
        setIsSidebarOpen(true);
      }
    },
    [activeCategory, isSidebarOpen]
  );

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    setActiveCategory(null);
  }, []);

  const getActiveCategory = () => {
    return (
      COMPONENT_CATEGORIES.find((cat) => cat.name === activeCategory) || null
    );
  };

  // Handle drop events from sidebar for new components and external images
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

            // Create a new imageShape component with the dropped image
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

          tempImg.onerror = () => {
            console.error("Failed to load image for dimension calculation");
            // Fallback to default size
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
              width: 200,
              height: 150,
              zIndex: highestZIndex + 1,
              imageSrc,
            };

            setComponents((prev) => [...prev, newComponent]);
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
            const newId = Math.max(...components.map((c) => c.id), 0) + 1;
            const highestZIndex = Math.max(
              ...components.map((c) => c.zIndex || 0),
              0
            );

            const newComponent: Component = {
              id: newId,
              x: x - 200, // Center the 400px wide component
              y: y - 150, // Center the 300px tall component
              type: "youtubeVideo",
              width: 400,
              height: 300,
              zIndex: highestZIndex + 1,
              youtubeUrl: extractedUrl,
            };

            setComponents((prev) => [...prev, newComponent]);
            return;
          }

          if (isSoundCloudUrl(extractedUrl)) {
            const newId = Math.max(...components.map((c) => c.id), 0) + 1;
            const highestZIndex = Math.max(
              ...components.map((c) => c.zIndex || 0),
              0
            );

            const newComponent: Component = {
              id: newId,
              x: x - 200, // Center the 400px wide component
              y: y - 100, // Center the 200px tall component
              type: "soundcloud",
              width: 400,
              height: 200,
              zIndex: highestZIndex + 1,
              soundcloudUrl: extractedUrl,
            };

            setComponents((prev) => [...prev, newComponent]);
            return;
          }

          if (isSpotifyUrl(extractedUrl)) {
            const newId = Math.max(...components.map((c) => c.id), 0) + 1;
            const highestZIndex = Math.max(
              ...components.map((c) => c.zIndex || 0),
              0
            );

            const newComponent: Component = {
              id: newId,
              x: x - 200, // Center the 400px wide component
              y: y - 100, // Center the 200px tall component
              type: "spotify",
              width: 400,
              height: 200,
              zIndex: highestZIndex + 1,
              spotifyUrl: extractedUrl,
            };

            setComponents((prev) => [...prev, newComponent]);
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

            // Create a new imageShape component with the dropped image URL
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
              imageSrc: imageUrl,
            };

            setComponents((prev) => [...prev, newComponent]);
          };

          tempImg.onerror = () => {
            console.error("Failed to load image URL for dimension calculation");
            // Fallback to default size
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
              width: 200,
              height: 150,
              zIndex: highestZIndex + 1,
              imageSrc: imageUrl,
            };

            setComponents((prev) => [...prev, newComponent]);
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
    addNewComponent,
    transform,
    components,
    isYouTubeUrl,
    isSoundCloudUrl,
    isSpotifyUrl,
  ]);

  const bringToFront = useCallback((id: number) => {
    setComponents((prevComponents) => {
      const highestZIndex = Math.max(
        ...prevComponents.map((comp) => comp.zIndex || 0),
        0
      );
      return prevComponents.map((component) =>
        component.id === id
          ? { ...component, zIndex: highestZIndex + 1 }
          : component
      );
    });
  }, []);

  // Overview/Minimap functionality
  const getWhiteboardBounds = useCallback(() => {
    if (components.length === 0) {
      return { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };
    }

    const padding = 200;
    const bounds = components.reduce(
      (acc, comp) => ({
        minX: Math.min(acc.minX, comp.x),
        minY: Math.min(acc.minY, comp.y),
        maxX: Math.max(acc.maxX, comp.x + (comp.width || 200)),
        maxY: Math.max(acc.maxY, comp.y + (comp.height || 200)),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    return {
      minX: bounds.minX - padding,
      minY: bounds.minY - padding,
      maxX: bounds.maxX + padding,
      maxY: bounds.maxY + padding,
    };
  }, [components]);

  const navigateToComponent = useCallback((component: Component) => {
    if (!svgRef.current || !zoomBehavior.current) return;

    const svg = d3.select(svgRef.current);
    const targetX = component.x + (component.width || 200) / 2;
    const targetY = component.y + (component.height || 200) / 2;

    svg
      .transition()
      .duration(750)
      .call(
        zoomBehavior.current.transform,
        d3.zoomIdentity
          .translate(window.innerWidth / 2, window.innerHeight / 2)
          .scale(1)
          .translate(-targetX, -targetY)
      );

    setShowOverview(false);
  }, []);

  const handleResizeComponent = useCallback(
    (id: number, width: number, height: number) => {
      console.log(`Resizing component ${id} to ${width}x${height}`);
      setComponents((prev) =>
        prev.map((component) =>
          component.id === id ? { ...component, width, height } : component
        )
      );
    },
    []
  );

  const handleTextChange = useCallback((id: number, text: string) => {
    console.log(`Changing text for component ${id} to: ${text}`);
    setComponents((prev) =>
      prev.map((component) =>
        component.id === id ? { ...component, text } : component
      )
    );
  }, []);

  const handleImageChange = useCallback((id: number, imageSrc: string) => {
    console.log(`Changing image for component ${id}`);
    setComponents((prev) =>
      prev.map((component) =>
        component.id === id ? { ...component, imageSrc } : component
      )
    );
  }, []);

  return (
    <div
      ref={containerRef}
      data-drop-zone
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <svg ref={svgRef}></svg>

      {/* Marquee selection overlay */}
      {isMarqueeActive && (
        <div
          style={{
            position: "absolute",
            left: `${Math.min(marqueeStart.x, marqueeEnd.x)}px`,
            top: `${Math.min(marqueeStart.y, marqueeEnd.y)}px`,
            width: `${Math.abs(marqueeEnd.x - marqueeStart.x)}px`,
            height: `${Math.abs(marqueeEnd.y - marqueeStart.y)}px`,
            border: "2px dashed #3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        />
      )}

      {/* Zoom indicator overlay */}
      {showZoomIndicator && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "500",
            fontFamily: "monospace",
            pointerEvents: "none",
            zIndex: 10000,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            animation: isActivelyZooming
              ? "zoomFadeIn 0.2s ease-out"
              : "zoomFadeOut 0.3s ease-in",
          }}
        >
          {Math.round(transform.k * 100)}%
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
          pointerEvents: "none",
        }}
      >
        {/* Sort components by z-index before rendering */}
        {[...components]
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
          .map((component) => (
            <DraggableComponent
              key={component.id}
              x={component.x}
              y={component.y}
              id={component.id}
              type={component.type}
              onDrag={handleDrag}
              onDragStart={handleDragStart}
              onSelect={handleSelect}
              onDelete={handleDeleteComponent}
              onResize={handleResizeComponent}
              onTextChange={handleTextChange}
              onImageChange={handleImageChange}
              selected={selectedComponents.includes(component.id)}
              selectedCount={selectedComponents.length}
              transform={transform}
              zIndex={component.zIndex || 0}
              imageSrc={component.imageSrc}
              width={component.width}
              height={component.height}
              text={component.text}
              youtubeUrl={component.youtubeUrl}
              soundcloudUrl={component.soundcloudUrl}
              spotifyUrl={component.spotifyUrl}
            />
          ))}
      </div>
      <ControlPanel
        onZoom={handleZoom}
        selectedComponents={selectedComponents}
      />

      {/* Component Footer and Sidebar */}
      <ComponentFooter
        categories={COMPONENT_CATEGORIES}
        onCategoryClick={handleCategoryClick}
        activeCategory={activeCategory || undefined}
      />

      <CategorySidebar
        category={getActiveCategory()}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />

      {/* Drag overlay indicator */}
      {isDragOverBoard && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            border: "3px dashed #3b82f6",
            borderRadius: "12px",
            pointerEvents: "none",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.9)",
              color: "white",
              padding: "16px 24px",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "600",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            {dragType === "image"
              ? "📷 Drop image here"
              : "🔧 Drop component here"}
          </div>
        </div>
      )}

      {/* Overview/Minimap overlay */}
      {showOverview && (
        <div
          ref={overviewRef}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            border: "1px solid #e2e8f0",
            zIndex: 10001,
            maxWidth: "80vw",
            maxHeight: "80vh",
            overflow: "hidden",
          }}
        >
          <Overview
            components={components}
            selectedComponents={selectedComponents}
            transform={transform}
            onNavigateToComponent={navigateToComponent}
            onClose={() => setShowOverview(false)}
            getWhiteboardBounds={getWhiteboardBounds}
          />
        </div>
      )}
    </div>
  );
};

interface ControlPanelProps {
  onZoom: (factor: number) => void;
  selectedComponents: number[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onZoom,
  selectedComponents,
}) => {
  return (
    <div
      data-control-panel
      style={{
        position: "absolute",
        bottom: "10px",
        left: "10px",
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        maxWidth: "250px",
      }}
      className="flex flex-col gap-2"
    >
      <div className="flex gap-2">
        <Button onClick={() => onZoom(1.4)} variant={"ghost"} size="sm">
          <Plus className="w-4 h-4" />
        </Button>
        <Button onClick={() => onZoom(0.7)} variant={"ghost"} size="sm">
          <Minus className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-sm mt-2">
        Mode: Selection
        {selectedComponents.length > 0 && (
          <span className="text-blue-600 ml-2">
            ({selectedComponents.length} selected)
          </span>
        )}
      </p>
    </div>
  );
};

interface OverviewProps {
  components: {
    id: number;
    x: number;
    y: number;
    type: string;
    width?: number;
    height?: number;
    zIndex?: number;
  }[];
  selectedComponents: number[];
  transform: d3.ZoomTransform;
  onNavigateToComponent: (component: {
    id: number;
    x: number;
    y: number;
    type: string;
    width?: number;
    height?: number;
    zIndex?: number;
  }) => void;
  onClose: () => void;
  getWhiteboardBounds: () => {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

const Overview: React.FC<OverviewProps> = ({
  components,
  selectedComponents,
  transform,
  onNavigateToComponent,
  onClose,
  getWhiteboardBounds,
}) => {
  const bounds = getWhiteboardBounds();
  const boundsWidth = bounds.maxX - bounds.minX;
  const boundsHeight = bounds.maxY - bounds.minY;

  // Calculate overview dimensions
  const maxOverviewWidth = 600;
  const maxOverviewHeight = 400;
  const aspectRatio = boundsWidth / boundsHeight;

  let overviewWidth = maxOverviewWidth;
  let overviewHeight = maxOverviewWidth / aspectRatio;

  if (overviewHeight > maxOverviewHeight) {
    overviewHeight = maxOverviewHeight;
    overviewWidth = maxOverviewHeight * aspectRatio;
  }

  const scale = overviewWidth / boundsWidth;

  // Calculate current viewport rectangle in overview coordinates
  const viewportLeft = (-transform.x / transform.k - bounds.minX) * scale;
  const viewportTop = (-transform.y / transform.k - bounds.minY) * scale;
  const viewportWidth = (window.innerWidth / transform.k) * scale;
  const viewportHeight = (window.innerHeight / transform.k) * scale;

  const getComponentColor = (type: string) => {
    switch (type) {
      case "timer":
        return "#f59e0b";
      case "weather":
        return "#06b6d4";
      case "bitcoin":
        return "#f97316";
      case "currency":
        return "#10b981";
      case "note":
        return "#8b5cf6";
      case "confetti":
        return "#ec4899";
      case "watch":
        return "#6366f1";
      case "scrollingtext":
        return "#14b8a6";
      case "youtubeVideo":
        return "#ef4444";
      case "soundcloud":
        return "#f97316";
      case "spotify":
        return "#22c55e";
      case "stylishlink":
        return "#3b82f6";
      default:
        return "#64748b";
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Whiteboard Overview
          </h3>
          <p className="text-sm text-gray-500">
            {components.length} components • Click to navigate
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close overview"
        >
          ✕
        </button>
      </div>

      {/* Overview Canvas */}
      <div className="p-4">
        <div
          className="relative border border-gray-300 rounded-lg overflow-hidden"
          style={{
            width: `${overviewWidth}px`,
            height: `${overviewHeight}px`,
            backgroundColor: "#f8fafc",
          }}
        >
          {/* Grid pattern */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern
                id="overview-grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#overview-grid)" />
          </svg>

          {/* Current viewport indicator */}
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
            style={{
              left: `${Math.max(0, viewportLeft)}px`,
              top: `${Math.max(0, viewportTop)}px`,
              width: `${Math.min(
                overviewWidth - Math.max(0, viewportLeft),
                viewportWidth
              )}px`,
              height: `${Math.min(
                overviewHeight - Math.max(0, viewportTop),
                viewportHeight
              )}px`,
            }}
          />

          {/* Components */}
          {components.map((component) => {
            const x = (component.x - bounds.minX) * scale;
            const y = (component.y - bounds.minY) * scale;
            const width = (component.width || 200) * scale;
            const height = (component.height || 200) * scale;
            const isSelected = selectedComponents.includes(component.id);

            return (
              <div
                key={component.id}
                className={`absolute cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10 ${
                  isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
                }`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${Math.max(4, width)}px`,
                  height: `${Math.max(4, height)}px`,
                  backgroundColor: getComponentColor(component.type),
                  borderRadius: "2px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                onClick={() => onNavigateToComponent(component)}
                title={`${component.type} (ID: ${component.id})`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded border"></div>
            <span>Current View</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 ring-2 ring-blue-500 rounded border"></div>
            <span>Selected</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-4 grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-800">
              {components.length}
            </div>
            <div className="text-gray-500">Components</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-800">
              {selectedComponents.length}
            </div>
            <div className="text-gray-500">Selected</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-800">
              {Math.round(transform.k * 100)}%
            </div>
            <div className="text-gray-500">Zoom</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-3 text-xs text-gray-600 space-y-1">
          <p>
            <strong>Navigation:</strong>
          </p>
          <p>• Click any component to navigate to it</p>
          <p>
            • Press <kbd className="px-1 py-0.5 bg-gray-200 rounded">3</kbd> or{" "}
            <kbd className="px-1 py-0.5 bg-gray-200 rounded">O</kbd> to toggle
            overview
          </p>
          <p>
            • Press{" "}
            <kbd className="px-1 py-0.5 bg-gray-200 rounded">Escape</kbd> to
            close
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomGrid;
