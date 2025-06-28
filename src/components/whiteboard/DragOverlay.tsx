import React from "react";

interface DragOverlayProps {
  isDragOver: boolean;
  dragType: string;
  style: React.CSSProperties;
  zIndex: number;
  message: string;
}

export const DragOverlay: React.FC<DragOverlayProps> = ({
  isDragOver,
  dragType,
  style,
  zIndex,
  message,
}) => {
  if (!isDragOver) return null;
  return (
    <div style={{ ...style, zIndex }}>
      <div>{message}</div>
    </div>
  );
};
