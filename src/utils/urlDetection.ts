/**
 * URL Detection Utilities
 *
 * This module contains utility functions for detecting and validating
 * different types of URLs (images, YouTube, SoundCloud, Spotify, etc.)
 */

import { urlLogger } from "./componentLoggers";

/**
 * Checks if a string is likely an image URL
 * Supports various image formats, data URLs, blob URLs, and common image hosting domains
 */
export const isImageUrl = (url: string): boolean => {
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
    if (imageKeywords.some((keyword) => url.toLowerCase().includes(keyword))) {
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

/**
 * Detects YouTube URLs from various YouTube URL patterns
 * Supports youtube.com, youtu.be, mobile versions, and embed URLs
 */
export const isYouTubeUrl = (url: string): boolean => {
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
};

/**
 * Detects SoundCloud URLs
 * Supports soundcloud.com and various SoundCloud subdomains
 */
export const isSoundCloudUrl = (url: string): boolean => {
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
};

/**
 * Detects Spotify URLs
 * Supports open.spotify.com, play.spotify.com, and spotify: protocol URLs
 */
export const isSpotifyUrl = (url: string): boolean => {
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
};

/**
 * Extracts image URLs from HTML content
 * Looks for img tags, background images in style attributes, and any URLs that might be images
 */
export const extractImageFromHtml = (htmlText: string): string | null => {
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
    const elementsWithStyle = tempDiv.querySelectorAll('[style*="background"]');
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
    urlLogger.error("Error extracting image from HTML", { error });
    return null;
  }
};

/**
 * Checks if a URL is likely an image URL using a simplified pattern match
 * This is an alternative implementation used in drag-and-drop scenarios
 */
export const isImageUrlSimple = (imageUrl: string): boolean => {
  return !!(
    imageUrl &&
    (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|tif)(\?.*)?$/i.test(imageUrl) ||
      imageUrl.includes("image") ||
      imageUrl.includes("img") ||
      imageUrl.includes("photo") ||
      imageUrl.includes("pic") ||
      // Check for common image hosting domains
      /\.(unsplash|pexels|pixabay|imgur|flickr|googleusercontent|amazonaws)\./.test(
        imageUrl
      ) ||
      // Check for data URLs
      imageUrl.startsWith("data:image/"))
  );
};

/**
 * Extracts the first URL from a string that might contain multiple URLs
 */
export const extractFirstUrl = (text: string): string => {
  return text.split("\n")[0]; // Take first URL if multiple
};

/**
 * Checks if a string is a valid HTTP/HTTPS URL
 */
export const isValidHttpUrl = (text: string): boolean => {
  return /^https?:\/\//.test(text.trim());
};

/**
 * Comprehensive URL detection for different media types
 * Returns the type of URL detected or null if not recognized
 */
export const detectUrlType = (
  url: string
): "image" | "youtube" | "soundcloud" | "spotify" | null => {
  if (!url || typeof url !== "string") return null;

  if (isYouTubeUrl(url)) return "youtube";
  if (isSoundCloudUrl(url)) return "soundcloud";
  if (isSpotifyUrl(url)) return "spotify";
  if (isImageUrl(url)) return "image";

  return null;
};
