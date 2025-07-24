/**
 * Component Store Tests
 * 
 * Tests for the new componentStore to ensure it works correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useComponentStore } from '../componentStore';

describe('useComponentStore', () => {
  beforeEach(() => {
    // Reset store state before each test by clearing components and resetting nextId
    const { result } = renderHook(() => useComponentStore());
    act(() => {
      // Clear all components
      result.current.getAllComponents().forEach(comp => {
        result.current.deleteComponent(comp.id);
      });
      // Reset nextId by setting it directly (accessing internal state)
      const store = useComponentStore.getState();
      useComponentStore.setState({ ...store, nextId: 1 });
    });
  });

  it('should start with empty components array', () => {
    const { result } = renderHook(() => useComponentStore());
    expect(result.current.components).toEqual([]);
    expect(result.current.nextId).toBe(1);
  });

  it('should add a component and return its id', () => {
    const { result } = renderHook(() => useComponentStore());
    
    let componentId: number;
    act(() => {
      componentId = result.current.addComponent({
        type: 'rectangle',
        x: 100,
        y: 200,
        zIndex: 1,
      });
    });

    expect(componentId!).toBe(1);
    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0]).toEqual({
      id: 1,
      type: 'rectangle',
      x: 100,
      y: 200,
      zIndex: 1,
    });
    expect(result.current.nextId).toBe(2);
  });

  it('should update a component', () => {
    const { result } = renderHook(() => useComponentStore());
    
    let componentId: number;
    act(() => {
      componentId = result.current.addComponent({
        type: 'rectangle',
        x: 100,
        y: 200,
        zIndex: 1,
      });
    });

    act(() => {
      result.current.updateComponent(componentId!, { x: 150, text: 'Hello' });
    });

    const component = result.current.getComponentById(componentId!);
    expect(component).toEqual({
      id: componentId!,
      type: 'rectangle',
      x: 150,
      y: 200,
      zIndex: 1,
      text: 'Hello',
    });
  });

  it('should move a component', () => {
    const { result } = renderHook(() => useComponentStore());
    
    let componentId: number;
    act(() => {
      componentId = result.current.addComponent({
        type: 'rectangle',
        x: 100,
        y: 200,
        zIndex: 1,
      });
    });

    act(() => {
      result.current.moveComponent(componentId!, 300, 400);
    });

    const component = result.current.getComponentById(componentId!);
    expect(component?.x).toBe(300);
    expect(component?.y).toBe(400);
  });

  it('should delete a component', () => {
    const { result } = renderHook(() => useComponentStore());
    
    let componentId: number;
    act(() => {
      componentId = result.current.addComponent({
        type: 'rectangle',
        x: 100,
        y: 200,
        zIndex: 1,
      });
    });

    expect(result.current.components).toHaveLength(1);

    act(() => {
      result.current.deleteComponent(componentId!);
    });

    expect(result.current.components).toHaveLength(0);
    expect(result.current.getComponentById(componentId!)).toBeUndefined();
  });

  it('should duplicate a component', () => {
    const { result } = renderHook(() => useComponentStore());
    
    let componentId: number;
    act(() => {
      componentId = result.current.addComponent({
        type: 'rectangle',
        x: 100,
        y: 200,
        zIndex: 1,
        text: 'Original',
      });
    });

    let duplicateId: number | undefined;
    act(() => {
      duplicateId = result.current.duplicateComponent(componentId!);
    });

    expect(duplicateId).toBeDefined();
    expect(result.current.components).toHaveLength(2);
    
    const duplicate = result.current.getComponentById(duplicateId!);
    expect(duplicate).toEqual({
      id: duplicateId!,
      type: 'rectangle',
      x: 120, // Original x + 20
      y: 220, // Original y + 20
      zIndex: 1,
      text: 'Original',
    });
  });

  it('should handle text and image updates', () => {
    const { result } = renderHook(() => useComponentStore());
    
    let componentId: number;
    act(() => {
      componentId = result.current.addComponent({
        type: 'text',
        x: 100,
        y: 200,
        zIndex: 1,
      });
    });

    act(() => {
      result.current.updateComponentText(componentId!, 'Hello World');
      result.current.updateComponentImage(componentId!, 'image-url.jpg');
    });

    const component = result.current.getComponentById(componentId!);
    expect(component?.text).toBe('Hello World');
    expect(component?.imageSrc).toBe('image-url.jpg');
  });
});
