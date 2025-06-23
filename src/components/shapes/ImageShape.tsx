import React from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";
import { shapeLogger } from "../../utils/componentLoggers";

export interface ImageShapeProps extends Omit<BaseShapeProps, "children"> {
  imageSrc?: string;
  onImageChange?: (imageSrc: string) => void;
  borderRadius?: number;
  objectFit?: "cover" | "contain" | "fill" | "scale-down" | "none";
}

export const ImageShape: React.FC<ImageShapeProps> = ({
  imageSrc,
  onImageChange,
  borderRadius = 8,
  objectFit = "cover",
  style,
  ...props
}) => {
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
          onImageChange?.(result);
        };
        reader.readAsDataURL(imageFile);
      }
    },
    [onImageChange]
  );

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <BaseShape
      {...props}
      lockAspectRatio={true} // Lock aspect ratio for images
      style={{
        ...style,
      }}
    >
      <div
        className="w-full h-full overflow-hidden"
        style={{
          borderRadius,
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Image"
            className="w-full h-full"
            style={{
              objectFit,
            }}
            draggable={false}
            crossOrigin="anonymous"
            onError={(e) => {
              shapeLogger.warn("Image load error, trying without crossOrigin", {
                imageSrc,
              });
              // Fallback: try without crossOrigin
              (e.target as HTMLImageElement).crossOrigin = "";
            }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 text-gray-500"
            style={{
              borderRadius,
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
  );
};
