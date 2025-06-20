import React from "react";
import { Circle, Square, Diamond } from "lucide-react";
import { ComponentHeader } from "./ComponentHeader";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FlowNodeProps {
  nodeType?: "start" | "process" | "decision" | "end";
  label?: string;
  color?: string;
  width?: number;
  height?: number;
  onHeaderMouseDown?: (event: React.MouseEvent) => void;
  onDelete?: (event: React.MouseEvent) => void;
}

export const FlowNode: React.FC<FlowNodeProps> = ({
  nodeType = "process",
  label = "Process",
  color = "#3b82f6",
  width = 120,
  height = 120,
  onHeaderMouseDown,
  onDelete,
}) => {
  const getIcon = () => {
    switch (nodeType) {
      case "start":
        return Circle;
      case "end":
        return Circle;
      case "decision":
        return Diamond;
      default:
        return Square;
    }
  };

  const getIconColor = () => {
    switch (nodeType) {
      case "start":
        return "bg-green-500";
      case "end":
        return "bg-red-500";
      case "decision":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  const getShapeStyle = () => {
    const baseStyle = {
      width: "80px",
      height: "80px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto",
      color: "white",
      fontSize: "12px",
      fontWeight: "600",
      textAlign: "center" as const,
      backgroundColor: color,
      border: "2px solid white",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    };

    switch (nodeType) {
      case "start":
      case "end":
        return {
          ...baseStyle,
          borderRadius: "50%",
        };
      case "decision":
        return {
          ...baseStyle,
          borderRadius: "4px",
          transform: "rotate(45deg)",
          marginTop: "8px",
          marginBottom: "8px",
        };
      default:
        return {
          ...baseStyle,
          borderRadius: "8px",
        };
    }
  };

  const getTitle = () => {
    return `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`;
  };

  return (
    <Card className="overflow-hidden" style={{ width, height }}>
      <ComponentHeader
        title={getTitle()}
        icon={getIcon()}
        iconColor={getIconColor()}
        onMouseDown={onHeaderMouseDown}
        onDelete={onDelete}
      />

      <CardContent className="flex-grow flex flex-col items-center justify-center p-4">
        <div style={getShapeStyle()}>
          <span
            style={{
              transform: nodeType === "decision" ? "rotate(-45deg)" : "none",
              lineHeight: "1.2",
            }}
          >
            {label}
          </span>
        </div>
        {nodeType === "decision" && (
          <div className="text-xs text-gray-500 mt-2 text-center">
            Decision Point
          </div>
        )}
        {nodeType === "start" && (
          <div className="text-xs text-gray-500 mt-2 text-center">
            Start Point
          </div>
        )}
        {nodeType === "end" && (
          <div className="text-xs text-gray-500 mt-2 text-center">
            End Point
          </div>
        )}
        {nodeType === "process" && (
          <div className="text-xs text-gray-500 mt-2 text-center">
            Process Step
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FlowNode;
