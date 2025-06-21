import React from "react";
import { LucideIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ComponentHeaderProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  actions?: React.ReactNode;
  onMouseDown?: (event: React.MouseEvent) => void;
  onDelete?: (event: React.MouseEvent) => void;
  className?: string;
}

export const ComponentHeader: React.FC<ComponentHeaderProps> = ({
  title,
  icon: Icon,
  iconColor = "bg-primary",
  actions,
  onMouseDown,
  onDelete,
  className = "",
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 border-b bg-muted/50 cursor-move select-none rounded-t-lg",
        className
      )}
      onMouseDown={onMouseDown}
    >
      <div className="flex items-center space-x-3">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            iconColor
          )}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="flex items-center space-x-1">
        {actions}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
            onMouseDown={(e) => e.stopPropagation()}
            title="Delete component"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
