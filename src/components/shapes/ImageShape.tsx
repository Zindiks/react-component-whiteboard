import React, { useState } from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";
import { ImageHeader, ImageFormattingOptions } from "./ImageHeader";
import { shapeLogger } from "../../utils/componentLoggers";

export interface ImageShapeProps extends Omit<BaseShapeProps, "children"> {
  imageSrc?: string;
  onImageChange?: (imageSrc: string) => void;
  borderRadius?: number;
  objectFit?: "cover" | "contain" | "fill" | "scale-down" | "none";
  onFormattingChange?: (options: Partial<ImageFormattingOptions>) => void;
  selectedCount?: number;
}

export const ImageShape: React.FC<ImageShapeProps> = ({
  imageSrc,
  onImageChange,
  borderRadius = 8,
  objectFit = "cover",
  onFormattingChange,
  selected = false,
  x,
  y,
  width,
  height,
  style,
  ...props
}) => {
  const [formattingOptions, setFormattingOptions] =
    useState<ImageFormattingOptions>({
      imageUrl: imageSrc || "",
      borderColor: "#9ca3af",
      borderWidth: 0,
      borderRadius,
      rotation: 0,
      opacity: 1,
    });

  const handleFormattingChange = (options: Partial<ImageFormattingOptions>) => {
    const newOptions = { ...formattingOptions, ...options };
    setFormattingOptions(newOptions);
    onFormattingChange?.(options);

    // Update image URL if it changed
    if (options.imageUrl !== undefined) {
      onImageChange?.(options.imageUrl);
    }
  };

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith("image/"));

      if (imageFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          handleFormattingChange({ imageUrl: result });
        };
        reader.readAsDataURL(imageFile);
      }
    },
    [handleFormattingChange]
  );

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <>
      <BaseShape
        {...props}
        x={x}
        y={y}
        width={width}
        height={height}
        selected={selected}
        lockAspectRatio={true} // Lock aspect ratio for images
        style={{
          ...style,
        }}
      >
        <div
          className="w-full h-full overflow-hidden"
          style={{
            borderRadius: formattingOptions.borderRadius,
            border: `${formattingOptions.borderWidth}px solid ${formattingOptions.borderColor}`,
            transform: `rotate(${formattingOptions.rotation}deg)`,
            opacity: formattingOptions.opacity,
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {formattingOptions.imageUrl ? (
            <img
              src={formattingOptions.imageUrl}
              alt="Image"
              className="w-full h-full"
              style={{
                objectFit,
              }}
              draggable={false}
              crossOrigin="anonymous"
              onError={(e) => {
                shapeLogger.warn(
                  "Image load error, trying without crossOrigin",
                  {
                    imageSrc: formattingOptions.imageUrl,
                  }
                );
                // Fallback: try without crossOrigin
                (e.target as HTMLImageElement).crossOrigin = "";
              }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 text-gray-500"
              style={{
                borderRadius: formattingOptions.borderRadius,
              }}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">📷</div>
                <div className="text-sm">Drop image here</div>
              </div>
            </div>
          )}
        </div>
      </BaseShape>

      {/* Image Formatting Header */}
      <ImageHeader
        options={formattingOptions}
        onOptionsChange={handleFormattingChange}
        position={{ x, y }}
        width={width}
        visible={selected}
      />
    </>
  );
};
