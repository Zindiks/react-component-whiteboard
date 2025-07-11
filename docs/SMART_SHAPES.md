# Smart Shapes Implementation

## Overview

Smart Shapes are enhanced versions of basic shapes that include connection points, auto-connecting capabilities, grouping features, and intelligent behavior. They're designed for creating professional diagrams, flowcharts, network diagrams, and organizational charts.

## 🧠 Smart Shape Types

### 1. **Smart Rectangle** 🔲

Enhanced rectangle with connection points and container capabilities.

**Features:**

- **Connection Points**: 4 directional connection points (top, right, bottom, left)
- **Text Editing**: Double-click to add/edit text inside
- **Container Mode**: Can act as a container for other components
- **Visual Indicators**: Connection points show on hover/selection
- **Typography**: Full text formatting support

**Use Cases:**

- Process boxes in flowcharts
- Network device representations
- UI component mockups
- Data containers in diagrams

### 2. **Smart Ellipse** ⭕

Enhanced ellipse with specialized node types and connection points.

**Features:**

- **Node Types**: start, end, process, decision, default
- **Auto-styling**: Different colors based on node type
- **Connection Points**: 4 strategically placed connection points
- **Type Indicators**: Visual badges showing node type
- **Text Editing**: Centered text with full formatting

**Node Type Styles:**

- **Start**: Light green background, thick green border
- **End**: Light red background, thick red border
- **Process**: Light blue background, blue border
- **Decision**: Light yellow background, orange border
- **Default**: Standard gray styling

**Use Cases:**

- Flowchart start/end points
- Decision nodes in workflows
- Network topology nodes
- State machine representations

### 3. **Smart Arrow** 🔗

Intelligent arrow that can auto-connect between shapes.

**Features:**

- **Auto-connecting**: Click shapes to create connections
- **Curved Options**: Support for curved arrow paths
- **Connection Tracking**: Maintains connections between shapes
- **Labels**: Floating text labels on arrows
- **Multiple Styles**: Single, double arrows with various line styles

**Connection States:**

- **Disconnected**: Shows "Click shapes to connect" hint
- **Connected**: Shows "Connected" indicator
- **Hover Effects**: Visual feedback during connection

**Use Cases:**

- Flow direction indicators
- Process step connections
- Data flow representations
- Relationship mappings

### 4. **Group Frame** 📦

Container shape for organizing and grouping components.

**Features:**

- **Visual Grouping**: Dashed border frame around components
- **Named Groups**: Editable group names
- **Drop Zones**: Visual indicators for dropping components
- **Frame Types**: Different styling for different purposes
- **Header Management**: Collapsible headers with group info

**Use Cases:**

- Component organization
- Section dividers
- Process groupings
- UI layout frames

### 5. **Group Container** 🗂️

Advanced container with collapsible functionality.

**Features:**

- **Collapsible**: Expand/collapse to save space
- **Container Types**: frame, container, section, layer
- **Color Coding**: Different tints for different container types
- **State Management**: Maintains collapsed/expanded state
- **Nested Support**: Containers can contain other containers

**Container Types:**

- **Frame**: Blue tint - for UI frames and layouts
- **Container**: Green tint - for logical groupings
- **Section**: Purple tint - for document sections
- **Layer**: Orange tint - for layer organization

## 🔗 Connection System

### Connection Points

All smart shapes include strategically placed connection points:

```typescript
interface ConnectionPoint {
  id: string; // unique identifier
  x: number; // position percentage (0-100)
  y: number; // position percentage (0-100)
  type: "input" | "output" | "bidirectional";
}
```

### Connection Types

- **Input** (Green): Accepts incoming connections
- **Output** (Blue): Sends outgoing connections
- **Bidirectional** (Purple): Both input and output

### Visual Feedback

- Connection points appear on shape selection
- Hover effects with scaling animation
- Color coding by connection type
- Tooltips showing connection type

## 🎨 Styling & Theming

### Smart Rectangle

- Container mode: Semi-transparent background with dashed border
- Connection points: Colored dots with shadows
- Text area: Adaptive padding based on container mode

### Smart Ellipse

- Node type indicators: Color-coded backgrounds and borders
- Type badges: Floating labels above shapes
- Adaptive sizing: Connection points positioned for circular shapes

### Smart Arrow

- Connection status: Color-coded status indicators
- Curved paths: SVG path-based curves for organic flow
- Label positioning: Floating labels with shadows

### Group Containers

- Type-based styling: Color-coded tints and borders
- Collapsible UI: Expand/collapse buttons with animations
- Header styling: Themed headers with group information

## 📋 Usage Examples

### Creating a Simple Flowchart

1. Add Smart Ellipse (start type) for beginning
2. Add Smart Rectangles for process steps
3. Add Smart Ellipse (decision type) for decision points
4. Connect with Smart Arrows
5. Add Smart Ellipse (end type) for completion

### Building a Network Diagram

1. Add Smart Ellipses for network nodes
2. Use different node types for different device types
3. Connect with Smart Arrows for network links
4. Group related components with Group Containers
5. Add text labels for IP addresses and names

### Creating UI Mockups

1. Use Group Frames for page sections
2. Add Smart Rectangles for UI components
3. Use container mode for sections that hold other elements
4. Connect user flows with Smart Arrows
5. Organize in collapsible Group Containers

## 🔧 Technical Implementation

### Connection Point Management

- Automatic positioning based on shape geometry
- Hover/selection state management
- Click handling for connection creation
- Visual state updates with smooth transitions

### State Management

- Shape-specific properties (node types, container modes)
- Connection tracking between shapes
- Collapse/expand states for containers
- Text content and formatting persistence

### Performance Optimizations

- GPU-accelerated animations for connection points
- Efficient re-rendering with React optimization
- Smooth hover/selection transitions
- Batched state updates for connection changes

### Copy/Paste Integration

- Full preservation of smart shape properties
- Connection point configurations maintained
- Container contents and states preserved
- Group relationships maintained across copy/paste

## 🚀 Benefits

### Enhanced Productivity

- **Quick Diagramming**: Pre-configured connection points speed up diagram creation
- **Visual Feedback**: Clear visual cues for connections and relationships
- **Organization Tools**: Grouping and container features keep diagrams organized

### Professional Results

- **Consistent Styling**: Type-based styling ensures visual consistency
- **Clean Connections**: Proper connection points create neat, professional diagrams
- **Adaptive Layouts**: Containers and groups provide flexible organization

### Intelligent Behavior

- **Auto-connecting**: Smart arrows automatically snap to connection points
- **Context Awareness**: Shapes adapt behavior based on their role
- **State Management**: Collapsible containers and connection tracking

The Smart Shapes system transforms the whiteboard from a simple drawing tool into a powerful diagramming and design platform! 🎯
