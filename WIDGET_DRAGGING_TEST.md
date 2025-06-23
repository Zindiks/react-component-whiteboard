# Widget Dragging & Floating Headers Test Guide

## Overview

The whiteboard now supports **FigJam-style component interaction** where:

1. **Widget components are draggable from their entire surface** (not just headers)
2. **Headers appear as floating overlays** only when components are selected
3. **Shape components** remain unchanged (draggable from entire surface, no headers)

## What Changed

### Before

- ❌ Components only draggable from header bar
- ❌ Headers always visible, taking up space
- ❌ Header had cursor-move, rest of component didn't

### After

- ✅ **Entire widget surface is draggable** with `cursor-move`
- ✅ **Floating headers** appear above selected components
- ✅ **Clean component appearance** when not selected
- ✅ **FigJam-like interaction model**

## Test Cases

### 1. Widget Component Dragging

1. **Add YouTube component** to whiteboard
2. **Click anywhere on the component** (not just header) → Should select it
3. **Drag from video area** → Should start dragging
4. **Drag from header area** → Should also work
5. **Verify**: Entire component surface is draggable

### 2. Floating Header Behavior

1. **Select YouTube component**
2. **Verify**: Floating header appears **above** the component
3. **Click elsewhere** to deselect
4. **Verify**: Floating header disappears
5. **Select multiple components** → Each should show its own floating header

### 3. Header Actions

1. **Select YouTube component** to show floating header
2. **Click delete button** in floating header → Should delete component
3. **Test other header actions** (edit, external link, etc.)

### 4. Shape Components (Unchanged)

1. **Add rectangle/ellipse** to whiteboard
2. **Verify**: No floating header (shapes don't have headers)
3. **Verify**: Still draggable from entire surface
4. **Verify**: Selection ring still works

## Implementation Details

### YouTube Component Changes

- Added `cursor-move` to entire Card component
- Moved `onMouseDown` handler from header to Card
- Removed `onMouseDown` from ComponentHeader
- Entire widget surface now responds to drag

### Floating Header

- New `FloatingHeader` component renders above selected widgets
- Positioned at `(x, y - 50px)` relative to component
- Contains same actions as original header (delete, edit, etc.)
- Only shows for widget components, not shapes

### DraggableComponent Logic

- `handleComponentMouseDown`: Handles dragging for entire widget surface
- `isShapeComponent`: Determines if component needs floating header
- Conditional rendering of FloatingHeader for selected widgets

## Current Status

### ✅ Implemented

- [x] YouTube component draggable from entire surface
- [x] Floating header for selected YouTube components
- [x] ComponentHeader cursor styling updated
- [x] Basic floating header component created
- [x] Selection logic updated

### 🚧 Next Steps

- [ ] Update all other widget components (Timer, Weather, etc.)
- [ ] Add more component metadata for floating headers
- [ ] Improve floating header positioning for edge cases
- [ ] Add floating header animations/transitions
- [ ] Test with multiple selected components

## How to Test

1. **Start dev server**: `npm run dev`
2. **Add YouTube component** from sidebar or paste YouTube URL
3. **Try dragging** from different areas of the component
4. **Select/deselect** to see floating header behavior
5. **Compare with shape components** (no floating headers)

## Expected Behavior

- **Widget components**: Draggable from anywhere, floating headers when selected
- **Shape components**: Draggable from anywhere, no headers, selection rings only
- **Modern UX**: Similar to FigJam, Figma, or other design tools
- **Clean interface**: No permanent headers cluttering the UI

This brings the whiteboard interaction model up to modern design tool standards!
