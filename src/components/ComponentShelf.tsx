import React, { useState } from "react";
import * as d3 from "d3";

interface ShelfProps {
  onAddComponent: (type: string, x: number, y: number) => void;
  transform: d3.ZoomTransform;
}

interface ComponentDefinition {
  type: string;
  label: string;
  icon: string;
  description: string;
}

interface Category {
  name: string;
  icon: string;
  components: ComponentDefinition[];
}

const COMPONENT_CATEGORIES: Category[] = [
  {
    name: "Utilities",
    icon: "⚙️",
    components: [
      {
        type: "timer",
        label: "Timer",
        icon: "⏰",
        description: "Countdown timer",
      },
      {
        type: "watch",
        label: "Watch",
        icon: "⌚",
        description: "Digital clock",
      },
      {
        type: "note",
        label: "Note",
        icon: "📝",
        description: "Markdown text editor",
      },
      {
        type: "confetti",
        label: "Confetti",
        icon: "🎉",
        description: "Celebration button",
      },
    ],
  },
  {
    name: "Data & Finance",
    icon: "📊",
    components: [
      {
        type: "weather",
        label: "Weather",
        icon: "🌤️",
        description: "Weather widget",
      },
      {
        type: "bitcoin",
        label: "Crypto Chart",
        icon: "💰",
        description: "Cryptocurrency prices",
      },
      {
        type: "currency",
        label: "Currency",
        icon: "💱",
        description: "Currency converter",
      },
    ],
  },
  {
    name: "Media",
    icon: "🎵",
    components: [
      {
        type: "youtubeVideo",
        label: "YouTube",
        icon: "🎬",
        description: "YouTube video player",
      },
      {
        type: "soundcloud",
        label: "SoundCloud",
        icon: "🔊",
        description: "SoundCloud track",
      },
      {
        type: "spotify",
        label: "Spotify",
        icon: "🎵",
        description: "Spotify player",
      },
      {
        type: "scrollingtext",
        label: "Scrolling Text",
        icon: "📣",
        description: "Animated text banner",
      },
    ],
  },
  {
    name: "Flow & Diagram",
    icon: "🔄",
    components: [
      {
        type: "flowCanvas",
        label: "Flow Canvas",
        icon: "🔄",
        description: "Flow diagram canvas",
      },
      {
        type: "flowNodeStart",
        label: "Start Node",
        icon: "▶️",
        description: "Flow start node",
      },
      {
        type: "flowNodeProcess",
        label: "Process Node",
        icon: "⚡",
        description: "Flow process node",
      },
      {
        type: "flowNodeDecision",
        label: "Decision Node",
        icon: "❓",
        description: "Flow decision node",
      },
      {
        type: "flowNodeEnd",
        label: "End Node",
        icon: "🏁",
        description: "Flow end node",
      },
    ],
  },
  {
    name: "Links & Web",
    icon: "🌐",
    components: [
      {
        type: "stylishlink",
        label: "Stylish Link",
        icon: "🔗",
        description: "Styled web link",
      },
    ],
  },
];

const DraggableComponentItem: React.FC<{
  component: ComponentDefinition;
  onDragStart: (type: string, event: React.DragEvent) => void;
}> = ({ component, onDragStart }) => {
  const handleDragStart = (event: React.DragEvent) => {
    onDragStart(component.type, event);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-center gap-2 p-2 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-colors"
      title={component.description}
    >
      <span className="text-lg">{component.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {component.label}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {component.description}
        </p>
      </div>
    </div>
  );
};

const CategorySection: React.FC<{
  category: Category;
  onDragStart: (type: string, event: React.DragEvent) => void;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ category, onDragStart, isExpanded, onToggle }) => {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{category.icon}</span>
          <span className="text-sm font-medium text-gray-700">
            {category.name}
          </span>
          <span className="text-xs text-gray-400">
            ({category.components.length})
          </span>
        </div>
        <span
          className={`text-gray-400 transition-transform ${
            isExpanded ? "rotate-90" : ""
          }`}
        >
          ▶
        </span>
      </button>
      {isExpanded && (
        <div className="px-2 pb-2 space-y-1">
          {category.components.map((component) => (
            <DraggableComponentItem
              key={component.type}
              component={component}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ComponentShelf: React.FC<ShelfProps> = ({
  onAddComponent,
  transform,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["Utilities"]) // Start with Utilities expanded
  );
  const [isDragOverBoard, setIsDragOverBoard] = useState(false);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const handleDragStart = (type: string, event: React.DragEvent) => {
    event.dataTransfer.setData("component-type", type);
    event.dataTransfer.effectAllowed = "copy";

    // Create a custom drag image
    const dragElement = document.createElement("div");
    dragElement.innerHTML = `<div style="
      padding: 8px 12px; 
      background: rgba(59, 130, 246, 0.9); 
      color: white; 
      border-radius: 6px; 
      font-size: 12px; 
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    ">+ ${
      COMPONENT_CATEGORIES.flatMap((c) => c.components).find(
        (c) => c.type === type
      )?.label
    }</div>`;
    dragElement.style.position = "absolute";
    dragElement.style.top = "-1000px";
    document.body.appendChild(dragElement);
    event.dataTransfer.setDragImage(dragElement, 0, 0);

    // Clean up drag image after drag starts
    setTimeout(() => {
      document.body.removeChild(dragElement);
    }, 0);
  };

  // Handle drop events on the whiteboard
  React.useEffect(() => {
    const handleDragOver = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes("component-type")) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setIsDragOverBoard(true);
      }
    };

    const handleDragLeave = (event: DragEvent) => {
      // Only hide indicator when leaving the window or entering a child element that doesn't accept drops
      if (
        !event.relatedTarget ||
        !(event.relatedTarget as Element).closest("[data-drop-zone]")
      ) {
        setIsDragOverBoard(false);
      }
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      const componentType = event.dataTransfer?.getData("component-type");
      if (componentType) {
        // Convert screen coordinates to whiteboard coordinates
        const x = (event.clientX - transform.x) / transform.k;
        const y = (event.clientY - transform.y) / transform.k;
        onAddComponent(componentType, x, y);
      }
      setIsDragOverBoard(false);
    };

    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("drop", handleDrop);
    };
  }, [onAddComponent, transform]);

  return (
    <>
      <div
        data-sidebar
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "280px",
          maxHeight: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Components</h3>
          <p className="text-xs text-gray-500 mt-1">
            Drag components to the canvas
          </p>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto">
          {COMPONENT_CATEGORIES.map((category) => (
            <CategorySection
              key={category.name}
              category={category}
              onDragStart={handleDragStart}
              isExpanded={expandedCategories.has(category.name)}
              onToggle={() => toggleCategory(category.name)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <div className="text-xs text-gray-600 space-y-1">
            <p>
              <strong>Usage:</strong>
            </p>
            <p>• Drag components to canvas</p>
            <p>• Delete: Select + Delete key</p>
            <p>• Multi-select: Marquee or Ctrl+click</p>
            <p>
              <strong>Shortcuts:</strong> 1 (reset), Shift+1 (fit), 2 (zoom
              selection)
            </p>
          </div>
        </div>
      </div>

      {/* Drop indicator overlay */}
      {isDragOverBoard && (
        <div
          data-drop-zone
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            border: "2px dashed #3b82f6",
            borderRadius: "8px",
            pointerEvents: "none",
            zIndex: 9998,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.9)",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "500",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            Drop to add component
          </div>
        </div>
      )}
    </>
  );
};
