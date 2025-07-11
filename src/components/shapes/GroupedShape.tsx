import React, { useState, useRef } from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

interface GroupedShapeProps extends Omit<BaseShapeProps, "children"> {
  // Group properties
  groupName?: string;
  onGroupNameChange?: (name: string) => void;
  children?: React.ReactNode;
  groupType?: "frame" | "container" | "section" | "layer";
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  borderStyle?: "solid" | "dashed" | "dotted";
  showHeader?: boolean;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const GroupedShape: React.FC<GroupedShapeProps> = ({
  groupName = "Group",
  onGroupNameChange,
  children,
  groupType = "frame",
  backgroundColor = "transparent",
  borderColor = "#d1d5db",
  borderWidth = 2,
  borderRadius = 8,
  borderStyle = "dashed",
  showHeader = true,
  collapsible = false,
  collapsed = false,
  onToggleCollapse,
  selected = false,
  ...props
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(groupName);
  const groupRef = useRef<HTMLDivElement>(null);

  const handleNameDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingName(true);
    setEditName(groupName);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (onGroupNameChange) {
      onGroupNameChange(editName);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNameBlur();
    } else if (e.key === "Escape") {
      setIsEditingName(false);
      setEditName(groupName);
    }
  };

  const getGroupTypeStyle = () => {
    switch (groupType) {
      case "frame":
        return {
          backgroundColor: "rgba(59, 130, 246, 0.05)", // blue tint
          borderColor: "#3b82f6",
          headerColor: "#3b82f6",
        };
      case "container":
        return {
          backgroundColor: "rgba(16, 185, 129, 0.05)", // green tint
          borderColor: "#10b981",
          headerColor: "#10b981",
        };
      case "section":
        return {
          backgroundColor: "rgba(139, 92, 246, 0.05)", // purple tint
          borderColor: "#8b5cf6",
          headerColor: "#8b5cf6",
        };
      case "layer":
        return {
          backgroundColor: "rgba(245, 158, 11, 0.05)", // orange tint
          borderColor: "#f59e0b",
          headerColor: "#f59e0b",
        };
      default:
        return {
          backgroundColor,
          borderColor,
          headerColor: borderColor,
        };
    }
  };

  const typeStyle = getGroupTypeStyle();

  return (
    <BaseShape {...props} selected={selected}>
      <div
        ref={groupRef}
        className="w-full h-full relative"
        style={{
          backgroundColor: collapsed
            ? "rgba(0,0,0,0.02)"
            : typeStyle.backgroundColor,
          border: `${borderWidth}px ${borderStyle} ${typeStyle.borderColor}`,
          borderRadius: `${borderRadius}px`,
          minHeight: collapsed ? "40px" : "100px",
        }}
      >
        {/* Group Header */}
        {showHeader && (
          <div
            className="absolute -top-6 left-0 right-0 flex items-center gap-2 px-2 py-1 rounded-t"
            style={{
              backgroundColor: typeStyle.headerColor,
              color: "white",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {/* Collapse toggle */}
            {collapsible && (
              <button
                onClick={onToggleCollapse}
                className="w-4 h-4 flex items-center justify-center rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                style={{ fontSize: "10px" }}
              >
                {collapsed ? "+" : "−"}
              </button>
            )}

            {/* Group name */}
            {isEditingName ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                autoFocus
                className="bg-transparent border-none outline-none text-white placeholder-white placeholder-opacity-70 flex-1"
                style={{ fontSize: "12px" }}
              />
            ) : (
              <span
                onDoubleClick={handleNameDoubleClick}
                className="cursor-text flex-1"
              >
                {groupName}
              </span>
            )}

            {/* Group type indicator */}
            <span className="text-xs opacity-70 uppercase">{groupType}</span>
          </div>
        )}

        {/* Group content */}
        {!collapsed && (
          <div className="w-full h-full p-2 relative">
            {children}
            {/* Drop zone indicator when selected */}
            {selected && (
              <div className="absolute inset-2 border-2 border-dashed border-gray-300 opacity-50 flex items-center justify-center">
                <span className="text-gray-500 text-sm">
                  Drop components here
                </span>
              </div>
            )}
          </div>
        )}

        {/* Collapsed state indicator */}
        {collapsed && (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            {groupName} (collapsed)
          </div>
        )}

        {/* Resize handles for groups */}
        {selected && !collapsed && (
          <>
            {/* Corner resize handles */}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded cursor-se-resize" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded cursor-ne-resize" />
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded cursor-nw-resize" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded cursor-sw-resize" />
          </>
        )}
      </div>
    </BaseShape>
  );
};
