import React from "react";
import { LucideIcon } from "lucide-react";

interface ComponentHeaderProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  actions?: React.ReactNode;
  onMouseDown?: (event: React.MouseEvent) => void;
  className?: string;
}

export const ComponentHeader: React.FC<ComponentHeaderProps> = ({
  title,
  icon: Icon,
  iconColor = "bg-blue-500",
  actions,
  onMouseDown,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 cursor-move select-none ${className}`}
      onMouseDown={onMouseDown}
    >
      <div className="flex items-center space-x-2">
        <div
          className={`w-6 h-6 ${iconColor} rounded-full flex items-center justify-center`}
        >
          <Icon className="w-3 h-3 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      {actions && <div className="flex items-center space-x-1">{actions}</div>}
    </div>
  );
};
