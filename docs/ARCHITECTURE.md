# React Component Whiteboard - Architecture Guide

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Application Architecture](#application-architecture)
4. [State Management](#state-management)
5. [Component Hierarchy](#component-hierarchy)
6. [Custom Hooks](#custom-hooks)
7. [Utility Functions](#utility-functions)
8. [Constants & Configuration](#constants--configuration)
9. [Coordinate System](#coordinate-system)
10. [Performance Optimizations](#performance-optimizations)
11. [Data Flow](#data-flow)
12. [Testing Architecture](#testing-architecture)

---

## Overview

The React Component Whiteboard is a sophisticated interactive canvas application built with modern React patterns. The architecture emphasizes:

- **Modularity**: Clear separation of concerns through custom hooks
- **Performance**: GPU acceleration and optimized rendering
- **Type Safety**: Comprehensive TypeScript coverage
- **Maintainability**: Well-organized code structure with consistent patterns

**Key Metrics:**
- 81 TypeScript/TSX files
- 15+ different component types
- 7 specialized custom hooks
- 24%-480% zoom range
- 60+ FPS target performance

---

## Technology Stack

### Core Framework
- **React 18.3.1** - UI library with concurrent features
- **TypeScript 5.5.3** - Type-safe JavaScript
- **Vite 5.4.1** - Fast build tool and dev server

### State & Data
- **Zustand 5.0.5** - Lightweight state management
- **D3.js 7.9.0** - Zoom/pan transformations and interactions

### UI & Styling
- **Tailwind CSS 3.4.10** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React 0.439** - Icon library
- **class-variance-authority 0.7.0** - Component variants

### Desktop
- **Electron 36.5.0** - Cross-platform desktop app
- **electron-builder 26.0.12** - Application packaging

### Testing
- **Vitest 3.2.4** - Fast unit test framework
- **@testing-library/react 16.3.0** - React testing utilities
- **jsdom 26.1.0** - DOM simulation

### Additional Libraries
- **canvas-confetti 1.9.3** - Celebration animations
- **react-markdown 10.1.0** - Markdown rendering
- **remark-gfm 4.0.1** - GitHub Flavored Markdown
- **next-themes 0.4.6** - Dark mode support

---

## Application Architecture

### Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│  (React Components - Widgets, Shapes, UI Primitives)        │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      Interaction Layer                       │
│  (Custom Hooks - Zoom, Pan, Drag, Events, Performance)      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                       State Layer                            │
│           (Zustand Store - whiteboardStore.ts)              │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      Utility Layer                           │
│  (Coordinates, Bounds, Grid, URL Detection, Clipboard)       │
└─────────────────────────────────────────────────────────────┘
```

### Component Organization Pattern

The application follows a **feature-based organization** with clear separation:

- **Base Components** (`/components/base/`) - Shared functionality
- **Shapes** (`/components/shapes/`) - Geometric primitives
- **Widgets** (`/components/widgets/`) - Business logic components
- **UI** (`/components/ui/`) - Reusable UI primitives
- **Headers** (`/components/headers/`) - Control toolbars
- **Whiteboard** (`/components/whiteboard/`) - Canvas-specific components

---

## State Management

### Zustand Store Architecture

**Location:** `src/store/whiteboardStore.ts`

The application uses a single Zustand store as the source of truth for all whiteboard state.

#### State Shape

```typescript
interface WhiteboardState {
  // Core State
  components: Component[]              // All whiteboard components
  selectedComponents: number[]          // IDs of currently selected
  initialPositions: InitialPosition[]  // For multi-drag operations
  copiedComponents: Component[]        // Clipboard data

  // Actions
  setComponents: (components: Component[] | ((prev: Component[]) => Component[])) => void
  setSelectedComponents: (ids: number[]) => void
  handleDeleteComponent: (id: number) => void
  handleDeleteSelected: () => void
  addNewComponent: (type: string, x: number, y: number, additionalProps?: Partial<Component>) => void
  bringToFront: (id: number) => void
  handleResizeComponent: (id: number, width: number, height: number) => void
  handleTextChange: (id: number, text: string) => void
  handleImageChange: (id: number, imageSrc: string) => void
  handleFormattingChange: (id: number, formatting: Partial<Component>) => void
  handleDrag: (id: number, x: number, y: number, snapToGrid: boolean) => void
  handleSelect: (id: number, multiSelect: boolean) => void
  handleDragStart: (selectedIds: number[]) => void
}
```

#### Key Features

1. **Functional Updates** - Supports callback patterns for safe state updates
2. **Multi-Component Operations** - Batch operations on selected components
3. **Z-Index Auto-Management** - Automatic layering on selection/drag
4. **Grid Snapping** - Integrated snap-to-grid logic in drag handler
5. **Immutable Updates** - All updates use spread operators for immutability

#### Component Interface

**Location:** `src/types/whiteboard.ts`

```typescript
interface Component {
  // Identity & Position
  id: number
  x: number
  y: number
  type: string
  width?: number
  height?: number
  zIndex?: number

  // Content Properties
  imageSrc?: string
  text?: string
  youtubeUrl?: string
  soundcloudUrl?: string
  spotifyUrl?: string
  linkUrl?: string

  // Text Formatting
  fontSize?: number
  fontFamily?: string
  textColor?: string
  textAlign?: "left" | "center" | "right"
  fontWeight?: "normal" | "bold"
  fontStyle?: "normal" | "italic"
  textDecoration?: "none" | "underline" | "line-through"

  // Shape Formatting
  fillColor?: string
  strokeColor?: string
  strokeWidth?: number
  borderRadius?: number

  // Line/Arrow Options
  strokeStyle?: "solid" | "dashed" | "dotted"
  arrowStyle?: "none" | "arrow" | "double-arrow"
  arrowSize?: number

  // Effects
  rotation?: number
  opacity?: number

  // Scrolling Text Options
  scrollDirection?: "horizontal" | "vertical"
  scrollSpeed?: number
  pauseOnHover?: boolean
  bounceOnEnd?: boolean
  backgroundColor?: string
}
```

---

## Component Hierarchy

### Main Application Flow

```
main.tsx (Entry Point)
  └─ ThemeProvider (Theme Context)
      └─ App.tsx (CustomGrid Component)
          ├─ Store Subscription (Zustand)
          ├─ Custom Hooks Initialization
          ├─ Event Listeners Setup
          │
          ├─ GridBackground (SVG Grid Layer)
          ├─ DragPreviewOverlay (Drag Feedback)
          │
          ├─ Main SVG Container (Zoom/Pan Transform)
          │   └─ For each component:
          │       └─ DraggableComponent (Wrapper)
          │           ├─ Selection Visual
          │           ├─ Resize Handles
          │           └─ ComponentRenderer (Type Router)
          │               ├─ Widgets (Timer, Weather, etc.)
          │               ├─ Shapes (Rectangle, Text, etc.)
          │               └─ Media (YouTube, Images, etc.)
          │
          ├─ CategorySidebar (Component Library)
          ├─ ComponentFooter (Category Buttons)
          ├─ ControlPanel (Zoom/Grid Controls)
          ├─ ShapeControlHeader (Formatting Toolbar)
          ├─ ScrollingTextControlHeader (Animation Controls)
          ├─ ThemeToggle (Dark/Light Mode)
          ├─ FPSMonitor (Performance Display)
          └─ Overview Modal (Minimap)
```

### Component Categories

#### 1. **Widgets** (`/components/widgets/`)

Rich, interactive components with business logic:

| Component | File | Purpose |
|-----------|------|---------|
| Timer | Timer.tsx | Countdown/count-up timer with controls |
| Watch | Watch.tsx | Digital clock displaying current time |
| Weather | Weather.tsx | Real-time weather information |
| BitcoinChart | BitcoinChart.tsx | Crypto price visualization |
| CurrencyConverter | CurrencyConverter.tsx | Currency exchange rates |
| TextNote | TextNote.tsx | Markdown editor with formatting |
| ConfettiButton | ConfettiButton.tsx | Celebration button animation |
| YouTubeVideo | YouTubeVideo.tsx | YouTube embed player |
| SoundCloudWidget | SoundCloudWidget.tsx | SoundCloud player embed |
| SpotifyWidget | SpotifyWidget.tsx | Spotify embed (track/playlist/album) |
| LinkPreview | LinkPreview.tsx | Dynamic web link preview |
| StylishLink | StylishLink.tsx | Enhanced link component |
| Voting | Voting.tsx | Two-option voting interface |

#### 2. **Shapes** (`/components/shapes/`)

Geometric primitives with formatting:

| Component | File | Features |
|-----------|------|----------|
| RectangleShape | RectangleShape.tsx | Rectangle with fill/stroke |
| EllipseShape | EllipseShape.tsx | Circle/ellipse shape |
| ArrowShape | ArrowShape.tsx | Directional arrow with styles |
| LineShape | LineShape.tsx | Straight line with options |
| TextShape | TextShape.tsx | Editable text with formatting |
| ImageShape | ImageShape.tsx | Image with rotation/opacity |
| ScrollingTextShape | ScrollingTextShape.tsx | Animated scrolling text |
| GroupedShape | GroupedShape.tsx | Container for grouped components |

All shapes extend **BaseShape.tsx** for common rendering logic.

#### 3. **UI Primitives** (`/components/ui/`)

Radix UI-based accessible components:
- **Button** - Interactive button
- **Card** - Content container
- **Input** - Text input field
- **Textarea** - Multi-line input
- **Label** - Form label
- **Select** - Dropdown selection
- **Popover** - Floating dialog

---

## Custom Hooks

### Hook Architecture

The application uses specialized hooks to separate concerns and improve maintainability.

#### 1. **useZoomControls** (`hooks/useZoomControls.ts`)

Manages zoom and pan transformations using D3.js.

**Responsibilities:**
- D3 zoom behavior initialization
- Transform state management (translate x/y, scale k)
- Zoom operations (reset, zoom-to-fit, zoom-to-selection)
- Zoom indicator display

**Returns:**
```typescript
{
  transform: { k: number, x: number, y: number }
  showZoomIndicator: boolean
  isActivelyZooming: boolean
  svgRef: RefObject<SVGSVGElement>
  gRef: RefObject<SVGGElement>
  resetZoom: () => void
  zoomToFit: () => void
  zoomToSelection: () => void
  zoomByFactor: (factor: number) => void
}
```

**Key Features:**
- Programmatic zoom control
- Zoom constraints (24%-480%)
- Smooth transitions
- Auto-fit to content

#### 2. **usePanControls** (`hooks/usePanControls.ts`)

Handles pan gestures and marquee selection.

**Responsibilities:**
- Two-finger trackpad scrolling
- Space + click panning
- Marquee selection (drag-to-select)
- Screen ↔ Whiteboard coordinate conversion

**Returns:**
```typescript
{
  isSpacePressed: boolean
  isMarqueeActive: boolean
  marqueeStart: { x: number, y: number } | null
  marqueeEnd: { x: number, y: number } | null
  handleMouseDown: (e: React.MouseEvent) => void
  handleMouseMove: (e: React.MouseEvent) => void
  handleMouseUp: () => void
}
```

**Key Features:**
- Multi-touch gesture support
- Coordinate transformation
- Visual marquee overlay
- Intersection detection

#### 3. **useDragAndDrop** (`hooks/useDragAndDrop.ts`)

Manages file and URL drop operations.

**Responsibilities:**
- File drop handling (images)
- URL drop detection (YouTube, SoundCloud, Spotify, images)
- Component drag from sidebar
- Drag preview visualization

**Key Features:**
- URL type detection
- Automatic component creation
- Drag preview overlay
- File validation

#### 4. **useEventHandlers** (`hooks/useEventHandlers.ts`)

Coordinates global keyboard and mouse events.

**Keyboard Shortcuts:**
- `1` - Reset zoom to 100%
- `Shift+1` - Zoom to fit all
- `2` - Zoom to selection
- `3` / `O` - Toggle overview
- `4` / `G` - Toggle grid
- `Escape` - Deselect / Close overview
- `Ctrl/Cmd+C` - Copy components
- `Ctrl/Cmd+V` - Paste components
- `Ctrl/Cmd+Shift+V` - Force paste image
- `Delete` / `Backspace` - Delete selected
- `T` - Toggle text tool

**Mouse Events:**
- Wheel zoom
- Trackpad pinch-to-zoom
- Context menu pan
- Click selection

#### 5. **useComponentCreators** (`hooks/useComponentCreators.ts`)

Factory functions for creating components at mouse position.

**Functions:**
```typescript
{
  createImageComponentAtMouse: (imageSrc: string, mousePos: Point) => void
  createTextComponentAtMouse: (text: string, mousePos: Point) => void
  createShapeComponentAtMouse: (type: string, mousePos: Point) => void
  createYouTubeComponentAtMouse: (url: string, mousePos: Point) => void
  createSoundCloudComponentAtMouse: (url: string, mousePos: Point) => void
  createSpotifyComponentAtMouse: (url: string, mousePos: Point) => void
  createLinkPreviewComponentAtMouse: (url: string, mousePos: Point) => void
}
```

**Key Features:**
- Coordinate transformation
- Component centering
- Type-specific sizing
- Property initialization

#### 6. **useSidebarControls** (`hooks/useSidebarControls.ts`)

Manages component library sidebar state.

**Returns:**
```typescript
{
  activeCategory: string | null
  isSidebarOpen: boolean
  dragType: string | null
  setActiveCategory: (category: string | null) => void
  setIsSidebarOpen: (open: boolean) => void
  setDragType: (type: string | null) => void
}
```

#### 7. **usePerformance** (`hooks/usePerformance.ts`)

Performance optimization utilities.

**Features:**
- GPU-accelerated styles (transform3d)
- RequestAnimationFrame throttling
- Batch update queueing
- FPS monitoring

**Returns:**
```typescript
{
  getGPUStyle: (transform: string) => CSSProperties
  throttleRAF: (callback: () => void) => void
  batchUpdate: (updates: () => void) => void
}
```

---

## Utility Functions

### Geometric Utilities (`utils/boundsUtils.ts`)

```typescript
// Calculate bounding box of all components
getComponentsBounds(components: Component[]): Bounds

// Create rectangle from two points (for marquee)
createRectFromPoints(p1: Point, p2: Point): Rect
```

### Coordinate Utilities (`utils/coordinateUtils.ts`)

```typescript
// Transform screen coordinates to whiteboard space
screenToWhiteboard(screenPoint: Point, transform: Transform): Point

// Transform whiteboard coordinates to screen space
whiteboardToScreen(whiteboardPoint: Point, transform: Transform): Point

// Center component at mouse position
centerComponentAtMouse(mousePos: Point, transform: Transform, size: Size): Point
```

### Grid Utilities (`utils/gridUtils.ts`)

```typescript
// Get dynamic grid size based on zoom level
getDynamicGridSize(zoomLevel: number): number

// Get grid opacity based on zoom
getDynamicGridOpacity(zoomLevel: number): number

// Get grid stroke width
getDynamicStrokeWidth(zoomLevel: number, gridSize: number): number

// Snap value to grid
snapToGrid(value: number, gridSize: number): number

// Snap point to grid
snapPointToGrid(x: number, y: number, gridSize: number): Point

// Snap size to grid (24px increments)
snapSizeToGrid(size: number): number
```

**Grid Scaling Logic:**
```
Zoom Level      Grid Size
-----------     ---------
< 0.5x          96px (4x base)
0.5x - 1.0x     48px (2x base)
1.0x - 2.0x     24px (1x base)
2.0x - 3.0x     12px (0.5x base)
> 3.0x          6px (0.25x base)
```

### URL Detection (`utils/urlDetection.ts`)

```typescript
// Detect URL type for automatic component creation
detectUrlType(url: string): "image" | "youtube" | "soundcloud" | "spotify" | "linkpreview"

// Type-specific validators
isImageUrl(url: string): boolean
isYouTubeUrl(url: string): boolean
isSoundCloudUrl(url: string): boolean
isSpotifyUrl(url: string): boolean
isGenericUrl(url: string): boolean

// Extract image from HTML content
extractImageFromHtml(htmlText: string): string | null
```

### Clipboard Operations (`utils/clipboardOperations.ts`)

```typescript
// Copy selected components to clipboard
copySelectedComponents(
  components: Component[],
  selectedIds: number[],
  setter: (components: Component[]) => void
): void

// Handle component paste from clipboard
handleComponentPaste(
  state: WhiteboardState,
  setters: StateSetters,
  creators: ComponentCreators
): void

// Handle image paste from system clipboard
handleImagePasteFromClipboard(
  imageCreator: (imageSrc: string, pos: Point) => void
): void
```

### ID Management (`utils/idUtils.ts`)

```typescript
// Get next available component ID
getNextComponentId(components: Component[]): number

// Get highest z-index value
getMaxZIndex(components: Component[]): number
```

---

## Constants & Configuration

### Application Constants (`constants/appConstants.ts`)

#### Zoom Configuration
```typescript
ZOOM_CONSTANTS = {
  MIN_ZOOM: 0.24,           // 24%
  MAX_ZOOM: 4.8,            // 480%
  ZOOM_INTENSITY: 0.015,    // Wheel sensitivity
  PAN_SENSITIVITY: 2.0,     // Trackpad sensitivity
  RESET_ZOOM: 1,            // 100%
}
```

#### Component Sizes
```typescript
COMPONENT_SIZES = {
  DEFAULT_WIDTH: 192,        // 8 * 24px
  DEFAULT_HEIGHT: 192,
  MIN_WIDTH: 192,
  MIN_HEIGHT: 144,           // 6 * 24px

  // Media Components
  YOUTUBE_WIDTH: 384,        // 16 * 24px
  YOUTUBE_HEIGHT: 288,       // 12 * 24px (4:3)
  SOUNDCLOUD_WIDTH: 384,
  SOUNDCLOUD_HEIGHT: 192,
  SPOTIFY_WIDTH: 384,
  SPOTIFY_HEIGHT: 192,

  // Link Preview
  LINK_PREVIEW_WIDTH: 384,
  LINK_PREVIEW_HEIGHT: 288,
  LINK_PREVIEW_COMPACT_WIDTH: 192,
  LINK_PREVIEW_COMPACT_HEIGHT: 72,
}
```

#### Grid Configuration
```typescript
GRID_CONSTANTS = {
  SIZE: 24,                  // Base grid size (divisible by 8)
  OPACITY: 0.65,             // Base opacity
  STROKE_WIDTH: 0.5,         // Base stroke width
  ENABLED: true,             // Default enabled
  DYNAMIC_SIZING: true,      // Zoom-based sizing
  SIZES: [8, 16, 24, 32, 48, 96],  // Available sizes
  TYPES: ["lines", "dots", "both"],
  DEFAULT_TYPE: "lines",
}
```

#### Z-Index Layers
```typescript
Z_INDEX = {
  DRAG_OVERLAY: 1000,
  DRAG_PREVIEW: 9998,
  MARQUEE_SELECTION: 9999,
  ZOOM_INDICATOR: 10000,
  OVERVIEW_MODAL: 10001,
  COMPONENT_HEADER: 10002,
}
```

### Component Categories (`constants/componentCategories.ts`)

```typescript
COMPONENT_CATEGORIES = [
  {
    name: "Utilities",
    components: ["timer", "watch", "note", "confetti", "voting"]
  },
  {
    name: "Data & Finance",
    components: ["weather", "bitcoin", "currency"]
  },
  {
    name: "Media",
    components: ["scrollingtext"]
  },
  {
    name: "Shapes",
    components: ["rectangle", "ellipse", "arrow", "line"]
  },
  {
    name: "Other",
    components: ["groupFrame", "groupContainer"]
  }
]
```

---

## Coordinate System

### Dual Coordinate System

The application maintains two coordinate systems:

1. **Screen Coordinates** - Viewport/mouse positions in pixels
2. **Whiteboard Coordinates** - Infinite canvas coordinate space

### Transform Matrix

D3.js `ZoomTransform` manages the relationship:

```typescript
interface Transform {
  k: number   // Scale factor (zoom level)
  x: number   // X translation
  y: number   // Y translation
}
```

### Coordinate Conversion

**Screen → Whiteboard:**
```typescript
whiteboardX = (screenX - transform.x) / transform.k
whiteboardY = (screenY - transform.y) / transform.k
```

**Whiteboard → Screen:**
```typescript
screenX = whiteboardX * transform.k + transform.x
screenY = whiteboardY * transform.k + transform.y
```

### Component Positioning

All components store positions in **whiteboard coordinates**:
- Independent of zoom level
- Consistent across viewport changes
- Enables precise snapping and alignment

---

## Performance Optimizations

### 1. GPU Acceleration

**Implementation:** `usePerformance.ts`

```typescript
// Force GPU layer creation
getGPUStyle(transform: string): CSSProperties {
  return {
    transform: transform,
    willChange: 'transform',
    transform3d: 'translate3d(0, 0, 0)'
  }
}
```

**Benefits:**
- Offloads rendering to GPU
- Smoother animations
- Reduced main thread load

### 2. RequestAnimationFrame Throttling

```typescript
throttleRAF(callback: () => void): void {
  requestAnimationFrame(() => {
    callback()
  })
}
```

**Use Cases:**
- Pan/zoom updates
- Drag operations
- Visual feedback

### 3. Component Memoization

**React.memo** usage in:
- `DraggableComponent` - Prevents unnecessary re-renders
- Widget components - Only update when props change
- UI primitives - Stable reference optimization

### 4. Batch State Updates

```typescript
// Group multiple updates into single render
batchUpdate(updates: () => void): void {
  startTransition(() => {
    updates()
  })
}
```

### 5. Conditional Rendering

- Grid only renders when visible
- Components outside viewport can be culled (future enhancement)
- Headers only render when components selected

### 6. Dynamic Grid Optimization

Grid detail reduces at extreme zoom levels:
- Prevents visual clutter
- Reduces SVG complexity
- Maintains performance at all zoom levels

---

## Data Flow

### Component Creation Flow

```
User Action (Drag/Drop/Paste)
  ↓
Event Handler (useDragAndDrop/useEventHandlers)
  ↓
URL Type Detection (if applicable)
  ↓
Component Creator Hook (useComponentCreators)
  ↓
Store Action (addNewComponent)
  ↓
State Update (components array)
  ↓
React Re-render
  ↓
ComponentRenderer mounts widget
  ↓
DraggableComponent wraps for interaction
  ↓
Visual Update
```

### Drag Operation Flow

```
Mouse Down
  ↓
handleDragStart (Store)
  ↓
Save initialPositions for selected components
  ↓
Mouse Move
  ↓
Calculate delta
  ↓
Apply snap-to-grid (if enabled)
  ↓
handleDrag (Store)
  ↓
Update component positions
  ↓
Bring to front (z-index)
  ↓
React Re-render
  ↓
Visual Update
```

### Copy/Paste Flow

```
Ctrl+C Pressed
  ↓
copySelectedComponents (Clipboard Utils)
  ↓
Save to copiedComponents (Store)
  ↓
Ctrl+V Pressed
  ↓
handleComponentPaste (Clipboard Utils)
  ↓
Check clipboard for:
  - Copied components
  - URL text
  - Image data
  ↓
Detect type and create components
  ↓
Apply position offset
  ↓
addNewComponent (Store)
  ↓
Visual Update
```

### Zoom/Pan Flow

```
User Gesture (Wheel/Trackpad/Button)
  ↓
D3 Zoom Behavior
  ↓
Calculate new transform
  ↓
Apply zoom constraints (24%-480%)
  ↓
Update transform state
  ↓
Show zoom indicator (200ms)
  ↓
Update SVG transform attribute
  ↓
Components automatically scale/translate
```

---

## Testing Architecture

### Test Setup

**Location:** `src/test/setup.ts`

**Configuration:**
- **Framework:** Vitest with jsdom environment
- **Library:** @testing-library/react
- **Mocking:** D3.js, Performance API, requestAnimationFrame

### Mock Implementations

```typescript
// D3 Zoom Behavior Mock
vi.mock('d3', () => ({
  select: vi.fn(() => ({
    call: vi.fn(),
    on: vi.fn()
  })),
  zoom: vi.fn(() => ({
    scaleExtent: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis()
  })),
  zoomIdentity: {
    k: 1,
    x: 0,
    y: 0,
    translate: vi.fn(),
    scale: vi.fn()
  }
}))
```

### Test Structure

**Location:** `src/components/__tests__/`

**Test Categories:**
1. **Unit Tests** - Individual component behavior
2. **Integration Tests** - Multi-component interactions
3. **Hook Tests** - Custom hook logic
4. **Utility Tests** - Helper function correctness

### Running Tests

```bash
npm run test        # Watch mode
npm run test:ui     # Vitest UI
npm run test:run    # Run once
```

---

## Best Practices

### Adding New Components

1. Create component file in appropriate directory
2. Extend base class if applicable (BaseShape, BaseWidget)
3. Add type definition to `componentCategories.ts`
4. Add rendering logic to `ComponentRenderer.tsx`
5. Add creator function to `useComponentCreators.ts`
6. Add tests in `__tests__/`

### State Updates

```typescript
// ✅ Good - Functional update
setComponents(prev => [...prev, newComponent])

// ❌ Bad - Direct mutation
components.push(newComponent)
setComponents(components)
```

### Performance Considerations

1. Use `React.memo()` for expensive components
2. Use `useCallback()` for event handlers
3. Use `useMemo()` for computed values
4. Batch related state updates
5. Avoid inline object creation in render

### Coordinate Handling

```typescript
// ✅ Always convert screen → whiteboard for storage
const whiteboardPos = screenToWhiteboard(mousePos, transform)
addNewComponent(type, whiteboardPos.x, whiteboardPos.y)

// ✅ Convert whiteboard → screen for rendering
const screenPos = whiteboardToScreen(component, transform)
```

---

## Future Architecture Considerations

### Scalability Enhancements

1. **Virtual Rendering** - Only render visible components
2. **Web Workers** - Offload heavy computations
3. **WebGL Canvas** - Hardware-accelerated rendering
4. **Lazy Loading** - Dynamic component imports

### Collaboration Features

1. **WebSocket Integration** - Real-time sync
2. **Operational Transform** - Conflict resolution
3. **Presence System** - User cursor tracking
4. **History/Undo** - Event sourcing pattern

### Data Persistence

1. **Local Storage** - Auto-save functionality
2. **IndexedDB** - Large file storage
3. **Cloud Sync** - Multi-device support
4. **Export/Import** - JSON format

---

This architecture guide provides a comprehensive overview of the React Component Whiteboard codebase. For specific implementation details, refer to the source code and inline documentation.
