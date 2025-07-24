/**
 * Selection Store Tests
 * 
 * Tests for the new selectionStore to ensure it works correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSelectionStore } from '../selectionStore';

describe('useSelectionStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useSelectionStore());
    act(() => {
      result.current.clearSelection();
      result.current.clearCopied();
    });
  });

  it('should start with empty selections', () => {
    const { result } = renderHook(() => useSelectionStore());
    expect(result.current.selectedComponents).toEqual([]);
    expect(result.current.copiedComponents).toEqual([]);
    expect(result.current.hasSelection()).toBe(false);
    expect(result.current.hasCopied()).toBe(false);
  });

  it('should select a single component', () => {
    const { result } = renderHook(() => useSelectionStore());
    
    act(() => {
      result.current.selectComponent(1);
    });

    expect(result.current.selectedComponents).toEqual([1]);
    expect(result.current.isSelected(1)).toBe(true);
    expect(result.current.isSelected(2)).toBe(false);
    expect(result.current.hasSelection()).toBe(true);
    expect(result.current.getSelectedCount()).toBe(1);
  });

  it('should select multiple components', () => {
    const { result } = renderHook(() => useSelectionStore());
    
    act(() => {
      result.current.selectMultiple([1, 2, 3]);
    });

    expect(result.current.selectedComponents).toEqual([1, 2, 3]);
    expect(result.current.getSelectedCount()).toBe(3);
    expect(result.current.isSelected(1)).toBe(true);
    expect(result.current.isSelected(2)).toBe(true);
    expect(result.current.isSelected(3)).toBe(true);
  });

  it('should add to selection', () => {
    const { result } = renderHook(() => useSelectionStore());
    
    act(() => {
      result.current.selectComponent(1);
      result.current.addToSelection(2);
      result.current.addToSelection(3);
    });

    expect(result.current.selectedComponents).toEqual([1, 2, 3]);
    
    // Adding the same component again should not duplicate
    act(() => {
      result.current.addToSelection(2);
    });
    
    expect(result.current.selectedComponents).toEqual([1, 2, 3]);
  });

  it('should remove from selection', () => {
    const { result } = renderHook(() => useSelectionStore());
    
    act(() => {
      result.current.selectMultiple([1, 2, 3]);
      result.current.removeFromSelection(2);
    });

    expect(result.current.selectedComponents).toEqual([1, 3]);
    expect(result.current.isSelected(2)).toBe(false);
  });

  it('should toggle selection', () => {
    const { result } = renderHook(() => useSelectionStore());
    
    // Toggle on
    act(() => {
      result.current.toggleSelection(1);
    });
    expect(result.current.selectedComponents).toEqual([1]);
    
    // Toggle off
    act(() => {
      result.current.toggleSelection(1);
    });
    expect(result.current.selectedComponents).toEqual([]);
  });

  it('should clear selection', () => {
    const { result } = renderHook(() => useSelectionStore());
    
    act(() => {
      result.current.selectMultiple([1, 2, 3]);
      result.current.clearSelection();
    });

    expect(result.current.selectedComponents).toEqual([]);
    expect(result.current.hasSelection()).toBe(false);
  });

  it('should copy selected components', () => {
    const { result } = renderHook(() => useSelectionStore());
    
    act(() => {
      result.current.selectMultiple([1, 2, 3]);
      result.current.copySelected();
    });

    expect(result.current.copiedComponents).toEqual([1, 2, 3]);
    expect(result.current.hasCopied()).toBe(true);
  });

  it('should select all components', () => {
    const { result } = renderHook(() => useSelectionStore());
    
    const allComponentIds = [1, 2, 3, 4, 5];
    
    act(() => {
      result.current.selectAll(allComponentIds);
    });

    expect(result.current.selectedComponents).toEqual(allComponentIds);
    expect(result.current.getSelectedCount()).toBe(5);
  });

  it('should clear copied components', () => {
    const { result } = renderHook(() => useSelectionStore());
    
    act(() => {
      result.current.selectMultiple([1, 2]);
      result.current.copySelected();
      result.current.clearCopied();
    });

    expect(result.current.copiedComponents).toEqual([]);
    expect(result.current.hasCopied()).toBe(false);
  });
});
