/**
 * Component State Store
 *
 * Handles component CRUD operations, positioning, and basic state management
 * Separated from UI state and interaction state for better maintainability
 */

import { create } from "zustand";
import { Component } from "../types/whiteboard";
import { stateLogger } from "../utils/componentLoggers";

interface ComponentState {
  // State
  components: Component[];
  nextId: number;

  // Actions
  addComponent: (component: Omit<Component, "id">) => number;
  updateComponent: (id: number, updates: Partial<Component>) => void;
  deleteComponent: (id: number) => void;
  moveComponent: (id: number, x: number, y: number) => void;
  resizeComponent: (id: number, width: number, height: number) => void;
  updateComponentText: (id: number, text: string) => void;
  updateComponentImage: (id: number, imageSrc: string) => void;
  duplicateComponent: (id: number) => number | undefined;
  getComponentById: (id: number) => Component | undefined;
  getAllComponents: () => Component[];
}

export const useComponentStore = create<ComponentState>((set, get) => ({
  components: [],
  nextId: 1,

  addComponent: (componentData) => {
    const { nextId } = get();
    const newComponent: Component = {
      ...componentData,
      id: nextId,
    };

    set((state) => ({
      components: [...state.components, newComponent],
      nextId: nextId + 1,
    }));

    stateLogger.info(`Added component ${nextId}`, {
      id: nextId,
      type: componentData.type,
    });
    return nextId;
  },

  updateComponent: (id, updates) => {
    set((state) => ({
      components: state.components.map((comp) =>
        comp.id === id ? { ...comp, ...updates } : comp
      ),
    }));

    stateLogger.info(`Updated component ${id}`, updates);
  },

  deleteComponent: (id) => {
    set((state) => ({
      components: state.components.filter((comp) => comp.id !== id),
    }));

    stateLogger.info(`Deleted component ${id}`);
  },

  moveComponent: (id, x, y) => {
    get().updateComponent(id, { x, y });
  },

  resizeComponent: (id, width, height) => {
    get().updateComponent(id, { width, height });
  },

  updateComponentText: (id, text) => {
    get().updateComponent(id, { text });
  },

  updateComponentImage: (id, imageSrc) => {
    get().updateComponent(id, { imageSrc });
  },

  duplicateComponent: (id) => {
    const component = get().getComponentById(id);
    if (!component) return undefined;

    const { id: _, ...componentData } = component;
    return get().addComponent({
      ...componentData,
      x: componentData.x + 20,
      y: componentData.y + 20,
    });
  },

  getComponentById: (id) => {
    return get().components.find((comp) => comp.id === id);
  },

  getAllComponents: () => {
    return get().components;
  },
}));
