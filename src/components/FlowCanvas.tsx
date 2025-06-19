import React, { useState, useEffect, useRef } from 'react';
import { Share2, Plus, Trash2 } from 'lucide-react';
import { useWhiteboardStore, Connection } from '@/store/whiteboard';

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
  const components = useWhiteboardStore(state => state.components);
  const connections = useWhiteboardStore(state => state.connections);
  const isCreatingConnection = useWhiteboardStore(state => state.isCreatingConnection);
  const connectionStartComponent = useWhiteboardStore(state => state.connectionStartComponent);
  const selectedConnection = useWhiteboardStore(state => state.selectedConnection);
  const connectionType = useWhiteboardStore(state => state.connectionType);
  const connectionColor = useWhiteboardStore(state => state.connectionColor);
  
  const startConnectionCreation = useWhiteboardStore(state => state.startConnectionCreation);
  const finishConnectionCreation = useWhiteboardStore(state => state.finishConnectionCreation);
  const cancelConnectionCreation = useWhiteboardStore(state => state.cancelConnectionCreation);
  const addConnection = useWhiteboardStore(state => state.addConnection);
  const updateConnection = useWhiteboardStore(state => state.updateConnection);
  const removeConnection = useWhiteboardStore(state => state.removeConnection);
  const selectConnection = useWhiteboardStore(state => state.selectConnection);
  const setConnectionType = useWhiteboardStore(state => state.setConnectionType);
  const setConnectionColor = useWhiteboardStore(state => state.setConnectionColor);
  
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [componentPositions, setComponentPositions] = useState<ComponentPositions>({});
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [labelText, setLabelText] = useState<string>('');

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);

  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#6b7280', // gray
  ];

  // Initialize component positions from components in the store
  useEffect(() => {
    const positions: ComponentPositions = {};
    
    components.forEach(component => {
      positions[component.id] = {
        x: component.x,
        y: component.y,
        width: component.width || 200,  // Default width if not specified
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
          y: e.clientY - rect.top
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
      const connection = connections.find(conn => conn.id === connectionId);
      if (connection) {
        setConnectionType(connection.type);
        setConnectionColor(connection.color);
      }
    }
  };

  const startEditingLabel = (connectionId: string) => {
    const connection = connections.find(conn => conn.id === connectionId);
    setEditingLabel(connectionId);
    setLabelText(connection?.label || '');
  };

  const saveLabel = () => {
    if (editingLabel) {
      updateConnection(editingLabel, { label: labelText });
      setEditingLabel(null);
    }
  };

  const updateConnectionStyle = (newType?: 'straight' | 'curved', newColor?: string) => {
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
  const getComponentCenter = (componentId: string): { x: number; y: number } | null => {
    const position = componentPositions[componentId];
    if (!position) return null;
    
    return {
      x: position.x + position.width / 2,
      y: position.y + position.height / 2
    };
  };

  // Calculate path for connection
  const getConnectionPath = (connection: Connection): string => {
    const fromCenter = getComponentCenter(connection.fromId);
    const toCenter = getComponentCenter(connection.toId);
    
    if (!fromCenter || !toCenter) return '';
    
    if (connection.type === 'straight') {
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
    
    if (connection.type === 'straight') {
      return {
        x: (fromCenter.x + toCenter.x) / 2,
        y: (fromCenter.y + toCenter.y) / 2
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
        y: my + Math.sin(angle) * curve * 0.8
      };
    }
  };

  // Get arrow marker ID for a specific connection
  const getArrowMarkerId = (connection: Connection) => {
    const colorHex = connection.color.replace('#', '');
    return `arrow-${colorHex}`;
  };

  return (
    <div 
      ref={containerRef}
      className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col"
      style={{ width, height }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Share2 className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Flow Connections</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            className={`p-1 rounded-full hover:bg-gray-200 text-gray-500 ${isCreatingConnection ? 'text-blue-600 bg-blue-100' : ''}`}
            onClick={() => {
              if (isCreatingConnection) {
                cancelConnection();
              }
            }}
            title={isCreatingConnection ? "Cancel connection" : "Connection mode"}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* SVG Connection Canvas */}
      <div className="relative flex-grow overflow-hidden">
        <svg 
          ref={svgRef} 
          width="100%" 
          height="100%" 
          className="absolute top-0 left-0 pointer-events-none"
          onMouseMove={handleMouseMove}
          style={{ zIndex: 1000 }}
        >
          <defs>
            {colors.map(color => {
              const colorHex = color.replace('#', '');
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
          </defs>

          {/* Existing connections */}
          {connections.map(connection => {
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
                  fill="none"
                  className="cursor-pointer"
                  markerEnd={`url(#${getArrowMarkerId(connection)})`}
                  onClick={() => handleConnectionClick(connection.id)}
                  style={{ pointerEvents: 'stroke', strokeLinecap: 'round' }}
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
                        onChange={e => setLabelText(e.target.value)}
                        onBlur={saveLabel}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveLabel();
                          if (e.key === 'Escape') {
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
              d={
                (() => {
                  const fromCenter = getComponentCenter(connectionStartComponent);
                  if (!fromCenter) return '';
                  
                  if (connectionType === 'straight') {
                    return `M ${fromCenter.x} ${fromCenter.y} L ${cursorPosition.x} ${cursorPosition.y}`;
                  } else {
                    const mx = (fromCenter.x + cursorPosition.x) / 2;
                    const my = (fromCenter.y + cursorPosition.y) / 2;
                    const dx = cursorPosition.x - fromCenter.x;
                    const dy = cursorPosition.y - fromCenter.y;
                    const angle = Math.atan2(dy, dx) - Math.PI / 2;
                    const curve = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.3, 80);
                    
                    const controlX = mx + Math.cos(angle) * curve;
                    const controlY = my + Math.sin(angle) * curve;
                    
                    return `M ${fromCenter.x} ${fromCenter.y} Q ${controlX} ${controlY} ${cursorPosition.x} ${cursorPosition.y}`;
                  }
                })()
              }
              stroke={connectionColor}
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              markerEnd={`url(#arrow-${connectionColor.replace('#', '')})`}
            />
          )}
        </svg>

        {/* Connection controls overlay */}
        {selectedConnection && (
          <div className="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs text-gray-600 font-medium">Style:</span>
              <button
                onClick={() => updateConnectionStyle('straight')}
                className={`p-1 rounded ${connectionType === 'straight' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                title="Straight line"
              >
                ───
              </button>
              <button
                onClick={() => updateConnectionStyle('curved')}
                className={`p-1 rounded ${connectionType === 'curved' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                title="Curved line"
              >
                ⌒
              </button>
              <button
                onClick={() => {
                  const connection = connections.find(c => c.id === selectedConnection);
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
            
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600 font-medium">Color:</span>
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => updateConnectionStyle(undefined, color)}
                  className={`w-5 h-5 rounded-full ${connectionColor === color ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                  style={{ backgroundColor: color }}
                  title={`Set color to ${color}`}
                />
              ))}
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
        {components.map(component => {
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
                    opacity: 0.7
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
              {isCreatingConnection && connectionStartComponent !== component.id && (
                <div
                  className="absolute z-10 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer"
                  style={{
                    top: position.y - 10,
                    left: position.x - 10,
                    width: position.width + 20,
                    height: position.height + 20,
                    opacity: 0.5,
                    pointerEvents: 'all'
                  }}
                  onClick={() => finishConnection(component.id)}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default FlowCanvas;
