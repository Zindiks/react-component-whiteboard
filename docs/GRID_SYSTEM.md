# Grid System Documentation

## Overview

The whiteboard features a high-performance grid system that provides visual alignment and snap-to-grid functionality.

## Current Implementation

### Grid Component

- **File**: `src/components/GridBackground.tsx`
- **Type**: SVG Pattern-based
- **Performance**: Optimized for 120fps

### Features

- ✅ **Visual Grid**: Clean line-based or dotted grid overlay
- ✅ **Grid Styles**: Switch between line and dotted patterns
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
  DOT_SIZE: 1.5, // Dot radius for dotted grid style
  STYLE: "line", // Default grid style ("line" | "dotted")
} as const;
```

### Usage

```tsx
<GridBackground transform={transform} enabled={showGrid} style={gridStyle} />
```

## Controls

### Grid Toggle

- **Button**: Grid icon (📐) in control panel
- **Function**: Show/hide grid overlay
- **Keyboard**: No shortcut (uses button only)

### Grid Style Toggle

- **Button**: Style icon (⋯/📐) in control panel (visible when grid is enabled)
- **Function**: Switch between line and dotted grid styles
- **Styles**: Line grid (L-shaped patterns) or dotted grid (circles)

### Snap-to-Grid Toggle

- **Button**: Magnet icon (🧲) in control panel
- **Function**: Enable/disable component snapping
- **Alignment**: Perfect alignment with visual grid

## Technical Details

### Performance Optimizations

- **SVG Patterns**: Single pattern element vs hundreds of lines/circles
- **GPU Acceleration**: `transform: translateZ(0)` and `willChange: transform`
- **Throttled Updates**: RAF-based updates for smooth panning
- **Minimal DOM**: One SVG element with pattern definition
- **Efficient Dotted Grid**: SVG circle patterns instead of individual DOM elements

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

### Previous Dotted Grid (Removed for Performance)

- ❌ **Old Implementation**: Created individual DOM elements for each dot
- ❌ **Impact**: Caused severe performance degradation (400+ elements)
- ❌ **Solution**: Replaced with efficient SVG pattern-based dotted grid

## Best Practices

### Grid Usage

1. Keep grid enabled for better component alignment
2. Use snap-to-grid for precise positioning
3. Grid size (20px) works well for most components
4. Grid opacity automatically adapts to zoom level
5. Switch between line and dotted styles based on preference

### Performance

1. Grid uses efficient SVG patterns (not individual lines/dots)
2. GPU acceleration ensures smooth panning/zooming
3. Throttled updates maintain 120fps target
4. Minimal memory footprint
5. Both line and dotted styles are equally performant

## Future Considerations

### Potential Enhancements

- Different grid sizes (10px, 40px options)
- Grid color theming
- Grid spacing based on zoom level
- Magnetic snap strength adjustment
- Additional grid styles (dashed, custom patterns)

### Constraints

- Must maintain 120fps performance
- Should align perfectly with snap-to-grid
- Keep implementation simple and reliable
- Avoid creating many DOM elements
