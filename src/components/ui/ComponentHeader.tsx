import React from "react";

export interface ComponentHeaderProps {
  position: { x: number; y: number };
  width: number; // Component width to calculate center
  visible: boolean;
  children: React.ReactNode;
  headerWidth?: number; // Optional custom header width, defaults to 400
  offsetY?: number; // Optional Y offset, defaults to -60
}

export const ComponentHeader: React.FC<ComponentHeaderProps> = ({
  position,
  width,
  visible,
  children,
  headerWidth = 400,
  offsetY = -60,
}) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: position.x + width / 2 - headerWidth / 2, // Center the header on the component
        top: position.y + offsetY, // Position above the component
        width: `${headerWidth}px`,
        height: "50px",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "0 12px",
        zIndex: 10000,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {children}
    </div>
  );
};
