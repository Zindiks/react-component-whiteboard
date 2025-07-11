import React, { useState, useEffect, useCallback } from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

export interface ImageFormattingOptions {
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  rotation: number;
  opacity: number;
  objectFit: "cover" | "contain" | "fill";
}

export interface ImageShapeProps extends Omit<BaseShapeProps, "children"> {
  imageSrc?: string;
  altText?: string;
  objectFit?: "cover" | "contain" | "fill";
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
  rotation?: number;
  opacity?: number;
  onImageChange?: (imageSrc: string) => void;
  onFormattingChange?: (options: Partial<ImageFormattingOptions>) => void;
}

export const ImageShape: React.FC<ImageShapeProps> = ({
  imageSrc,
  altText = "Image",
  objectFit = "cover",
  strokeColor = "#9ca3af",
  strokeWidth = 0,
  borderRadius = 8,
  rotation = 0,
  opacity = 1,
  selected = false,
  width,
  height,
  onResize,
  ...props
}) => {
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Handle image load to calculate aspect ratio
  const handleImageLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const img = event.target as HTMLImageElement;
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      setImageAspectRatio(aspectRatio);
      setImageLoaded(true);

      // If this is the first time loading the image, adjust dimensions to match aspect ratio
      if (onResize && !imageLoaded && img.naturalWidth && img.naturalHeight) {
        // Keep the current width and adjust height to maintain aspect ratio
        const newHeight = width / aspectRatio;
        onResize(width, newHeight);
      }
    },
    [width, onResize, imageLoaded]
  );

  // Custom resize handler that maintains aspect ratio
  const handleAspectRatioResize = useCallback(
    (newWidth: number, newHeight: number) => {
      if (imageAspectRatio && onResize) {
        // Always maintain the image's natural aspect ratio
        const correctedHeight = newWidth / imageAspectRatio;
        onResize(newWidth, correctedHeight);
      } else if (onResize) {
        // Fallback to original behavior if no aspect ratio is available
        onResize(newWidth, newHeight);
      }
    },
    [imageAspectRatio, onResize]
  );

  // Reset image loaded state when image source changes
  useEffect(() => {
    if (imageSrc) {
      setImageLoaded(false);
      setImageAspectRatio(null);
    }
  }, [imageSrc]);

  return (
    <BaseShape
      {...props}
      width={width}
      height={height}
      selected={selected}
      lockAspectRatio={imageLoaded && imageAspectRatio !== null}
      onResize={handleAspectRatioResize}
    >
      <div
        className="w-full h-full"
        style={{
          border: `${strokeWidth}px solid ${strokeColor}`,
          borderRadius: `${borderRadius}px`,
          overflow: "hidden",
          transform: `rotate(${rotation}deg)`,
          opacity,
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={altText}
            className="w-full h-full"
            style={{ objectFit }}
            onLoad={handleImageLoad}
            onError={() => {
              setImageLoaded(false);
              setImageAspectRatio(null);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
            <span>No Image</span>
          </div>
        )}
      </div>
    </BaseShape>
  );
};
