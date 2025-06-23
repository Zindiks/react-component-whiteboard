# Copy-Paste Feature Implementation

## Overview

Implemented copy-paste functionality for image components in the React whiteboard app, allowing users to:

1. **Copy selected image components** using Ctrl+C (or Cmd+C on Mac)
2. **Paste image components** at the current mouse pointer location using Ctrl+V (or Cmd+V on Mac)
3. **Paste image URLs from clipboard** directly onto the board as image components

## Features Implemented

### 1. Copy Functionality (Ctrl/Cmd+C)

- Only copies image components (type: "imageShape")
- Copies all selected image components
- Stores components in memory for pasting
- Shows console feedback with number of copied components

### 2. Paste Functionality (Ctrl/Cmd+V)

- **Two-step paste process:**

  1. First tries to read clipboard for image URLs and creates image components
  2. If no image URL found, pastes previously copied image components

- **Smart positioning:**
  - Converts screen coordinates to whiteboard coordinates
  - Accounts for current zoom level and pan offset
  - Centers image components on mouse position
  - Offsets multiple components slightly to avoid overlap

### 3. Image URL Paste Support

- Automatically detects image URLs in clipboard text
- Supports various image formats: .jpg, .jpeg, .png, .gif, .webp, .svg, .bmp
- Detects URLs containing "image" keyword
- Loads images to get natural dimensions
- Scales down large images (max 400px dimension)
- Maintains aspect ratio
- Handles CORS and loading errors gracefully

### 4. Mouse Position Tracking

- Real-time mouse position tracking for accurate paste positioning
- Updates mouse position during movement for precise placement
- Coordinates properly transformed for zoom/pan state

## Usage Instructions

### To Copy Image Components:

1. Select one or more image components on the whiteboard
2. Press **Ctrl+C** (or **Cmd+C** on Mac)
3. Components are copied to memory (console shows confirmation)

### To Paste Image Components:

1. Move mouse to desired location on the whiteboard
2. Press **Ctrl+V** (or **Cmd+V** on Mac)
3. Components appear at mouse location with new IDs
4. Pasted components are automatically selected

### To Paste Image URLs:

1. Copy an image URL to your clipboard (from browser, etc.)
2. Move mouse to desired location on the whiteboard
3. Press **Ctrl+V** (or **Cmd+V** on Mac)
4. Image loads and appears as a new image component at mouse location

## Technical Implementation

### Key Functions:

- `handleCopyComponents()`: Filters and copies selected image components
- `handlePasteComponents()`: Handles both clipboard URLs and copied components
- `isImageUrl()`: Validates if clipboard text is an image URL
- `createImageComponentAtMouse()`: Creates image component at mouse position

### Features:

- Proper coordinate transformation (screen → whiteboard coordinates)
- Zoom/pan awareness for accurate positioning
- Natural image sizing with aspect ratio preservation
- Error handling for failed image loads
- Unique ID generation for new components
- Z-index management (new components appear on top)

## Testing

### Test Cases:

1. **Copy/Paste Image Components:**

   - Create image components by dragging from shapes category
   - Select and copy with Ctrl+C
   - Move mouse and paste with Ctrl+V

2. **Paste Image URLs:**

   - Copy an image URL from a website
   - Paste with Ctrl+V on the whiteboard
   - Test with various image formats

3. **Multiple Component Copy:**

   - Select multiple image components
   - Copy and paste to verify all are duplicated

4. **Coordinate Accuracy:**
   - Test at different zoom levels
   - Test with panned viewport
   - Verify components appear exactly at mouse position

## Browser Compatibility

- **Clipboard API**: Requires HTTPS or localhost
- **CORS**: External images may have loading restrictions
- **Keyboard Shortcuts**: Works in modern browsers with focus on whiteboard

## Future Enhancements

- Support for copying/pasting other component types
- Visual feedback during copy/paste operations
- Clipboard data validation and security improvements
- Support for pasting image files from clipboard (browser permitting)
