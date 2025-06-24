# Grid Style Options

## Overview

The whiteboard now supports two grid styles:

- **Line Grid**: Traditional grid with intersecting lines
- **Dotted Grid**: Grid with dots at intersection points

## How to Switch Grid Styles

### UI Toggle

1. Make sure the grid is enabled (grid button is highlighted in the control panel)
2. When the grid is visible, you'll see a style toggle button next to the grid button
3. Click the style toggle button to switch between:
   - `━━━` (represents line style)
   - `⋮⋮⋮` (represents dotted style)

### Programmatic Control

```typescript
// Grid style state
const [gridStyle, setGridStyle] = useState<"line" | "dotted">("line");

// Toggle function
const toggleGridStyle = () => {
  setGridStyle(gridStyle === "line" ? "dotted" : "line");
};
```

## Implementation Details

### Supported Grid Components

All three grid implementations support both styles:

1. **GridBackground** (SVG-based, default)

   - Line style: Uses SVG `<line>` elements
   - Dotted style: Uses SVG `<circle>` elements at intersections

2. **CanvasGridBackground** (Canvas-based, high performance)

   - Line style: Uses canvas `moveTo`/`lineTo` operations
   - Dotted style: Uses canvas `arc` for circles at intersections

3. **CSSGridBackground** (CSS-based, ultra-high performance)
   - Line style: Uses CSS `linear-gradient` patterns
   - Dotted style: Uses CSS `radial-gradient` patterns

### Performance Characteristics

#### Line Grid

- **SVG**: Good performance, smooth rendering
- **Canvas**: High performance, efficient line batching
- **CSS**: Ultra-high performance, GPU accelerated

#### Dotted Grid

- **SVG**: Good performance, individual circle elements
- **Canvas**: High performance, individual arc drawing
- **CSS**: Ultra-high performance, GPU accelerated patterns

### Grid Style Constants

```typescript
export const GRID_CONSTANTS = {
  SIZE: 20, // Base grid cell size in pixels
  COLOR: "#e0e0e0", // Light gray grid lines/dots
  STROKE_WIDTH: 0.5, // Base stroke width for lines
  OPACITY: 0.6, // Base opacity
  ENABLED: true, // Grid enabled by default
  DOT_SIZE: 1.5, // Dot radius for dotted grid style
  STYLE: "line" as "line" | "dotted", // Default grid style
} as const;
```

### Dynamic Behavior

Both grid styles adapt to zoom levels:

- **Dot Size**: Scales with zoom (0.5x to 2x multiplier)
- **Line Thickness**: Scales with zoom for consistency
- **Grid Density**: Changes based on zoom level (4x, 2x, 1x, 0.5x grid sizes)
- **Opacity**: Fades at extreme zoom levels

## Usage Examples

### Basic Implementation

```tsx
<GridBackground
  transform={transform}
  width={window.innerWidth}
  height={window.innerHeight}
  enabled={showGrid}
  style={gridStyle} // "line" or "dotted"
/>
```

### With Controls

```tsx
<ControlPanel
  // ... other props
  showGrid={showGrid}
  onToggleGrid={() => setShowGrid(!showGrid)}
  gridStyle={gridStyle}
  onToggleGridStyle={() =>
    setGridStyle(gridStyle === "line" ? "dotted" : "line")
  }
/>
```

## Benefits

### Line Grid

- ✅ Clear visual structure
- ✅ Easy alignment reference
- ✅ Traditional feel
- ✅ Works well at all zoom levels

### Dotted Grid

- ✅ Less visual noise
- ✅ Subtle background
- ✅ Modern appearance
- ✅ Better for design work
- ✅ Doesn't interfere with content

## Accessibility

- Both grid styles maintain consistent opacity and color
- Grid can be completely disabled for users who prefer clean backgrounds
- High contrast mode compatibility maintained
- Performance optimized to maintain 120fps for smooth interaction
