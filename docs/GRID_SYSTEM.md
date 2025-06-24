# Grid System Documentation

## Overview

The whiteboard features a high-performance grid system that provides visual alignment and snap-to-grid functionality.

## Current Implementation

### Grid Component

- **File**: `src/components/GridBackground.tsx`
- **Type**: SVG Pattern-based
- **Performance**: Optimized for 120fps

### Features

- ✅ **Visual Grid**: Clean line-based grid overlay
- ✅ **Snap-to-Grid**: Components snap to grid intersections
- ✅ **Dynamic Opacity**: Grid visibility adapts to zoom level
- ✅ **Performance Optimized**: Uses efficient SVG patterns
- ✅ **GPU Accelerated**: Hardware-accelerated rendering

## Configuration

### Grid Constants

```typescript
// src/constants/appConstants.ts
export const GRID_CONSTANTS = {
  SIZE: 20, // Grid cell size in pixels
  COLOR: "#e0e0e0", // Light gray grid lines
  STROKE_WIDTH: 0.5, // Line thickness
  OPACITY: 0.6, // Base opacity
  ENABLED: true, // Default enabled state
} as const;
```

### Usage

```tsx
<GridBackground transform={transform} enabled={showGrid} />
```

## Controls

### Grid Toggle

- **Button**: Grid icon (📐) in control panel
- **Function**: Show/hide grid overlay
- **Keyboard**: No shortcut (uses button only)

### Snap-to-Grid Toggle

- **Button**: Magnet icon (🧲) in control panel
- **Function**: Enable/disable component snapping
- **Alignment**: Perfect alignment with visual grid

## Technical Details

### Performance Optimizations

- **SVG Patterns**: Single pattern element vs hundreds of lines
- **GPU Acceleration**: `transform: translateZ(0)` and `willChange: transform`
- **Throttled Updates**: RAF-based updates for smooth panning
- **Minimal DOM**: One SVG element with pattern definition

### Zoom Adaptation

- **Opacity Scaling**: Grid becomes transparent when zoomed out
- **Pattern Transform**: Grid moves and scales with viewport
- **Consistent Size**: 20px grid cells at all zoom levels

### Snap-to-Grid Logic

```typescript
// Perfect alignment between visual grid and snapping
x: snapToGrid ? Math.round(newX / gridSize) * gridSize : newX,
y: snapToGrid ? Math.round(newY / gridSize) * gridSize : newY,
```

## File Structure

### Active Files

```
src/
├── components/
│   └── GridBackground.tsx     # Main grid component
├── constants/
│   └── appConstants.ts        # Grid configuration
└── store/
    └── whiteboard.ts          # Snap-to-grid logic
```

### Documentation

```
docs/
├── GRID_PERFORMANCE_FIX.md           # Performance fix history
├── BUILD_ERRORS_FIXED.md             # Build issues resolved
├── PERFORMANCE_OPTIMIZATIONS.md      # General performance docs
└── GRID_BACKGROUND_FEATURE_HISTORY.md # Historical feature info
```

## Removed Features

### Alternative Implementations (Removed for Simplicity)

- ❌ **CSSGridBackground**: CSS-based patterns
- ❌ **CanvasGridBackground**: Canvas-based rendering
- ❌ **GridBackgroundOptimized**: Enhanced SVG version

### Dotted Grid Style (Removed for Performance)

- ❌ **Reason**: Created too many DOM elements (400+ circles)
- ❌ **Impact**: Caused severe performance degradation
- ❌ **Solution**: Focused on optimized line grid only

## Best Practices

### Grid Usage

1. Keep grid enabled for better component alignment
2. Use snap-to-grid for precise positioning
3. Grid size (20px) works well for most components
4. Grid opacity automatically adapts to zoom level

### Performance

1. Grid uses efficient SVG patterns (not individual lines)
2. GPU acceleration ensures smooth panning/zooming
3. Throttled updates maintain 120fps target
4. Minimal memory footprint

## Future Considerations

### Potential Enhancements

- Different grid sizes (10px, 40px options)
- Grid color theming
- Grid spacing based on zoom level
- Magnetic snap strength adjustment

### Constraints

- Must maintain 120fps performance
- Should align perfectly with snap-to-grid
- Keep implementation simple and reliable
- Avoid creating many DOM elements
