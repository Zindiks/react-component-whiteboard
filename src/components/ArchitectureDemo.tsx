/**
 * Demo: Modern Whiteboard Architecture Usage
 *
 * This file demonstrates how to use the new Zustand-based architecture
 */

import React, { useEffect } from "react";
import {
  useWhiteboardComponents,
  useWhiteboardSelection,
  useWhiteboardZoom,
  useWhiteboardUI,
} from "../stores/unifiedWhiteboardStore";
import {
  useWidgetTypes,
  registerWidget,
  WidgetDefinition,
  WidgetProps,
} from "../stores/widgetRegistryStore";
import { initializeWhiteboardArchitecture } from "../utils/initializeArchitecture";
import type { Component } from "../types/whiteboard";

// Example widget component
const ExampleWidget: React.FC<WidgetProps> = ({
  component,
  selected,
  onSelect,
}) => (
  <div
    onClick={() => onSelect(component.id)}
    className={`p-4 rounded border ${
      selected ? "border-blue-500" : "border-gray-300"
    }`}
  >
    <h3>Example Widget</h3>
    <p>ID: {component.id}</p>
    <p>
      Position: ({component.x}, {component.y})
    </p>
  </div>
);

export const ArchitectureDemo: React.FC = () => {
  // Initialize architecture on mount
  useEffect(() => {
    initializeWhiteboardArchitecture();

    // Register a demo widget
    const demoWidget: WidgetDefinition = {
      type: "demo",
      component: ExampleWidget,
      category: "widget",
      displayName: "Demo Widget",
      description: "A demonstration widget",
      isResizable: true,
      isEditable: false,
      hasHeader: true,
    };

    registerWidget(demoWidget);
  }, []);

  // Use specific hooks for different concerns
  const {
    components: allComponents,
    addComponent,
    deleteComponent,
  } = useWhiteboardComponents();

  const {
    selectedComponents,
    selectComponent,
    clearSelection,
    copySelected,
    pasteComponents,
  } = useWhiteboardSelection();

  const { scale, resetZoom, zoomToFit } = useWhiteboardZoom();

  const { sidebarOpen, toggleSidebar, currentTool, setCurrentTool } =
    useWhiteboardUI();

  // Widget registry access
  const { widgets, getByCategory } = useWidgetTypes();

  const widgetTypes = getByCategory("widget");
  const shapeTypes = getByCategory("shape");

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">
        Modern Whiteboard Architecture Demo
      </h2>

      {/* Component Management */}
      <div className="border p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Component Management</h3>
        <div className="space-x-2">
          <button
            onClick={() =>
              addComponent({
                type: "demo",
                x: Math.random() * 500,
                y: Math.random() * 300,
                zIndex: 1,
              })
            }
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Add Demo Component
          </button>
          <button
            onClick={() =>
              allComponents.length > 0 && deleteComponent(allComponents[0].id)
            }
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            Delete First Component
          </button>
        </div>
        <p className="mt-2">Components: {allComponents.length}</p>
      </div>

      {/* Selection Management */}
      <div className="border p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Selection Management</h3>
        <div className="space-x-2">
          <button
            onClick={() =>
              allComponents.length > 0 && selectComponent(allComponents[0].id)
            }
            className="px-3 py-1 bg-green-500 text-white rounded"
          >
            Select First Component
          </button>
          <button
            onClick={clearSelection}
            className="px-3 py-1 bg-gray-500 text-white rounded"
          >
            Clear Selection
          </button>
          <button
            onClick={copySelected}
            className="px-3 py-1 bg-purple-500 text-white rounded"
          >
            Copy Selected
          </button>
          <button
            onClick={() => pasteComponents()}
            className="px-3 py-1 bg-orange-500 text-white rounded"
          >
            Paste
          </button>
        </div>
        <p className="mt-2">Selected: {selectedComponents.length}</p>
      </div>

      {/* Zoom Controls */}
      <div className="border p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Zoom Controls</h3>
        <div className="space-x-2">
          <button
            onClick={resetZoom}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Reset Zoom
          </button>
          <button
            onClick={zoomToFit}
            className="px-3 py-1 bg-indigo-500 text-white rounded"
          >
            Zoom to Fit
          </button>
        </div>
        <p className="mt-2">Scale: {scale.toFixed(2)}x</p>
      </div>

      {/* UI State */}
      <div className="border p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">UI State</h3>
        <div className="space-x-2">
          <button
            onClick={toggleSidebar}
            className="px-3 py-1 bg-cyan-500 text-white rounded"
          >
            Toggle Sidebar
          </button>
          <button
            onClick={() => setCurrentTool("pan")}
            className="px-3 py-1 bg-yellow-500 text-white rounded"
          >
            Pan Tool
          </button>
          <button
            onClick={() => setCurrentTool("select")}
            className="px-3 py-1 bg-teal-500 text-white rounded"
          >
            Select Tool
          </button>
        </div>
        <p className="mt-2">Sidebar: {sidebarOpen ? "Open" : "Closed"}</p>
        <p>Tool: {currentTool}</p>
      </div>

      {/* Widget Registry */}
      <div className="border p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Widget Registry</h3>
        <p>Total widgets: {widgets.length}</p>
        <p>Widget types: {widgetTypes.length}</p>
        <p>Shape types: {shapeTypes.length}</p>

        <div className="mt-2">
          <h4 className="font-medium">Available Widgets:</h4>
          <ul className="list-disc list-inside">
            {widgetTypes.map((widget) => (
              <li key={widget.type}>
                {widget.displayName} ({widget.type})
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Components Display */}
      <div className="border p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Current Components</h3>
        <div className="grid grid-cols-2 gap-2">
          {allComponents.map((component: Component) => (
            <div
              key={component.id}
              className={`p-2 border rounded cursor-pointer ${
                selectedComponents.includes(component.id)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300"
              }`}
              onClick={() => selectComponent(component.id)}
            >
              <p className="font-medium">ID: {component.id}</p>
              <p>Type: {component.type}</p>
              <p>
                Position: ({component.x}, {component.y})
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
