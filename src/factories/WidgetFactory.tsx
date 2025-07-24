/**
 * Widget Factory - Registry-based component creation
 *
 * This factory eliminates the large mapping object in ComponentRenderer
 * and provides a cleaner, more maintainable way to register and create widgets
 */

import React from "react";
import { Component } from "../../types/whiteboard";

export interface WidgetProps {
  component: Component;
  selected: boolean;
  onSelect: (id: number) => void;
  onResize?: (id: number, width: number, height: number) => void;
  onTextChange?: (id: number, text: string) => void;
  onImageChange?: (id: number, image: string) => void;
  onFormattingChange?: (id: number, formatting: any) => void;
  isEditing?: boolean;
  onEditingChange?: (id: number, editing: boolean) => void;
  [key: string]: any; // For widget-specific props
}

export interface WidgetDefinition {
  type: string;
  component: React.ComponentType<WidgetProps>;
  category: "widget" | "shape";
  defaultProps?: Partial<Component>;
  isResizable?: boolean;
  isEditable?: boolean;
  hasHeader?: boolean;
}

class WidgetRegistry {
  private widgets = new Map<string, WidgetDefinition>();

  register(definition: WidgetDefinition): void {
    this.widgets.set(definition.type, definition);
  }

  unregister(type: string): void {
    this.widgets.delete(type);
  }

  get(type: string): WidgetDefinition | undefined {
    return this.widgets.get(type);
  }

  getAll(): WidgetDefinition[] {
    return Array.from(this.widgets.values());
  }

  getByCategory(category: "widget" | "shape"): WidgetDefinition[] {
    return this.getAll().filter((widget) => widget.category === category);
  }

  exists(type: string): boolean {
    return this.widgets.has(type);
  }

  create(type: string, props: WidgetProps): React.ReactElement | null {
    const definition = this.get(type);
    if (!definition) {
      console.warn(`Widget type "${type}" not found in registry`);
      return null;
    }

    const WidgetComponent = definition.component;
    return React.createElement(WidgetComponent, props);
  }
}

// Global registry instance
export const widgetRegistry = new WidgetRegistry();

// Helper hook for easy access
export const useWidgetRegistry = () => {
  return {
    register: widgetRegistry.register.bind(widgetRegistry),
    unregister: widgetRegistry.unregister.bind(widgetRegistry),
    get: widgetRegistry.get.bind(widgetRegistry),
    getAll: widgetRegistry.getAll.bind(widgetRegistry),
    getByCategory: widgetRegistry.getByCategory.bind(widgetRegistry),
    exists: widgetRegistry.exists.bind(widgetRegistry),
    create: widgetRegistry.create.bind(widgetRegistry),
  };
};

// Simplified ComponentRenderer using the factory
export interface ComponentRendererProps extends WidgetProps {}

export const ComponentRenderer: React.FC<ComponentRendererProps> = (props) => {
  const { component } = props;

  const widget = widgetRegistry.create(component.type, props);

  if (!widget) {
    return (
      <div className="w-20 bg-slate-800 rounded-md p-2">
        <p className="text-white text-center">Unknown: {component.type}</p>
      </div>
    );
  }

  return widget;
};
