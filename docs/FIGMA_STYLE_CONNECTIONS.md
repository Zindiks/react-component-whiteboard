# Figma/Miro-Style Smart Connections

## Overview

The whiteboard now supports Figma/Miro-style smart arrow connections between shapes. Arrows automatically calculate the best connection points and snap to shape edges dynamically.

## How to Use

### 1. Create Shapes and Arrows

1. From the sidebar, go to the "Smart Shapes" category
2. Add two `Smart Ellipse` shapes to the canvas
3. Add a `Smart Arrow` shape to the canvas

### 2. Connect Shapes

1. **Select the Smart Arrow**: Click on the arrow you want to use for connection
2. **Start Connection Mode**: Click the "Connect" button in the shape control header that appears above the selected arrow
3. **Connect Start Point**: Click on the first ellipse shape you want to connect
4. **Connect End Point**: Click on the second ellipse shape you want to connect
5. **Done**: The arrow will automatically position itself between the shapes and snap to the optimal connection points

### 3. Visual Feedback

- **Connection Mode Active**: When in connection mode, connectable shapes glow with a blue border
- **Connection Steps**: The header shows "Click start point..." then "Click end point..." to guide you
- **Connected State**: Connected arrows show a "Connected" indicator and render between the actual shape positions

### 4. Dynamic Updates

- **Move Shapes**: When you move connected shapes, the arrow automatically updates its position and endpoints
- **Optimal Positioning**: The arrow always connects to the closest points on each shape's edge
- **Smart Geometry**: For ellipses, connections snap to the ellipse perimeter; for rectangles, they snap to the rectangle edges

### 5. Disconnecting

1. Select a connected arrow
2. Click the "Disconnect" button in the shape control header
3. The arrow returns to its original static form

## Features

### Smart Connection Points

- **Automatic Calculation**: No need to manually specify connection points
- **Shape-Aware**: Different algorithms for rectangles vs ellipses
- **Edge Snapping**: Arrows connect exactly to shape boundaries

### Visual Enhancements

- **Connection Mode Indicators**: Blue glow on connectable shapes
- **Status Messages**: Clear feedback during the connection process
- **Dynamic Rendering**: Connected arrows render outside normal component bounds

### Figma/Miro-like Behavior

- **Click to Connect**: Simple click-based workflow
- **Automatic Layout**: Arrows position themselves optimally
- **Live Updates**: Connections update in real-time as shapes move

## Technical Implementation

### SmartArrowShape Features

- **Dynamic Positioning**: Connected arrows calculate their own bounding box and position
- **Geometric Calculations**: Uses mathematical formulas to find optimal connection points
- **Live Updates**: Automatically redraws when connected shapes move

### Connection Workflow

1. **Connection Mode**: Global state tracks when connection is active
2. **Shape Selection**: Click handler routes to connection logic when in connection mode
3. **Automatic Positioning**: Arrow calculates best connection points based on shape geometry
4. **Real-time Updates**: Arrow position updates whenever connected shapes move

### Performance Optimizations

- **Efficient Calculations**: Connection point math is optimized for real-time updates
- **Minimal Re-renders**: Only connected arrows re-render when shapes move
- **Smart Caching**: Connection calculations are cached when possible

## Best Practices

1. **Clear Workflow**: Always use the "Connect" button to start connection mode
2. **Visual Feedback**: Look for the blue glow to confirm shapes are connectable
3. **Connection Order**: Connect start point first, then end point
4. **Shape Positioning**: Position shapes before connecting for optimal arrow placement

## Comparison to Other Tools

This implementation matches the behavior found in:

- **Figma**: Click-to-connect workflow with automatic positioning
- **Miro**: Dynamic arrow updates when shapes move
- **Lucidchart**: Smart connection point calculation
- **Draw.io**: Edge-snapping behavior

The system provides a professional diagramming experience similar to industry-standard tools.
