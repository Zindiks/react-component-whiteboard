# Drag Preview Feature

## Overview

The drag preview feature provides visual feedback during drag and drop operations by showing an orange overlay on the grid that indicates exactly where a component will be placed and how many grid cells it will occupy.

## Features

### 🎯 Visual Grid Preview

- **Orange Overlay**: Semi-transparent orange rectangle showing component placement
- **Grid Cell Indicators**: Dashed lines showing individual grid cells when snap-to-grid is enabled
- **Component Info Tooltip**: Shows component type and dimensions
- **Grid Cell Count**: Displays how many grid cells the component will occupy

### 🔧 Smart Component Detection

- **Widget Components**: Timer, Weather, Bitcoin Chart, etc.
- **Shape Components**: Rectangle, Ellipse, Arrow, Line, Text, Image
- **Media Components**: YouTube, SoundCloud, Spotify
- **URL Detection**: Automatically detects and previews appropriate component types

### 📐 Grid Integration

- **Snap-to-Grid**: Preview respects snap-to-grid settings
- **Dynamic Sizing**: Works with all grid sizes (10px, 20px, 40px, 80px)
- **Zoom Support**: Preview scales correctly with zoom level
- **Grid Cell Calculation**: Accurately shows occupied grid cells

## Implementation

### Components

#### DragPreviewOverlay

- **Location**: `src/components/whiteboard/DragPreviewOverlay.tsx`
- **Purpose**: Renders the orange preview overlay and grid indicators
- **Features**:
  - GPU-accelerated rendering
  - Responsive to zoom and transform
  - Grid cell boundary visualization
  - Component info tooltip

### Constants

#### DRAG_PREVIEW_CONSTANTS

- **Location**: `src/constants/appConstants.ts`
- **Configuration**:
  - `OVERLAY_COLOR`: Semi-transparent orange for preview
  - `OVERLAY_BORDER_COLOR`: More opaque orange for borders
  - `PREVIEW_SIZES`: Component-specific dimensions
  - `Z_INDEX`: Proper layering with other overlays

### Hook Integration

#### useDragAndDrop

- **Enhanced**: Added drag preview state management
- **Features**:
  - Real-time mouse position tracking
  - Component type detection
  - Preview visibility control
  - Automatic cleanup on drop

## Usage

### Basic Drag and Drop

1. **Start Drag**: Drag any component from the sidebar
2. **Preview Appears**: Orange overlay shows where component will be placed
3. **Grid Alignment**: Preview snaps to grid if snap-to-grid is enabled
4. **Drop**: Release to place component at preview location

### Component Types

#### Widget Components

```typescript
// Preview dimensions for different widgets
timer: { width: 200, height: 150 }
weather: { width: 300, height: 200 }
bitcoin: { width: 400, height: 300 }
currency: { width: 350, height: 250 }
```

#### Shape Components

```typescript
// Preview dimensions for shapes
rectangle: { width: 120, height: 80 }
ellipse: { width: 120, height: 80 }
arrow: { width: 150, height: 20 }
text: { width: 150, height: 50 }
```

### Grid Integration

#### Snap-to-Grid

- **Enabled**: Preview shows grid cell boundaries with dashed lines
- **Disabled**: Preview shows free placement without grid constraints
- **Dynamic**: Updates in real-time as you drag

#### Grid Cell Calculation

```typescript
// Calculate occupied grid cells
const gridCellsX = Math.ceil(componentWidth / gridSize);
const gridCellsY = Math.ceil(componentHeight / gridSize);
const totalGridCells = gridCellsX * gridCellsY;
```

## Visual Feedback

### Preview Overlay

- **Color**: `rgba(255, 165, 0, 0.6)` - Semi-transparent orange
- **Border**: `rgba(255, 165, 0, 0.8)` - More opaque orange
- **Style**: Dashed border with rounded corners
- **Shadow**: Subtle drop shadow for depth

### Grid Indicators

- **Lines**: Dashed orange lines showing grid cell boundaries
- **Opacity**: 80% opacity for subtle visibility
- **Conditional**: Only shown when snap-to-grid is enabled

### Info Tooltip

- **Position**: Top-right of preview area
- **Content**: Component type and dimensions
- **Grid Info**: Shows grid cell count when snap-to-grid is enabled
- **Style**: Dark background with white text

## Performance

### Optimizations

- **GPU Acceleration**: Uses `transform: translateZ(0)` for hardware acceleration
- **Throttled Updates**: Mouse position updates are optimized
- **Conditional Rendering**: Only renders when preview is visible
- **Efficient Calculations**: Memoized grid cell calculations

### Memory Management

- **Proper Cleanup**: Event listeners are removed on unmount
- **State Reset**: Preview state is cleared on drop or drag leave
- **Minimal Re-renders**: Uses React.memo and useMemo for optimization

## Configuration

### Customization

You can customize the drag preview by modifying the constants:

```typescript
// src/constants/appConstants.ts
export const DRAG_PREVIEW_CONSTANTS = {
  OVERLAY_COLOR: "rgba(255, 165, 0, 0.6)", // Change preview color
  OVERLAY_BORDER_COLOR: "rgba(255, 165, 0, 0.8)", // Change border color
  OVERLAY_BORDER_WIDTH: 2, // Change border width
  OVERLAY_BORDER_STYLE: "dashed", // Change border style
  // ... other options
};
```

### Component Sizes

Add new component types or modify existing sizes:

```typescript
PREVIEW_SIZES: {
  // Add new component type
  myCustomWidget: { width: 250, height: 180 },

  // Modify existing sizes
  timer: { width: 220, height: 160 }, // Updated dimensions
}
```

## Browser Compatibility

### Supported Browsers

- **Chrome**: Full support with hardware acceleration
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

### Drag Event Support

- **Files**: Image file drops from file system
- **URLs**: Web page and image URL drops
- **Components**: Sidebar component drags
- **Text**: Plain text URL detection

## Future Enhancements

### Potential Improvements

1. **Multi-Component Preview**: Show preview for multiple selected components
2. **Collision Detection**: Highlight overlapping with existing components
3. **Snap Guidelines**: Show alignment guides with existing components
4. **Custom Preview Shapes**: Different preview styles for different component types
5. **Animation**: Smooth transitions for preview appearance/disappearance

### Accessibility

1. **Screen Reader Support**: Announce preview information
2. **Keyboard Navigation**: Preview with keyboard controls
3. **High Contrast Mode**: Adjust colors for accessibility
4. **Reduced Motion**: Respect user's motion preferences
