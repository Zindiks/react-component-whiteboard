import React from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

interface ImageShapeProps extends Omit<BaseShapeProps, "children"> {
  imageSrc?: string;
  altText?: string;
  objectFit?: "cover" | "contain" | "fill";
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
}

export const ImageShape: React.FC<ImageShapeProps> = ({
  imageSrc,
  altText = "Image",
  objectFit = "cover",
  strokeColor = "#9ca3af",
  strokeWidth = 0,
  borderRadius = 8,
  selected = false,
  ...props
}) => {
  return (
    <BaseShape {...props} selected={selected}>
      <div
        className="w-full h-full"
        style={{
          border: `${strokeWidth}px solid ${strokeColor}`,
          borderRadius: `${borderRadius}px`,
          overflow: "hidden",
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={altText}
            className="w-full h-full"
            style={{ objectFit }}
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
