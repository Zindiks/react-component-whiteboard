# React Component Whiteboard - Project Context

## 📋 Project Overview

**React Component Whiteboard** is a sophisticated, interactive whiteboard application built with modern web technologies. It provides an infinite canvas for creating, manipulating, and organizing various widgets and components with advanced interaction capabilities.

### Core Technologies

- **Frontend**: React 18.3.1 + TypeScript
- **State Management**: Zustand 5.0.5
- **Graphics & Interactions**: D3.js 7.9.0 for zoom/pan/transform behaviors
- **Desktop App**: Electron 36.5.0 support
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **Build Tools**: Vite + TypeScript
- **Testing**: Vitest + Testing Library

## 🏗️ Architecture Overview

The application follows a modern React architecture with clear separation of concerns:

### **Store Layer** (Zustand)

- `src/store/whiteboardStore.ts` - Central state management for all whiteboard operations
- Manages components, selections, clipboard operations, and interactions
- Provides actions for component CRUD, drag, resize, text editing

### **Hook Layer** (Custom React Hooks)

- **Interaction Hooks**:
  - `useZoomControls.ts` - Zoom, pan, transform management with D3.js
  - `usePanControls.ts` - Mouse/touch interactions, marquee selection
  - `useDragAndDrop.ts` - File/URL drop handling, component creation
  - `useEventHandlers.ts` - Global keyboard shortcuts and event management
  - `useComponentCreators.ts` - Factory functions for creating different component types
- **UI Hooks**:
  - `useSidebarControls.ts` - Component category sidebar management
  - `useKeyboardShortcuts.ts` - Keyboard navigation and shortcuts
  - `usePerformance.ts` - GPU acceleration and performance optimizations

### **Component Layer**

- **Layout Components**:
  - `App.tsx` - Main application container and orchestration
  - `ComponentFooter.tsx` - Category selection footer
  - `CategorySidebar.tsx` - Component library sidebar
  - `ControlPanel.tsx` - Zoom, grid, and tool controls
  - `Overview.tsx` - Minimap/overview component
- **Whiteboard Components**:
  - `DraggableWhiteboardComponent.tsx` - Main component wrapper with interactions
  - `GridBackground.tsx` - Dynamic grid system
  - `DragPreviewOverlay.tsx` - Visual feedback during drag operations
- **Shape Components**:
  - `shapes/` - Rectangle, Ellipse, Line, Arrow, Text, Image, ScrollingText
  - `base/BaseShape.tsx` - Common shape functionality
- **Widget Components**:
  - `widgets/` - Timer, Weather, Bitcoin, Currency, YouTube, SoundCloud, etc.
- **UI Components**:
  - `ui/` - Reusable UI primitives (Button, Input, Card, etc.)
  - `headers/` - Control headers for selected components

### **Utility Layer**

- **Core Utilities**:
  - `idUtils.ts` - ID generation and z-index management
  - `coordinateUtils.ts` - Screen/whiteboard coordinate transformations
  - `boundsUtils.ts` - Component bounds and collision detection
  - `gridUtils.ts` - Dynamic grid sizing and snapping
- **Feature Utilities**:
  - `clipboardOperations.ts` - Copy/paste functionality with format detection
  - `urlDetection.ts` - URL parsing for YouTube, SoundCloud, Spotify, images
  - `componentLoggers.ts` - Structured logging for debugging
  - `theme.ts` - Theme management and utilities

## 🎯 Key Features

### **Core Whiteboard Features**

- **Infinite Canvas**: Unlimited workspace with efficient viewport culling
- **Multi-Level Zoom**: 10% - 700% zoom range with smooth transitions
- **Advanced Interactions**: Pan, zoom, marquee selection, drag & drop
- **Component Management**: Create, select, move, resize, delete, copy/paste
- **Layer Management**: Z-index ordering with visual feedback

### **Grid System**

- **Dynamic Grid**: Adaptive grid size based on zoom level
- **Snap to Grid**: Optional component snapping with visual guides
- **Grid Types**: Lines, dots, or hybrid grid display
- **Performance Optimized**: GPU-accelerated grid rendering

### **Component Types**

- **Basic Shapes**: Rectangle, Circle, Ellipse, Line, Arrow
- **Text Components**: Rich text with formatting, scrolling text
- **Media Components**: Images (drag from files/URLs), image shapes
- **Integration Widgets**: YouTube videos, SoundCloud audio, Spotify
- **Utility Widgets**: Timer, weather, Bitcoin chart, currency converter
- **Interactive Widgets**: Confetti button, voting, stylish links

### **Advanced Interactions**

- **Keyboard Shortcuts**: Copy/paste (Ctrl+C/V), delete, select all, etc.
- **Mouse Controls**: Pan (middle/right click), zoom (wheel), marquee selection
- **Touch Support**: Multi-touch gestures for mobile/tablet
- **Context Actions**: Component-specific control headers

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── __tests__/       # Component tests
│   ├── base/            # Base component classes
│   ├── headers/         # Control headers for selected components
│   ├── shapes/          # Shape components (Rectangle, Circle, etc.)
│   ├── ui/              # Reusable UI primitives
│   ├── widgets/         # Widget components (Timer, Weather, etc.)
│   └── whiteboard/      # Whiteboard-specific components
├── constants/           # Application constants
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── store/               # Zustand state management
├── types/               # TypeScript type definitions
└── utils/               # Utility functions

electron/                # Electron app configuration
├── main.ts             # Main Electron process
└── preload.ts          # Preload script

public/                 # Static assets
scripts/                # Build scripts
docs/                   # Documentation
```

## 🔧 Technical Implementation Details

### **State Management Pattern**

The application uses Zustand for predictable state management:

- **Single Store**: All whiteboard state in one store
- **Action-Based**: Clear action methods for all operations
- **Immutable Updates**: Proper state immutability
- **Computed Values**: Derived state for UI updates

### **Performance Optimizations**

- **GPU Acceleration**: CSS transforms for smooth animations
- **Virtual Rendering**: Efficient component rendering with memoization
- **Batch Updates**: Grouped state updates to prevent render thrashing
- **Dynamic Grid**: Adaptive grid detail based on zoom level
- **Request Animation Frame**: Smooth 60+ FPS interactions

### **Coordinate System**

The app uses a sophisticated coordinate transformation system:

- **Screen Coordinates**: Mouse/touch positions in viewport
- **Whiteboard Coordinates**: Infinite canvas coordinate space
- **Transform Matrix**: D3.js transform for zoom/pan operations
- **Utility Functions**: `screenToWhiteboard()`, `centerComponentAtMouse()`

### **Interaction Model**

- **Event Delegation**: Efficient event handling through SVG overlay
- **Hook Composition**: Modular interaction behaviors
- **State Synchronization**: Coordinated updates across hooks
- **Gesture Recognition**: Touch and mouse gesture support

## 🎨 Design System

### **Grid System**

- **Base Unit**: 24px grid for consistent spacing
- **Component Sizes**: Multiples of 24px (192px, 288px, 384px)
- **Responsive**: Adaptive grid size based on zoom level
- **Visual Feedback**: Grid overlay with opacity transitions

### **Color Palette**

- **Theme Support**: Light/dark mode compatibility
- **Brand Colors**: Primary blue accent (#3b82f6)
- **State Colors**: Selection (blue), marquee (light blue), error (red)
- **Semantic Colors**: Background, foreground, border, muted

### **Typography**

- **Font Stack**: System fonts for performance
- **Size Scale**: 12px, 14px, 16px, 18px, 24px
- **Weights**: Normal (400), Medium (500), Semibold (600)
- **Line Heights**: Optimized for readability

## 🧪 Testing Strategy

### **Test Coverage**

- **Unit Tests**: Component behavior and utilities
- **Integration Tests**: Multi-component interactions
- **Performance Tests**: Frame rate and memory usage
- **Accessibility Tests**: Keyboard navigation and screen readers

### **Test Structure**

```typescript
// Example test structure
describe("ComponentRenderer", () => {
  it("renders shape components correctly");
  it("handles selection state changes");
  it("manages component interactions");
});
```

## 🚀 Development Workflow

### **Getting Started**

```bash
npm install              # Install dependencies
npm run dev             # Start development server
npm run test            # Run test suite
npm run build           # Build for production
npm run electron:dev    # Run Electron app
```

### **Code Organization**

- **Feature-Based**: Components grouped by functionality
- **Separation of Concerns**: Hooks for logic, components for UI
- **Type Safety**: Comprehensive TypeScript coverage
- **Documentation**: JSDoc comments for public APIs

### **Performance Monitoring**

- **FPS Monitor**: Real-time frame rate tracking
- **Component Logger**: Structured logging for debugging
- **Performance Hooks**: GPU acceleration and optimization

## 📊 Key Metrics

### **Performance Targets**

- **Frame Rate**: 60+ FPS for smooth interactions
- **Memory Usage**: Efficient component lifecycle management
- **Bundle Size**: Optimized for fast loading
- **Interaction Latency**: <16ms response time

### **Feature Completeness**

- **Component Types**: 15+ different component types
- **Interaction Methods**: Mouse, keyboard, touch support
- **File Formats**: Images, URLs, clipboard content
- **Integration APIs**: YouTube, SoundCloud, Spotify, Weather

## 🔮 Future Enhancements

### **Planned Features**

- **Collaboration**: Real-time multi-user editing
- **Export Options**: PDF, PNG, SVG export
- **Templates**: Pre-built component layouts
- **Plugins**: Extensible component system

### **Technical Improvements**

- **WebGL Rendering**: Advanced graphics performance
- **Virtual Scrolling**: Large dataset handling
- **Offline Support**: PWA capabilities
- **Mobile Optimization**: Touch-first interactions

---

_This context document provides a comprehensive overview of the React Component Whiteboard project architecture, features, and implementation details. For specific implementation questions, refer to the individual component and hook documentation._
