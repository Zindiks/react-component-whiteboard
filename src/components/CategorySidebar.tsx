import React, { useState } from "react";
import { X } from "lucide-react";
import { type Category } from "../constants/componentCategories";

interface CategorySidebarProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  category,
  isOpen,
  onClose,
}) => {
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    componentType: string
  ) => {
    setDraggedComponent(componentType);
    e.dataTransfer.setData("text/plain", componentType);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragEnd = () => {
    setDraggedComponent(null);
  };

  if (!isOpen || !category) {
    return null;
  }

  return (
    <div
      className="fixed left-4 top-1/2 transform -translate-y-1/2 w-80 bg-background shadow-2xl rounded-2xl z-50 transition-all duration-300 border"
      style={{ maxHeight: "calc(100vh - 120px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b rounded-t-2xl">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <h2 className="text-lg font-semibold text-foreground">
            {category.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Components List */}
      <div
        className="p-4 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        <div className="grid gap-3">
          {category.components.map((component) => (
            <div
              key={component.type}
              draggable
              onDragStart={(e) => handleDragStart(e, component.type)}
              onDragEnd={handleDragEnd}
              className={`
                  p-4 border rounded-xl bg-card
                  cursor-grab active:cursor-grabbing
                  hover:border-primary hover:bg-muted hover:shadow-md
                  transition-all duration-200 shadow-sm
                  ${
                    draggedComponent === component.type
                      ? "opacity-50 border-primary bg-muted shadow-lg"
                      : ""
                  }
                `}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-xl">{component.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {component.label}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {component.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
