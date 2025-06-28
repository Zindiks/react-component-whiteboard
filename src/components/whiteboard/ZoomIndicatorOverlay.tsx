import React from "react";

interface ZoomIndicatorOverlayProps {
  show: boolean;
  zoomPercent: number;
  style: React.CSSProperties;
  zIndex: number;
  animation: string;
}

export const ZoomIndicatorOverlay: React.FC<ZoomIndicatorOverlayProps> = ({
  show,
  zoomPercent,
  style,
  zIndex,
  animation,
}) => {
  if (!show) return null;
  return (
    <div
      style={{
        ...style,
        zIndex,
        animation,
      }}
    >
      {zoomPercent}%
    </div>
  );
};
