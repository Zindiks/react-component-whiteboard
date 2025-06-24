# Grid System Documentation

````typescript
// src/cons### Usage

```tsx
<GridBackground
  transform={transform}
  enabled={showGrid}
  size={gridSize}
  dynamicSizing={dynamicGridSizing}
/>
```nstants.ts
export const GRID_CONSTANTS = {
  SIZE: 20, // Grid cell size in pixels
  COLOR: "#b0b0b0", // Light gray grid lines
  STROKE_WIDTH: 0.5, // Line thickness
  OPACITY: 0.6, // Base opacity
  ENABLED: true, // Default enabled state
  DOT_SIZE: 1.5, // Dot radius for dotted grid style
  STYLE: "line", // Default grid style ("line" | "dotted")
  DYNAMIC_SIZING: true, // Enable dynamic grid sizing
  SIZES: [10, 20, 40, 80], // Available grid sizes
} as const;
````

The whiteboard features a high-performance grid system that provides visual alignment and snap-to-grid functionality.

## Current Implementation

### Grid Component

- **File**: `src/components/GridBackground.tsx`
- **Type**: SVG Pattern-based
- **Performance**: Optimized for 120fps

### Features

- ✅ **Visual Grid**: Clean line-based grid overlay
- ✅ **Dynamic Sizing**: Grid adapts to zoom level for optimal visibility
- ✅ **Configurable Sizes**: Choose from 10px, 20px, 40px, 80px grid sizes
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
  COLOR: "#b0b0b0", // Light gray grid lines
  STROKE_WIDTH: 0.5, // Line thickness
  OPACITY: 0.6, // Base opacity
  ENABLED: true, // Default enabled state
  DYNAMIC_SIZING: true, // Enable dynamic grid sizing
  SIZES: [10, 20, 40, 80], // Available grid sizes
} as const;
```

### Usage

```tsx
<GridBackground
  transform={transform}
  enabled={showGrid}
  style={gridStyle}
  size={gridSize}
  dynamicSizing={dynamicGridSizing}
/>
```

## Controls

### Grid Toggle

- **Button**: Grid icon (📐) in control panel
- **Function**: Show/hide grid overlay
- **Keyboard**: No shortcut (uses button only)

### Grid Size Selector

- **Control**: Dropdown selector (visible when grid is enabled)
- **Options**: 10px, 20px, 40px, 80px grid sizes
- **Function**: Changes base grid cell size

### Dynamic Sizing Toggle

- **Button**: Lightning icon (⚡) in control panel (visible when grid is enabled)
- **Function**: Enable/disable adaptive grid sizing based on zoom level
- **Behavior**: When enabled, grid automatically adjusts size for optimal visibility

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
- **Dynamic Grid Sizing**: Grid cells adapt to zoom for optimal visibility

### Dynamic Zoom Adaptation

- **Size Scaling**: Grid automatically adjusts size based on zoom level when dynamic sizing is enabled
  - Very zoomed out (< 0.25x): 4x larger grid
  - Zoomed out (< 0.5x): 2x larger grid
  - Normal (0.5x - 3x): Base grid size
  - Zoomed in (> 3x): 0.5x smaller grid
- **Opacity Scaling**: Grid becomes more/less visible based on zoom level
- **Pattern Transform**: Grid moves and scales perfectly with viewport
- **Consistent Experience**: Maintains optimal visibility at all zoom levels

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

### Dotted Grid Style (Removed)

- ❌ **Reason**: User preference for line grid only
- ❌ **Cleanup**: Removed all dotted grid code and dependencies
- ❌ **Result**: Simpler, more focused grid implementation

## Best Practices

### Grid Usage

1. Keep grid enabled for better component alignment
2. Use snap-to-grid for precise positioning
3. Choose appropriate grid size for your workflow (20px is optimal for most components)
4. Enable dynamic sizing for better visibility at all zoom levels
5. Grid opacity automatically adapts to zoom level

### Performance

1. Grid uses efficient SVG patterns (not individual lines)
2. GPU acceleration ensures smooth panning/zooming
3. Throttled updates maintain 120fps target
4. Minimal memory footprint
5. Dynamic sizing maintains performance at all zoom levels

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
