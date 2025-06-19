import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { Plus, Minus } from "lucide-react";
import { Button } from "./components/ui/button";
import { Timer } from "./components/Timer";
import { Weather } from "./components/Weather";
import { BitcoinChart } from "./components/BitcoinChart";
import { CurrencyConverter } from "./components/CurrencyConverter";
import { TextNote } from "./components/TextNote";
import { ConfettiButton } from "./components/ConfettiButton";
import { Watch } from "./components/Watch";

const CustomGrid = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);
  const [components, setComponents] = useState([
    { id: 1, x: 100, y: 100, type: "timer" },
    { id: 2, x: 300, y: 200, type: "weather" },
    { id: 3, x: 600, y: 100, type: "bitcoin" },
    { id: 4, x: 100, y: 400, type: "currency" },
    { id: 5, x: 400, y: 400, type: "confetti" },
    { id: 6, x: 700, y: 400, type: "note" },
    { id: 7, x: 1000, y: 100, type: "watch" },
  ]);
  const [selectedComponents, setSelectedComponents] = useState<number[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [initialPositions, setInitialPositions] = useState<
    { id: number; x: number; y: number }[]
  >([]);

  const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(
    null
  );

  const handleDeleteComponent = useCallback((id: number) => {
    console.log(`Deleting component with ID: ${id}`);
    setComponents(prev => prev.filter(component => component.id !== id));
    setSelectedComponents(prev => prev.filter(selectedId => selectedId !== id));
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedComponents.length > 0) {
      setComponents(prev => prev.filter(component => !selectedComponents.includes(component.id)));
      setSelectedComponents([]);
    }
  }, [selectedComponents]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.attr("width", window.innerWidth).attr("height", window.innerHeight);

    zoomBehavior.current = d3
      .zoom<SVGSVGElement, unknown>()
      .on("zoom", (event) => {
        if (!isMultiSelectMode) {
          setTransform(event.transform);
        }
      });

    svg.call(zoomBehavior.current);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "h") {
        setIsMultiSelectMode((prev) => !prev);
        setSelectedComponents([]); // Reset selection when mode changes
      } else if (event.key === "Delete" || event.key === "Backspace") {
        handleDeleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      svg.selectAll("*").remove();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMultiSelectMode, handleDeleteSelected]);

  const handleDragStart = (id: number) => {
    if (isMultiSelectMode && selectedComponents.includes(id)) {
      const positions = selectedComponents.map((selectedId) => {
        const component = components.find((c) => c.id === selectedId);
        return { id: selectedId, x: component?.x || 0, y: component?.y || 0 };
      });
      setInitialPositions(positions);
    } else {
      // Store initial position for single component drag
      const component = components.find((c) => c.id === id);
      if (component) {
        setInitialPositions([{ id, x: component.x, y: component.y }]);
      }
    }
  };

  const handleDrag = useCallback(
    (id: number, deltaX: number, deltaY: number) => {
      if (isMultiSelectMode && selectedComponents.includes(id)) {
        setComponents((prevComponents) =>
          prevComponents.map((component) => {
            const initialPos = initialPositions.find(
              (pos) => pos.id === component.id
            );
            if (initialPos) {
              return {
                ...component,
                x: initialPos.x + deltaX,
                y: initialPos.y + deltaY,
              };
            }
            return component;
          })
        );
      } else {
        // Single component drag - use initial position stored in initialPositions
        const initialPos = initialPositions.find((pos) => pos.id === id);
        if (initialPos) {
          setComponents((prevComponents) =>
            prevComponents.map((component) =>
              component.id === id
                ? {
                    ...component,
                    x: initialPos.x + deltaX,
                    y: initialPos.y + deltaY,
                  }
                : component
            )
          );
        }
      }
    },
    [isMultiSelectMode, selectedComponents, initialPositions]
  );

  const handleSelect = useCallback(
    (id: number) => {
      if (isMultiSelectMode) {
        setSelectedComponents((prev) =>
          prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
      }
    },
    [isMultiSelectMode]
  );

  const handleZoom = useCallback((factor: number) => {
    if (!svgRef.current || !zoomBehavior.current) return;
    const svg = d3.select(svgRef.current);
    zoomBehavior.current.scaleBy(svg, factor);
  }, []);

  const addNewComponent = (type: string) => {
    const newId = Math.max(...components.map((c) => c.id)) + 1;
    console.log(`Adding new ${type} component with ID: ${newId}`);
    setComponents((prev) => [
      ...prev,
      {
        id: newId,
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 200,
        type,
      },
    ]);
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <svg ref={svgRef}></svg>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
          pointerEvents: "none",
        }}
      >
        {components.map((component) => (
          <DraggableComponent
            key={component.id}
            x={component.x}
            y={component.y}
            id={component.id}
            type={component.type}
            onDrag={handleDrag}
            onDragStart={handleDragStart}
            onSelect={handleSelect}
            onDelete={handleDeleteComponent}
            selected={selectedComponents.includes(component.id)}
            transform={transform}
            isMultiSelectMode={isMultiSelectMode}
          />
        ))}
      </div>
      <ControlPanel onZoom={handleZoom} isMultiSelectMode={isMultiSelectMode} />
      <Shelf onAddComponent={addNewComponent} />
    </div>
  );
};

interface DraggableComponentProps {
  x: number;
  y: number;
  id: number;
  type: string;
  onDrag: (id: number, deltaX: number, deltaY: number) => void;
  onDragStart: (id: number) => void;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  selected: boolean;
  transform: d3.ZoomTransform;
  isMultiSelectMode: boolean;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  x,
  y,
  id,
  type,
  onDrag,
  onDragStart,
  onSelect,
  onDelete,
  selected,
  transform,
  isMultiSelectMode,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (event: React.MouseEvent) => {
    if (isMultiSelectMode && !selected) {
      onSelect(id);
    } else {
      setIsDragging(true);
      const mousePos = { x: event.clientX, y: event.clientY };
      setDragStartPos(mousePos);
      onDragStart(id);
    }
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(id);
  };

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging) return;

    const currentMousePos = { x: event.clientX, y: event.clientY };
    const deltaX = (currentMousePos.x - dragStartPos.x) / transform.k;
    const deltaY = (currentMousePos.y - dragStartPos.y) / transform.k;

    onDrag(id, deltaX, deltaY);
  }, [isDragging, dragStartPos, transform.k, onDrag, id]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  const renderComponent = () => {
    switch (type) {
      case "timer":
        return <Timer />;
      case "weather":
        return <Weather />;
      case "bitcoin":
        return <BitcoinChart />;
      case "currency":
        return <CurrencyConverter />;
      case "note":
        return <TextNote />;
      case "confetti":
        return <ConfettiButton />;
      case "watch":
        return <Watch />;
      default:
        return (
          <div className="w-20 bg-slate-800 rounded-md p-2">
            <p className="text-white text-center">{id}</p>
          </div>
        );
    }
  };

  return (
    <div
      className={`absolute pointer-events-auto cursor-move ${
        selected ? "ring-2 ring-blue-500" : ""
      } group`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      {renderComponent()}
      
      {/* Delete button - appears on hover */}
      <button
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600 z-10"
        onClick={handleDeleteClick}
        onMouseDown={(e) => e.stopPropagation()}
        title="Delete component"
      >
        ×
      </button>
    </div>
  );
};

interface ControlPanelProps {
  onZoom: (factor: number) => void;
  isMultiSelectMode: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onZoom,
  isMultiSelectMode,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "10px",
        left: "10px",
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
      className="flex flex-col gap-2"
    >
      <Button onClick={() => onZoom(1.2)} variant={"ghost"} size="sm">
        <Plus className="w-4 h-4" />
      </Button>
      <Button onClick={() => onZoom(0.8)} variant={"ghost"} size="sm">
        <Minus className="w-4 h-4" />
      </Button>
      <p className="text-sm mt-2">
        Mode: {isMultiSelectMode ? "Multi-Select (H)" : "Pan"}
      </p>
    </div>
  );
};

interface ShelfProps {
  onAddComponent: (type: string) => void;
}

const Shelf: React.FC<ShelfProps> = ({ onAddComponent }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        width: "200px",
      }}
      className="flex flex-col gap-2"
    >
      <h3 className="text-sm font-semibold mb-2">Components</h3>
      <Button
        onClick={() => onAddComponent("timer")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        Add Timer
      </Button>
      <Button
        onClick={() => onAddComponent("weather")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        Add Weather
      </Button>
      <Button
        onClick={() => onAddComponent("bitcoin")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        ₿ Add Bitcoin Chart
      </Button>
      <Button
        onClick={() => onAddComponent("currency")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        💱 Add Currency Converter
      </Button>
      <Button
        onClick={() => onAddComponent("note")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        📝 Add Markdown Note
      </Button>
      <Button
        onClick={() => onAddComponent("confetti")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        🎉 Add Confetti Button
      </Button>
      <Button
        onClick={() => onAddComponent("watch")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        ⌚ Add Watch
      </Button>
      <p className="text-xs text-gray-500 mt-2">
        Press 'H' to toggle multi-select mode
      </p>
      <p className="text-xs text-gray-500">
        Press 'Delete' to remove selected components
      </p>
      <p className="text-xs text-gray-500">
        Hover over components to see delete button
      </p>
    </div>
  );
};

export default CustomGrid;
