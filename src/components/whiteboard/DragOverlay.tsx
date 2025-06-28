import React from "react";

interface DragOverlayProps {
  isDragOver: boolean;
  style: React.CSSProperties;
  zIndex: number;
  message: string;
}

export const DragOverlay: React.FC<DragOverlayProps> = ({
  isDragOver,
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
