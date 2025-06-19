import React, { useState } from "react";
import { ChevronDown, ChevronRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getComponentsByCategory } from "@/components/ComponentRegistry";

interface SidebarProps {
  onDragStart: (componentType: string, event: React.DragEvent) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onDragStart }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["Utilities", "Data"])
  );

  const componentsByCategory = getComponentsByCategory();

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDragStart = (componentType: string, event: React.DragEvent) => {
    // Set drag data
    event.dataTransfer.setData("text/plain", componentType);
    event.dataTransfer.effectAllowed = "copy";

    // Call parent handler
    onDragStart(componentType, event);
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Package className="w-5 h-5 mr-2" />
          Components
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Drag components to the canvas
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(componentsByCategory).map(([category, components]) => (
          <div key={category} className="mb-2">
            <Button
              variant="ghost"
              onClick={() => toggleCategory(category)}
              className="w-full justify-start p-2 h-auto text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {expandedCategories.has(category) ? (
                <ChevronDown className="w-4 h-4 mr-1" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1" />
              )}
              {category}
            </Button>

            {expandedCategories.has(category) && (
              <div className="ml-2 mt-1 space-y-1">
                {Object.entries(components).map(([type, config]) => (
                  <div
                    key={type}
                    draggable
                    onDragStart={(e) => handleDragStart(type, e)}
                    className="group flex items-center p-3 bg-white rounded-md border border-gray-200 cursor-move hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0 mr-3 text-gray-500 group-hover:text-blue-500 transition-colors">
                        {config.icon}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {config.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Drag
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        <div className="mb-2">
          <strong>How to add components:</strong>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Create a React component</li>
          <li>Add it to ComponentRegistry.tsx</li>
          <li>It will appear here automatically</li>
        </ol>
      </div>
    </div>
  );
};

export default Sidebar;
