import React from "react";
import { cn } from "../../lib/utils";

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

  return (
    <div
      className={cn(
        "absolute flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg border",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "border-border/50",
        "z-[10002] pointer-events-auto whitespace-nowrap",
        "transform -translate-x-1/2"
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y + offsetY}px`,
        width: headerWidth === "auto" ? "auto" : `${headerWidth}px`,
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};
