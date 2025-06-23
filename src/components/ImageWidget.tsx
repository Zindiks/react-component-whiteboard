import React, { useState, useRef } from "react";
import { ComponentHeader } from "./widgets/ComponentHeader";
import { Image } from "lucide-react";

interface ImageWidgetProps {
  onHeaderMouseDown?: (event: React.MouseEvent) => void;
  onDelete?: () => void;
  imageSrc?: string;
  width?: number;
  height?: number;
  onResize?: (width: number, height: number) => void;
}

export const ImageWidget: React.FC<ImageWidgetProps> = ({
  onHeaderMouseDown,
  onDelete,
  imageSrc,
  width = 300,
  height = 200,
  onResize,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>("");
  const [currentWidth, setCurrentWidth] = useState(width);
  const [currentHeight, setCurrentHeight] = useState(height);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const handleResizeStart = (event: React.MouseEvent, handle: string) => {
    event.preventDefault();
    event.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setStartPos({ x: event.clientX, y: event.clientY });
    setStartSize({ width: currentWidth, height: currentHeight });

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  const handleResizeMove = (event: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = event.clientX - startPos.x;
    const deltaY = event.clientY - startPos.y;

    let newWidth = startSize.width;
    let newHeight = startSize.height;

    switch (resizeHandle) {
      case "se": // bottom-right
        newWidth = Math.max(100, startSize.width + deltaX);
        newHeight = Math.max(100, startSize.height + deltaY);
        break;
      case "sw": // bottom-left
        newWidth = Math.max(100, startSize.width - deltaX);
        newHeight = Math.max(100, startSize.height + deltaY);
        break;
      case "ne": // top-right
        newWidth = Math.max(100, startSize.width + deltaX);
        newHeight = Math.max(100, startSize.height - deltaY);
        break;
      case "nw": // top-left
        newWidth = Math.max(100, startSize.width - deltaX);
        newHeight = Math.max(100, startSize.height - deltaY);
        break;
      case "e": // right
        newWidth = Math.max(100, startSize.width + deltaX);
        break;
      case "w": // left
        newWidth = Math.max(100, startSize.width - deltaX);
        break;
      case "n": // top
        newHeight = Math.max(100, startSize.height - deltaY);
        break;
      case "s": // bottom
        newHeight = Math.max(100, startSize.height + deltaY);
        break;
    }

    setCurrentWidth(newWidth);
    setCurrentHeight(newHeight);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeHandle("");
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);

    if (onResize) {
      onResize(currentWidth, currentHeight);
    }
  };

  const resizeHandles = [
    { position: "nw", cursor: "nw-resize", style: { top: -4, left: -4 } },
    {
      position: "n",
      cursor: "n-resize",
      style: { top: -4, left: "50%", transform: "translateX(-50%)" },
    },
    { position: "ne", cursor: "ne-resize", style: { top: -4, right: -4 } },
    {
      position: "e",
      cursor: "e-resize",
      style: { top: "50%", right: -4, transform: "translateY(-50%)" },
    },
    { position: "se", cursor: "se-resize", style: { bottom: -4, right: -4 } },
    {
      position: "s",
      cursor: "s-resize",
      style: { bottom: -4, left: "50%", transform: "translateX(-50%)" },
    },
    { position: "sw", cursor: "sw-resize", style: { bottom: -4, left: -4 } },
    {
      position: "w",
      cursor: "w-resize",
      style: { top: "50%", left: -4, transform: "translateY(-50%)" },
    },
  ];

  return (
    <div
      style={{
        width: currentWidth,
        height: currentHeight + 40, // Add space for header
        position: "relative",
      }}
      className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden group"
    >
      <ComponentHeader
        title="Image"
        icon={Image}
        onMouseDown={onHeaderMouseDown}
        onDelete={onDelete}
      />

      <div
        style={{
          width: "100%",
          height: currentHeight,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {imageSrc ? (
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Uploaded image"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            draggable={false}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f9fafb",
              border: "2px dashed #d1d5db",
              color: "#6b7280",
            }}
          >
            📷 Drop an image here
          </div>
        )}

        {/* Resize handles - show on hover or when resizing */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          {resizeHandles.map((handle) => (
            <div
              key={handle.position}
              onMouseDown={(e) => handleResizeStart(e, handle.position)}
              style={{
                position: "absolute",
                width: 8,
                height: 8,
                backgroundColor: "#3b82f6",
                border: "1px solid white",
                borderRadius: "50%",
                cursor: handle.cursor,
                zIndex: 10,
                ...handle.style,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
