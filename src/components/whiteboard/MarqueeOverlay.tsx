import React from "react";

interface MarqueeOverlayProps {
  isActive: boolean;
  start: { x: number; y: number };
  end: { x: number; y: number };
  border: string;
  backgroundColor: string;
  zIndex: number;
}

export const MarqueeOverlay: React.FC<MarqueeOverlayProps> = ({
  isActive,
  start,
  end,
  border,
  backgroundColor,
  zIndex,
}) => {
  if (!isActive) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: `${Math.min(start.x, end.x)}px`,
        top: `${Math.min(start.y, end.y)}px`,
        width: `${Math.abs(end.x - start.x)}px`,
        height: `${Math.abs(end.y - start.y)}px`,
        border,
        backgroundColor,
        pointerEvents: "none",
        zIndex,
      }}
    />
  );
};
