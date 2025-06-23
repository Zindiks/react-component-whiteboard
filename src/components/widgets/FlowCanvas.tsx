import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useWhiteboardStore, Connection } from "@/store/whiteboard";
import { Card } from "../ui/card";

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ComponentPositions {
  [componentId: string]: Position;
}

interface FlowCanvasProps {
  width?: number;
  height?: number;
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({
  width = 800,
  height = 600,
}) => {
  // Get state and actions from the whiteboard store
  const components = useWhiteboardStore((state) => state.components);
  const connections = useWhiteboardStore((state) => state.connections);
  const isCreatingConnection = useWhiteboardStore(
    (state) => state.isCreatingConnection
  );
  const connectionStartComponent = useWhiteboardStore(
    (state) => state.connectionStartComponent
  );
  const selectedConnection = useWhiteboardStore(
    (state) => state.selectedConnection
  );
  const connectionType = useWhiteboardStore((state) => state.connectionType);
  const connectionColor = useWhiteboardStore((state) => state.connectionColor);

  const startConnectionCreation = useWhiteboardStore(
    (state) => state.startConnectionCreation
  );
  const finishConnectionCreation = useWhiteboardStore(
    (state) => state.finishConnectionCreation
  );
  const cancelConnectionCreation = useWhiteboardStore(
    (state) => state.cancelConnectionCreation
  );
  const updateConnection = useWhiteboardStore(
    (state) => state.updateConnection
  );
  const removeConnection = useWhiteboardStore(
    (state) => state.removeConnection
  );
  const selectConnection = useWhiteboardStore(
    (state) => state.selectConnection
  );
  const setConnectionType = useWhiteboardStore(
    (state) => state.setConnectionType
  );
  const setConnectionColor = useWhiteboardStore(
    (state) => state.setConnectionColor
  );

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [componentPositions, setComponentPositions] =
    useState<ComponentPositions>({});
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [labelText, setLabelText] = useState<string>("");

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);

  const colors = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#6b7280", // gray
  ];

  const connectionStyles = [
    { type: "curved", label: "⌒", name: "Curved" },
    { type: "straight", label: "───", name: "Straight" },
    { type: "dotted", label: "⋯", name: "Dotted" },
    { type: "dashed", label: "- -", name: "Dashed" },
  ];

  const [showTemplates, setShowTemplates] = useState(false);
  // Remove showNodePalette since nodes are now individual draggable components
  const [showStats, setShowStats] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);

  // Initialize component positions from components in the store
  useEffect(() => {
    const positions: ComponentPositions = {};

    components.forEach((component) => {
      positions[component.id] = {
        x: component.x,
        y: component.y,
        width: component.width || 200, // Default width if not specified
        height: component.height || 150, // Default height if not specified
      };
    });

    setComponentPositions(positions);
  }, [components]);

  useEffect(() => {
    if (editingLabel && labelInputRef.current) {
      labelInputRef.current.focus();
    }
  }, [editingLabel]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isCreatingConnection) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        setCursorPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    }
  };

  const startConnection = (componentId: string) => {
    startConnectionCreation(componentId);
  };

  const finishConnection = (componentId: string) => {
    finishConnectionCreation(componentId);
  };

  const cancelConnection = () => {
    cancelConnectionCreation();
  };

  const deleteConnection = (connectionId: string) => {
    removeConnection(connectionId);
  };

  const handleConnectionClick = (connectionId: string) => {
    if (selectedConnection === connectionId) {
      selectConnection(null);
    } else {
      selectConnection(connectionId);
      const connection = connections.find((conn) => conn.id === connectionId);
      if (connection) {
        setConnectionType(connection.type);
        setConnectionColor(connection.color);
      }
    }
  };

  const startEditingLabel = (connectionId: string) => {
    const connection = connections.find((conn) => conn.id === connectionId);
    setEditingLabel(connectionId);
    setLabelText(connection?.label || "");
  };

  const saveLabel = () => {
    if (editingLabel) {
      updateConnection(editingLabel, { label: labelText });
      setEditingLabel(null);
    }
  };

  const updateConnectionStyle = (
    newType?: "straight" | "curved" | "dotted" | "dashed",
    newColor?: string
  ) => {
    if (selectedConnection) {
      const updates: Partial<Connection> = {};
      if (newType) updates.type = newType;
      if (newColor) updates.color = newColor;

      updateConnection(selectedConnection, updates);

      if (newType) setConnectionType(newType);
      if (newColor) setConnectionColor(newColor);
    }
  };

  // Helper to get component center position
  const getComponentCenter = (
    componentId: string
  ): { x: number; y: number } | null => {
    const position = componentPositions[componentId];
    if (!position) return null;

    return {
      x: position.x + position.width / 2,
      y: position.y + position.height / 2,
    };
  };

  // Calculate path for connection
  const getConnectionPath = (connection: Connection): string => {
    const fromCenter = getComponentCenter(connection.fromId);
    const toCenter = getComponentCenter(connection.toId);

    if (!fromCenter || !toCenter) return "";

    if (
      connection.type === "straight" ||
      connection.type === "dotted" ||
      connection.type === "dashed"
    ) {
      return `M ${fromCenter.x} ${fromCenter.y} L ${toCenter.x} ${toCenter.y}`;
    } else {
      // Curved connection
      const mx = (fromCenter.x + toCenter.x) / 2;
      const my = (fromCenter.y + toCenter.y) / 2;
      const dx = toCenter.x - fromCenter.x;
      const dy = toCenter.y - fromCenter.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Adjust curve based on distance
      const curve = Math.min(distance * 0.3, 80);

      // Find perpendicular point for control point
      const angle = Math.atan2(dy, dx) - Math.PI / 2;
      const controlX = mx + Math.cos(angle) * curve;
      const controlY = my + Math.sin(angle) * curve;

      return `M ${fromCenter.x} ${fromCenter.y} Q ${controlX} ${controlY} ${toCenter.x} ${toCenter.y}`;
    }
  };

  // Calculate label position for connection
  const getLabelPosition = (connection: Connection) => {
    const fromCenter = getComponentCenter(connection.fromId);
    const toCenter = getComponentCenter(connection.toId);

    if (!fromCenter || !toCenter) return { x: 0, y: 0 };

    if (connection.type === "straight") {
      return {
        x: (fromCenter.x + toCenter.x) / 2,
        y: (fromCenter.y + toCenter.y) / 2,
      };
    } else {
      // For curved connections, position label near the control point
      const mx = (fromCenter.x + toCenter.x) / 2;
      const my = (fromCenter.y + toCenter.y) / 2;
      const dx = toCenter.x - fromCenter.x;
      const dy = toCenter.y - fromCenter.y;
      const angle = Math.atan2(dy, dx) - Math.PI / 2;
      const curve = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.3, 80);

      return {
        x: mx + Math.cos(angle) * curve * 0.8,
        y: my + Math.sin(angle) * curve * 0.8,
      };
    }
  };

  // Get arrow marker ID for a specific connection
  const getArrowMarkerId = (connection: Connection) => {
    const colorHex = connection.color.replace("#", "");
    return `arrow-${colorHex}`;
  };

  // Export flow data
  const exportFlowData = () => {
    const flowData = {
      connections: connections,
      components: components.map((comp) => ({
        id: comp.id,
        type: comp.type,
        x: comp.x,
        y: comp.y,
        width: comp.width,
        height: comp.height,
      })),
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(flowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `flow-diagram-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import flow data
  const importFlowData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const flowData = JSON.parse(e.target?.result as string);
        // Here you would update the store with the imported data
        console.log("Imported flow data:", flowData);
      } catch (error) {
        console.error("Failed to import flow data:", error);
      }
    };
    reader.readAsText(file);
  };

  // Flow templates
  const flowTemplates = [
    {
      id: "simple-process",
      name: "Simple Process",
      description: "Start → Process → End",
      connections: [],
    },
    {
      id: "decision-tree",
      name: "Decision Tree",
      description: "Start → Decision → Yes/No → End",
      connections: [],
    },
    {
      id: "workflow",
      name: "Workflow",
      description: "Multi-step workflow process",
      connections: [],
    },
  ];

  const applyTemplate = (templateId: string) => {
    const template = flowTemplates.find((t) => t.id === templateId);
    if (template) {
      // Apply template logic here
      console.log("Applying template:", template.name);
    }
  };

  // Connection statistics
  const getConnectionStats = () => {
    return {
      total: connections.length,
      types: {
        straight: connections.filter((c) => c.type === "straight").length,
        curved: connections.filter((c) => c.type === "curved").length,
        dotted: connections.filter((c) => c.type === "dotted").length,
        dashed: connections.filter((c) => c.type === "dashed").length,
      },
      withLabels: connections.filter((c) => c.label).length,
    };
  };

  const stats = getConnectionStats();

  // Bulk operations for connections
  const selectAllConnections = () => {
    connections.forEach((conn) => selectConnection(conn.id));
  };

  const deleteAllConnections = () => {
    if (window.confirm("Delete all connections?")) {
      connections.forEach((conn) => removeConnection(conn.id));
    }
  };

  const duplicateSelectedConnection = () => {
    if (!selectedConnection) return;

    const connection = connections.find((c) => c.id === selectedConnection);
    if (connection) {
      // Find components near the original connection endpoints
      const fromComp = components.find((c) => c.id === connection.fromId);
      const toComp = components.find((c) => c.id === connection.toId);

      if (fromComp && toComp) {
        // Create a duplicate connection with slight offset if possible
        console.log("Duplicating connection:", connection);
      }
    }
  };

  // Auto-layout for connections
  const autoArrangeConnections = () => {
    // Simple auto-arrange algorithm
    console.log("Auto-arranging connections...");

    // You could implement algorithms like:
    // - Force-directed layout
    // - Hierarchical layout
    // - Circular layout
  };

  // Minimap for connections overview
  const ConnectionMinimap: React.FC<{ width: number; height: number }> = ({
    width: mmWidth,
    height: mmHeight,
  }) => {
    const scale = Math.min(mmWidth / width, mmHeight / height) * 0.8;

    return (
      <div className="absolute top-16 right-4 bg-white border border-gray-200 rounded shadow-sm p-2 z-10">
        <div className="text-xs text-gray-600 mb-1">Overview</div>
        <svg
          width={mmWidth}
          height={mmHeight}
          className="border border-gray-100"
        >
          {/* Minimap components */}
          {components.map((component) => {
            const pos = componentPositions[component.id];
            if (!pos) return null;

            return (
              <rect
                key={`mm-${component.id}`}
                x={pos.x * scale}
                y={pos.y * scale}
                width={(pos.width || 200) * scale}
                height={(pos.height || 150) * scale}
                fill="#e5e7eb"
                stroke="#9ca3af"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Minimap connections */}
          {connections.map((connection) => {
            const fromCenter = getComponentCenter(connection.fromId);
            const toCenter = getComponentCenter(connection.toId);

            if (!fromCenter || !toCenter) return null;

            return (
              <line
                key={`mm-conn-${connection.id}`}
                x1={fromCenter.x * scale}
                y1={fromCenter.y * scale}
                x2={toCenter.x * scale}
                y2={toCenter.y * scale}
                stroke={connection.color}
                strokeWidth="1"
                opacity="0.8"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <Card
      ref={containerRef}
      className="border-gray-200 flex flex-col"
      style={{ width, height }}
    >
      {/* SVG Connection Canvas */}
      <div className="relative flex-grow overflow-hidden">
        {/* Templates Panel */}
        {showTemplates && (
          <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20 w-60">
            <h4 className="text-sm font-semibold mb-2">Flow Templates</h4>
            <div className="space-y-2">
              {flowTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => applyTemplate(template.id)}
                >
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-gray-600">
                    {template.description}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowTemplates(false)}
              className="mt-2 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded w-full"
            >
              Close
            </button>
          </div>
        )}

        {/* Statistics Panel */}
        {showStats && (
          <div className="absolute bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20 w-56">
            <h4 className="text-sm font-semibold mb-2">
              Connection Statistics
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Total Connections:</span>
                <span className="font-medium">{stats.total}</span>
              </div>
              <div className="border-t pt-2">
                <div className="text-gray-600 mb-1">By Type:</div>
                <div className="pl-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Straight:</span>
                    <span>{stats.types.straight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Curved:</span>
                    <span>{stats.types.curved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dotted:</span>
                    <span>{stats.types.dotted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dashed:</span>
                    <span>{stats.types.dashed}</span>
                  </div>
                </div>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span>With Labels:</span>
                  <span className="font-medium">{stats.withLabels}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowStats(false)}
              className="mt-2 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded w-full"
            >
              Close
            </button>
          </div>
        )}

        {/* Connection Minimap */}
        {showMinimap && <ConnectionMinimap width={150} height={100} />}

        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="absolute top-0 left-0 pointer-events-none"
          onMouseMove={handleMouseMove}
          style={{ zIndex: 1000 }}
        >
          <defs>
            {colors.map((color) => {
              const colorHex = color.replace("#", "");
              return (
                <marker
                  key={colorHex}
                  id={`arrow-${colorHex}`}
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
                </marker>
              );
            })}

            {/* Animated flow indicator */}
            <circle id="flowIndicator" r="3" fill="#3b82f6" opacity="0.8">
              <animate
                attributeName="opacity"
                values="0.8;0.3;0.8"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </defs>

          {/* Existing connections */}
          {connections.map((connection) => {
            const path = getConnectionPath(connection);
            const labelPos = getLabelPosition(connection);
            const isSelected = selectedConnection === connection.id;

            return (
              <g key={connection.id}>
                {/* Connection path */}
                <path
                  d={path}
                  stroke={connection.color}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeDasharray={
                    connection.type === "dotted"
                      ? "2,3"
                      : connection.type === "dashed"
                      ? "5,5"
                      : "none"
                  }
                  fill="none"
                  className="cursor-pointer"
                  markerEnd={`url(#${getArrowMarkerId(connection)})`}
                  onClick={() => handleConnectionClick(connection.id)}
                  style={{ pointerEvents: "stroke", strokeLinecap: "round" }}
                />

                {/* Animated flow indicator */}
                {isSelected && (
                  <circle r="4" fill={connection.color} opacity="0.7">
                    <animateMotion dur="3s" repeatCount="indefinite">
                      <mpath href={`#path-${connection.id}`} />
                    </animateMotion>
                    <animate
                      attributeName="opacity"
                      values="0.7;0.3;0.7"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Hidden path for animation */}
                <path
                  id={`path-${connection.id}`}
                  d={path}
                  stroke="none"
                  fill="none"
                  style={{ display: "none" }}
                />

                {/* Connection label */}
                {connection.label && !editingLabel && (
                  <g
                    transform={`translate(${labelPos.x}, ${labelPos.y})`}
                    onClick={() => startEditingLabel(connection.id)}
                    className="cursor-pointer"
                  >
                    <rect
                      x="-35"
                      y="-12"
                      width="70"
                      height="24"
                      rx="4"
                      ry="4"
                      fill="white"
                      stroke={connection.color}
                      strokeWidth="1"
                      opacity="0.9"
                    />
                    <text
                      className="text-xs"
                      textAnchor="middle"
                      alignmentBaseline="central"
                      fill="#374151"
                    >
                      {connection.label}
                    </text>
                  </g>
                )}

                {/* Edit label UI */}
                {editingLabel === connection.id && (
                  <foreignObject
                    x={labelPos.x - 45}
                    y={labelPos.y - 15}
                    width="90"
                    height="30"
                  >
                    <div className="flex">
                      <input
                        ref={labelInputRef}
                        type="text"
                        value={labelText}
                        onChange={(e) => setLabelText(e.target.value)}
                        onBlur={saveLabel}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveLabel();
                          if (e.key === "Escape") {
                            setEditingLabel(null);
                          }
                        }}
                        className="w-full border border-blue-500 px-2 py-1 text-xs rounded focus:outline-none"
                      />
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}

          {/* Creating new connection line */}
          {isCreatingConnection && connectionStartComponent && (
            <path
              d={(() => {
                const fromCenter = getComponentCenter(connectionStartComponent);
                if (!fromCenter) return "";

                if (connectionType === "straight") {
                  return `M ${fromCenter.x} ${fromCenter.y} L ${cursorPosition.x} ${cursorPosition.y}`;
                } else {
                  const mx = (fromCenter.x + cursorPosition.x) / 2;
                  const my = (fromCenter.y + cursorPosition.y) / 2;
                  const dx = cursorPosition.x - fromCenter.x;
                  const dy = cursorPosition.y - fromCenter.y;
                  const angle = Math.atan2(dy, dx) - Math.PI / 2;
                  const curve = Math.min(
                    Math.sqrt(dx * dx + dy * dy) * 0.3,
                    80
                  );

                  const controlX = mx + Math.cos(angle) * curve;
                  const controlY = my + Math.sin(angle) * curve;

                  return `M ${fromCenter.x} ${fromCenter.y} Q ${controlX} ${controlY} ${cursorPosition.x} ${cursorPosition.y}`;
                }
              })()}
              stroke={connectionColor}
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              markerEnd={`url(#arrow-${connectionColor.replace("#", "")})`}
            />
          )}

          {/* Flow nodes - for testing */}
          {/* <FlowNode id="node1" x={100} y={100} type="start" label="Start" />
          <FlowNode id="node2" x={300} y={100} type="process" label="Process" />
          <FlowNode id="node3" x={500} y={100} type="decision" label="Decision" />
          <FlowNode id="node4" x={700} y={100} type="end" label="End" /> */}
        </svg>

        {/* Connection controls overlay */}
        {selectedConnection && (
          <div className="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 max-w-sm">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs text-gray-600 font-medium">Style:</span>
              {connectionStyles.map((style) => (
                <button
                  key={style.type}
                  onClick={() =>
                    updateConnectionStyle(
                      style.type as "straight" | "curved" | "dotted" | "dashed"
                    )
                  }
                  className={`p-1 rounded text-sm ${
                    connectionType === style.type
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-gray-100"
                  }`}
                  title={style.name}
                >
                  {style.label}
                </button>
              ))}
              <button
                onClick={() => {
                  const connection = connections.find(
                    (c) => c.id === selectedConnection
                  );
                  if (connection) startEditingLabel(connection.id);
                }}
                className="p-1 rounded hover:bg-gray-100"
                title="Add/edit label"
              >
                Aa
              </button>
              <button
                onClick={() => deleteConnection(selectedConnection)}
                className="p-1 rounded text-red-600 hover:bg-red-50"
                title="Delete connection"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs text-gray-600 font-medium">Color:</span>
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => updateConnectionStyle(undefined, color)}
                  className={`w-5 h-5 rounded-full ${
                    connectionColor === color
                      ? "ring-2 ring-offset-1 ring-blue-500"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Set color to ${color}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={duplicateSelectedConnection}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
              >
                📄 Duplicate
              </button>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
              >
                📋 Templates
              </button>
              <button
                onClick={() => exportFlowData()}
                className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
              >
                💾 Export
              </button>
            </div>

            {/* Bulk operations */}
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={selectAllConnections}
                  className="text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded"
                >
                  ✓ Select All
                </button>
                <button
                  onClick={deleteAllConnections}
                  className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-red-700"
                >
                  🗑️ Delete All
                </button>
                <button
                  onClick={autoArrangeConnections}
                  className="text-xs bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded"
                >
                  ✨ Auto Layout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {isCreatingConnection && connectionStartComponent && (
          <div className="absolute top-4 left-4 bg-blue-50 border border-blue-200 rounded-lg p-2 shadow-sm z-10">
            <p className="text-xs text-blue-700">
              Click on another component to connect, or anywhere else to cancel
            </p>
          </div>
        )}

        {/* Component connection buttons */}
        {components.map((component) => {
          const position = componentPositions[component.id];
          if (!position) return null;

          return (
            <React.Fragment key={`conn-${component.id}`}>
              {/* Connection start button */}
              {!isCreatingConnection && (
                <button
                  className="absolute z-10 w-6 h-6 bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center justify-center shadow-sm cursor-pointer"
                  style={{
                    top: position.y + position.height / 2 - 12,
                    left: position.x + position.width / 2 - 12,
                    opacity: 0.7,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    startConnection(component.id);
                  }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}

              {/* Connection target area - shown when creating a connection */}
              {isCreatingConnection &&
                connectionStartComponent !== component.id && (
                  <div
                    className="absolute z-10 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer"
                    style={{
                      top: position.y - 10,
                      left: position.x - 10,
                      width: position.width + 20,
                      height: position.height + 20,
                      opacity: 0.5,
                      pointerEvents: "all",
                    }}
                    onClick={() => finishConnection(component.id)}
                  />
                )}
            </React.Fragment>
          );
        })}

        {/* Minimap component */}
        <ConnectionMinimap width={200} height={150} />
      </div>
    </Card>
  );
};

export default FlowCanvas;
