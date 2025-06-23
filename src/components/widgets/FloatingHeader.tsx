import React from "react";
import { LucideIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingHeaderProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  actions?: React.ReactNode;
  onDelete?: (event: React.MouseEvent) => void;
  className?: string;
  x: number;
  y: number;
}

export const FloatingHeader: React.FC<FloatingHeaderProps> = ({
  title,
  icon: Icon,
  iconColor = "bg-primary",
  actions,
  onDelete,
  className = "",
  x,
  y,
}) => {
  return (
    <div
      className={cn(
        "absolute z-50 flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-lg select-none pointer-events-auto",
        "min-w-[200px]",
        className
      )}
      style={{
        left: `${x}px`,
        top: `${y - 50}px`, // Position above the component
      }}
    >
      <div className="flex items-center space-x-2">
        <div
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center",
            iconColor
          )}
        >
          <Icon className="w-3 h-3 text-white" />
        </div>
        <h3 className="text-xs font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="flex items-center space-x-1">
        {actions}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
            onClick={onDelete}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default FloatingHeader;
