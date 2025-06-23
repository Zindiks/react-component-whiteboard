# Copy-Paste Feature Implementation

## Overview

Implemented copy-paste functionality for all shape components in the React whiteboard app, allowing users to:

1. **Copy selected shape components** using Ctrl+C (or Cmd+C on Mac)
2. **Paste shape components** at the current mouse pointer location using Ctrl+V (or Cmd+V on Mac)
3. **Paste image URLs from clipboard** directly onto the board as image components

## Features Implemented

### 1. Copy Functionality (Ctrl/Cmd+C)

- Copies all shape components (rectangle, ellipse, arrow, line, text, imageShape)
- Copies all selected shape components simultaneously
- Stores components in memory for pasting
- Shows console feedback with number of copied components

### 2. Paste Functionality (Ctrl/Cmd+V & Ctrl/Cmd+Shift+V)

- **Smart paste logic (Ctrl+V):**
  1. If shape components are copied, pastes them at mouse position
  2. If no copied components, tries clipboard image data (copied images)
  3. If no image data, tries clipboard HTML content for images
  4. If no HTML images, tries clipboard text for image URLs

- **Force image paste (Ctrl+Shift+V):**
  - Bypasses copied components completely
  - Goes directly to clipboard image detection
  - Perfect for pasting images when shapes are copied

- **Smart positioning:**
  - Converts screen coordinates to whiteboard coordinates
  - Accounts for current zoom level and pan offset
  - Positions components at mouse pointer location
  - Offsets multiple components slightly to avoid overlap

### 3. Enhanced Image Paste Support

- **Direct image pasting**: Copy images from websites and paste directly
- **HTML content parsing**: Extracts images from copied HTML snippets  
- **Advanced URL detection**: 
  - File extensions: .jpg, .jpeg, .png, .gif, .webp, .svg, .bmp, .ico, .tiff, .avif
  - Image keywords: "image", "img", "photo", "picture", "avatar", "thumbnail"
  - Popular hosts: imgur, unsplash, pexels, pixabay, flickr, googleusercontent, etc.
- **Data URL support**: Base64 encoded images and blob URLs
- **Natural image sizing**: Loads images to get natural dimensions
- **Smart scaling**: Scales down large images (max 400px dimension)
- **Aspect ratio preservation**: Maintains original proportions
- **CORS handling**: Graceful handling of external image restrictions

### 4. Mouse Position Tracking

- Real-time mouse position tracking for accurate paste positioning
- Updates mouse position during movement for precise placement
- Coordinates properly transformed for zoom/pan state

## Usage Instructions

### To Copy Shape Components:

1. Select one or more shape components on the whiteboard (rectangles, ellipses, arrows, lines, text, images)
2. Press **Ctrl+C** (or **Cmd+C** on Mac)
3. Components are copied to memory (console shows confirmation)

### To Paste Shape Components:

1. Move mouse to desired location on the whiteboard
2. Press **Ctrl+V** (or **Cmd+V** on Mac)
3. Components appear at mouse location with new IDs
4. Pasted components are automatically selected

### To Paste Images from Websites:

1. **Right-click** on any image from a website → **"Copy Image"**
2. Move mouse to desired location on the whiteboard
3. Press **Ctrl+V** (or **Cmd+V** on Mac) 
4. Image appears instantly at mouse location!

### To Paste Image URLs:

1. Copy an image URL to your clipboard (from browser, etc.)
2. Move mouse to desired location on the whiteboard
3. Press **Ctrl+V** (or **Cmd+V** on Mac)
4. Image loads and appears as a new image component at mouse location

### To Force Paste Images (When Shapes Are Copied):

1. Have some shapes copied with Ctrl+C
2. Copy an image from a website or copy an image URL
3. Press **Ctrl+Shift+V** (or **Cmd+Shift+V** on Mac)
4. Image pastes instead of the copied shapes!

## Technical Implementation

### Key Functions:

- `handleCopyComponents()`: Filters and copies selected shape components
- `handlePasteComponents()`: Smart paste with priority logic
- `handlePasteImageFromClipboard()`: Force paste images from clipboard
- `extractImageFromHtml()`: Extracts images from HTML content
- `handlePasteComponents()`: Handles both clipboard URLs and copied components
- `isImageUrl()`: Validates if clipboard text is an image URL
- `createImageComponentAtMouse()`: Creates image component at mouse position

### Supported Shape Types:

- **Rectangle**: Rectangular shapes
- **Ellipse**: Circular and oval shapes  
- **Arrow**: Arrow connectors
- **Line**: Straight lines
- **Text**: Text components
- **Image**: Image components

### Features:

- Proper coordinate transformation (screen → whiteboard coordinates)
- Zoom/pan awareness for accurate positioning
- Natural image sizing with aspect ratio preservation
- Error handling for failed image loads
- Unique ID generation for new components
- Z-index management (new components appear on top)

## Testing

### Test Cases:

1. **Copy/Paste Shape Components:**
   - Create various shape components (rectangle, ellipse, arrow, line, text, image)
   - Select single or multiple shapes and copy with Ctrl+C
   - Move mouse and paste with Ctrl+V
   - Verify all shape types are properly duplicated

2. **Mixed Shape Selection:**
   - Select multiple different shape types simultaneously
   - Copy and paste to verify all are duplicated correctly
   - Test with different combinations of shapes

3. **Paste Image URLs:**
   - Copy an image URL from a website
   - Ensure no shapes are copied first
   - Paste with Ctrl+V on the whiteboard
   - Test with various image formats

4. **Priority Logic:**
   - Copy some shapes, then copy an image URL to clipboard
   - Verify that Ctrl+V pastes the copied shapes (not the URL)
   - Clear copied shapes and verify URL pasting works

5. **Coordinate Accuracy:**
   - Test at different zoom levels
   - Test with panned viewport
   - Verify components appear exactly at mouse position

## Browser Compatibility

- **Clipboard API**: Requires HTTPS or localhost
- **CORS**: External images may have loading restrictions
- **Keyboard Shortcuts**: Works in modern browsers with focus on whiteboard

## Future Enhancements

- Support for copying/pasting widget components (non-shape components)
- Visual feedback during copy/paste operations
- Clipboard data validation and security improvements
- Support for pasting image files from clipboard (browser permitting)
- Keyboard shortcuts for other operations (cut, duplicate, etc.)
