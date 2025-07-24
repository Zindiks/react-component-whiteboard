/**
 * Modern Widget Factory with Zustand
 *
 * Registry-based component creation system that eliminates large mapping objects
 * Uses Zustand for state management instead of React Context
 */

import React from "react";
import { create } from "zustand";
import { Component } from "../types/whiteboard";

export interface WidgetProps {
  component: Component;
  selected: boolean;
  onSelect: (id: number) => void;
  onResize?: (id: number, width: number, height: number) => void;
  onTextChange?: (id: number, text: string) => void;
  onImageChange?: (id: number, image: string) => void;
  onFormattingChange?: (
    id: number,
    formatting: Record<string, unknown>
  ) => void;
  isEditing?: boolean;
  onEditingChange?: (id: number, editing: boolean) => void;
  [key: string]: unknown; // For widget-specific props
}

export interface WidgetDefinition {
  type: string;
  component: React.ComponentType<WidgetProps>;
  category: "widget" | "shape";
  defaultProps?: Partial<Component>;
  isResizable?: boolean;
  isEditable?: boolean;
  hasHeader?: boolean;
  displayName: string;
  description?: string;
  icon?: string;
}

interface WidgetRegistryState {
  widgets: Map<string, WidgetDefinition>;

  // Registry actions
  register: (definition: WidgetDefinition) => void;
  unregister: (type: string) => void;
  bulkRegister: (definitions: WidgetDefinition[]) => void;
  clear: () => void;

  // Query actions
  get: (type: string) => WidgetDefinition | undefined;
  getAll: () => WidgetDefinition[];
  getByCategory: (category: "widget" | "shape") => WidgetDefinition[];
  exists: (type: string) => boolean;
  getTypes: () => string[];

  // Component creation
  create: (type: string, props: WidgetProps) => React.ReactElement | null;
  createWithErrorBoundary: (
    type: string,
    props: WidgetProps
  ) => React.ReactElement;
}

export const useWidgetRegistry = create<WidgetRegistryState>((set, get) => ({
  widgets: new Map(),

  // Registry actions
  register: (definition) => {
    set((state) => {
      const newWidgets = new Map(state.widgets);
      newWidgets.set(definition.type, definition);
      return { widgets: newWidgets };
    });
    console.log(
      `✅ Registered widget: ${definition.type} (${definition.displayName})`
    );
  },

  unregister: (type) => {
    set((state) => {
      const newWidgets = new Map(state.widgets);
      const existed = newWidgets.delete(type);
      if (existed) {
        console.log(`🗑️ Unregistered widget: ${type}`);
      }
      return { widgets: newWidgets };
    });
  },

  bulkRegister: (definitions) => {
    set((state) => {
      const newWidgets = new Map(state.widgets);
      definitions.forEach((def) => {
        newWidgets.set(def.type, def);
      });
      return { widgets: newWidgets };
    });
    console.log(`✅ Bulk registered ${definitions.length} widgets`);
  },

  clear: () => {
    set({ widgets: new Map() });
    console.log("🧹 Cleared all widgets from registry");
  },

  // Query actions
  get: (type) => {
    return get().widgets.get(type);
  },

  getAll: () => {
    return Array.from(get().widgets.values());
  },

  getByCategory: (category) => {
    return Array.from(get().widgets.values()).filter(
      (widget) => widget.category === category
    );
  },

  exists: (type) => {
    return get().widgets.has(type);
  },

  getTypes: () => {
    return Array.from(get().widgets.keys());
  },

  // Component creation
  create: (type, props) => {
    const definition = get().get(type);
    if (!definition) {
      console.warn(`⚠️ Widget type "${type}" not found in registry`);
      return null;
    }

    try {
      const WidgetComponent = definition.component;
      return React.createElement(WidgetComponent, props);
    } catch (error) {
      console.error(`❌ Error creating widget "${type}":`, error);
      return null;
    }
  },

  createWithErrorBoundary: (type, props) => {
    const widget = get().create(type, props);

    if (!widget) {
      return React.createElement(
        "div",
        {
          className: "w-20 bg-slate-800 rounded-md p-2 border border-red-500",
        },
        React.createElement(
          "p",
          { className: "text-red-400 text-center text-xs" },
          `Unknown: ${type}`
        )
      );
    }

    return React.createElement(
      React.Suspense,
      {
        fallback: React.createElement(
          "div",
          { className: "w-20 bg-slate-700 rounded-md p-2 animate-pulse" },
          React.createElement(
            "p",
            { className: "text-slate-400 text-center text-xs" },
            "Loading..."
          )
        ),
      },
      widget
    );
  },
}));

// Convenience hooks for specific use cases
export const useWidgetTypes = () => {
  return useWidgetRegistry((state) => ({
    types: state.getTypes(),
    widgets: state.getAll(),
    getByCategory: state.getByCategory,
  }));
};

export const useWidgetCreator = () => {
  return useWidgetRegistry((state) => ({
    create: state.create,
    createWithErrorBoundary: state.createWithErrorBoundary,
    exists: state.exists,
    get: state.get,
  }));
};

export const useWidgetRegistration = () => {
  return useWidgetRegistry((state) => ({
    register: state.register,
    unregister: state.unregister,
    bulkRegister: state.bulkRegister,
    clear: state.clear,
  }));
};

// Widget registration helper for easy setup
export const registerWidget = (definition: WidgetDefinition) => {
  useWidgetRegistry.getState().register(definition);
};

export const registerWidgets = (definitions: WidgetDefinition[]) => {
  useWidgetRegistry.getState().bulkRegister(definitions);
};

// Development helper to see all registered widgets
export const logRegisteredWidgets = () => {
  const widgets = useWidgetRegistry.getState().getAll();
  console.group("📦 Registered Widgets");
  widgets.forEach((widget) => {
    console.log(`${widget.type}: ${widget.displayName} (${widget.category})`);
  });
  console.groupEnd();
};
