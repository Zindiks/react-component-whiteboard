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
import { ScrollingText } from "./components/ScrollingText";
import { YouTubeVideo } from "./components/YouTubeVideo";
import { SoundCloudWidget } from "./components/SoundCloudWidget";
import { SpotifyWidget } from "./components/SpotifyWidget";
import { StylishLink } from "./components/StylishLink";
import { FlowCanvas } from "./components/FlowCanvas";
import { FlowNode } from "./components/FlowNode";

const CustomGrid = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);
  interface Component {
    id: number;
    x: number;
    y: number;
    type: string;
    width?: number;
    height?: number;
    zIndex?: number;
  }

  const [components, setComponents] = useState<Component[]>([
    { id: 1, x: 100, y: 100, type: "timer", zIndex: 1 },
    { id: 2, x: 300, y: 200, type: "weather", zIndex: 2 },
    { id: 3, x: 600, y: 100, type: "bitcoin", zIndex: 3 },
    { id: 4, x: 100, y: 400, type: "currency", zIndex: 4 },
    { id: 5, x: 400, y: 400, type: "confetti", zIndex: 5 },
    { id: 6, x: 700, y: 400, type: "note", zIndex: 6 },
    { id: 7, x: 1000, y: 100, type: "watch", zIndex: 7 },
    { id: 8, x: 1000, y: 400, type: "scrollingtext", zIndex: 8 },
    { id: 9, x: 500, y: 200, type: "youtubeVideo", zIndex: 9 },
    { id: 10, x: 800, y: 200, type: "soundcloud", zIndex: 10 },
    { id: 11, x: 300, y: 600, type: "spotify", zIndex: 11 },
    { id: 12, x: 600, y: 600, type: "stylishlink", zIndex: 12 },
    {
      id: 13,
      x: 800,
      y: 600,
      type: "flowCanvas",
      width: 600,
      height: 300,
      zIndex: 13,
    },
    // Flow nodes for demonstration
    { id: 14, x: 1400, y: 100, type: "flowNodeStart", zIndex: 14 },
    { id: 15, x: 1550, y: 100, type: "flowNodeProcess", zIndex: 15 },
    { id: 16, x: 1700, y: 100, type: "flowNodeDecision", zIndex: 16 },
    { id: 17, x: 1850, y: 100, type: "flowNodeEnd", zIndex: 17 },
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
    setComponents((prev) => prev.filter((component) => component.id !== id));
    setSelectedComponents((prev) =>
      prev.filter((selectedId) => selectedId !== id)
    );
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedComponents.length > 0) {
      setComponents((prev) =>
        prev.filter((component) => !selectedComponents.includes(component.id))
      );
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
    // Bring the component to the front when starting to drag
    bringToFront(id);

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
    const highestZIndex = Math.max(...components.map((c) => c.zIndex || 0), 0);

    console.log(`Adding new ${type} component with ID: ${newId}`);
    setComponents((prev) => [
      ...prev,
      {
        id: newId,
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 200,
        type,
        zIndex: highestZIndex + 1, // Place new component on top
      },
    ]);
  };

  const bringToFront = useCallback((id: number) => {
    setComponents((prevComponents) => {
      const highestZIndex = Math.max(
        ...prevComponents.map((comp) => comp.zIndex || 0),
        0
      );
      return prevComponents.map((component) =>
        component.id === id
          ? { ...component, zIndex: highestZIndex + 1 }
          : component
      );
    });
  }, []);

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
        {/* Sort components by z-index before rendering */}
        {[...components]
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
          .map((component) => (
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
              zIndex={component.zIndex || 0}
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
  zIndex?: number;
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
  zIndex,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

  // Header-specific mouse down handler for dragging
  const handleHeaderMouseDown = (event: React.MouseEvent) => {
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

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging) return;

      const currentMousePos = { x: event.clientX, y: event.clientY };
      const deltaX = (currentMousePos.x - dragStartPos.x) / transform.k;
      const deltaY = (currentMousePos.y - dragStartPos.y) / transform.k;

      onDrag(id, deltaX, deltaY);
    },
    [isDragging, dragStartPos, transform.k, onDrag, id]
  );

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
        return (
          <Timer
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "weather":
        return (
          <Weather
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "bitcoin":
        return (
          <BitcoinChart
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "currency":
        return (
          <CurrencyConverter
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "note":
        return (
          <TextNote
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "confetti":
        return (
          <ConfettiButton
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "watch":
        return (
          <Watch
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "scrollingtext":
        return (
          <ScrollingText
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "youtubeVideo":
        return (
          <YouTubeVideo
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "soundcloud":
        return (
          <SoundCloudWidget
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "spotify":
        return (
          <SpotifyWidget
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "stylishlink":
        return (
          <StylishLink
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "flowCanvas":
        return (
          <FlowCanvas
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "flowNodeStart":
        return (
          <FlowNode
            nodeType="start"
            label="Start"
            color="#10b981"
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "flowNodeProcess":
        return (
          <FlowNode
            nodeType="process"
            label="Process"
            color="#3b82f6"
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "flowNodeDecision":
        return (
          <FlowNode
            nodeType="decision"
            label="Decision"
            color="#f59e0b"
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
      case "flowNodeEnd":
        return (
          <FlowNode
            nodeType="end"
            label="End"
            color="#ef4444"
            onHeaderMouseDown={handleHeaderMouseDown}
            onDelete={handleDeleteClick}
          />
        );
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
      className={`absolute pointer-events-auto ${
        selected ? "ring-2 ring-blue-500" : ""
      } group`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        zIndex: zIndex,
      }}
    >
      {renderComponent()}
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
        💰 Add Crypto Chart
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
      <Button
        onClick={() => onAddComponent("scrollingtext")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        📣 Add Scrolling Text
      </Button>
      <Button
        onClick={() => onAddComponent("youtubeVideo")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        🎬 Add YouTube Video
      </Button>
      <Button
        onClick={() => onAddComponent("soundcloud")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        🔊 Add SoundCloud Track
      </Button>
      <Button
        onClick={() => onAddComponent("spotify")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        🎵 Add Spotify Player
      </Button>
      <Button
        onClick={() => onAddComponent("stylishlink")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        🔗 Add Stylish Link
      </Button>
      <Button
        onClick={() => onAddComponent("flowCanvas")}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        🔄 Add Flow Connections
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
