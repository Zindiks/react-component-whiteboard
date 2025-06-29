import React from "react";
import { Z_INDEX } from "../../constants/appConstants";

interface ComponentHeaderProps {
  children: React.ReactNode;
  position?: { x: number; y: number };
  visible?: boolean;
  headerWidth?: number | "auto";
  offsetY?: number;
}

export const ComponentHeader: React.FC<ComponentHeaderProps> = ({
  children,
  position,
  visible = true,
  headerWidth = "auto",
  offsetY = -60,
}) => {
  if (!visible || !position) return null;

  const headerStyle: React.CSSProperties = {
    position: "absolute" as const,
    left: `${position.x}px`,
    top: `${position.y + offsetY}px`,
    backgroundColor: "rgba(30, 41, 59, 0.95)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "0 12px",
    zIndex: Z_INDEX.COMPONENT_HEADER,
    pointerEvents: "auto" as const,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    whiteSpace: "nowrap" as const,
    transform: "translateX(-50%)", // Center horizontally
    width: headerWidth === "auto" ? "auto" : `${headerWidth}px`,
  };

  return <div style={headerStyle}>{children}</div>;
};
