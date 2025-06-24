# PDF Viewer Component

## Overview

The PDF Viewer component provides functionality similar to the Image component but specifically for PDF documents. It allows users to view, navigate, and interact with PDF files directly on the whiteboard.

## Features

### Core Functionality

- **Drag & Drop**: Drop PDF files directly onto the whiteboard or drag from the Shapes sidebar
- **PDF Display**: Uses iframe-based rendering for reliable PDF viewing
- **File Support**: Supports PDF files up to 10MB in size
- **Theme Awareness**: Adapts to light/dark mode with appropriate styling

### User Interface

- **Navigation Controls**: Previous/Next page buttons with page indicator
- **Zoom Controls**: Zoom in/out buttons for better document viewing
- **Download Button**: Direct download capability for the PDF file
- **File Info**: Displays PDF filename in the bottom-left corner
- **Loading States**: Shows loading spinner while PDF is being processed
- **Error Handling**: Displays appropriate error messages for failed loads

### Integration

- **Sidebar Integration**: Available in the "Shapes" category with 📄 icon
- **Whiteboard Integration**: Full resize, selection, and z-index support
- **Clipboard Support**: Can be copied/pasted like other shapes
- **Drag & Drop**: Supports both file drops and sidebar component drops

## Usage

### Adding PDF from Sidebar

1. Open the sidebar by clicking the shapes category (🔷)
2. Find the "PDF" component with 📄 icon
3. Drag it to the desired location on the whiteboard
4. Drop a PDF file onto the empty component

### Adding PDF via Drag & Drop

1. Drag a PDF file from your file system
2. Drop it directly onto the whiteboard
3. The PDF viewer component will be created automatically at the drop location

### Controls

- **Page Navigation**: Use ← → buttons to navigate between pages
- **Zoom**: Use + - buttons to zoom in/out (50% to 300%)
- **Download**: Click download button to save the PDF file
- **Resize**: Drag corner handles to resize the viewer
- **Move**: Drag the component to reposition it

## Technical Details

### Component Structure

- **PdfShape**: Main component extending BaseShape
- **Props**: Similar to ImageShape but with PDF-specific properties
- **Data Storage**: PDF data stored as data URL in `imageSrc` field
- **Filename Storage**: PDF filename stored in `text` field

### File Handling

- **Supported Type**: `application/pdf`
- **Size Limit**: 10MB (configurable)
- **Storage**: Base64 data URL format
- **Error Recovery**: Graceful handling of load failures

### Default Dimensions

- **Width**: 400px
- **Height**: 500px
- **Minimum Width**: 300px
- **Minimum Height**: 400px

### Constants

All PDF-related constants are defined in `appConstants.ts`:

```typescript
// PDF viewer dimensions
PDF_WIDTH: 400,
PDF_HEIGHT: 500,
PDF_MIN_WIDTH: 300,
PDF_MIN_HEIGHT: 400,
```

## Implementation Files

### Core Component

- `src/components/shapes/PdfShape.tsx` - Main PDF viewer component

### Integration Files

- `src/constants/appConstants.ts` - PDF size constants
- `src/constants/componentCategories.ts` - Sidebar category definition
- `src/components/shapes/index.tsx` - Shape exports
- `src/components/DraggableWhiteboardComponent.tsx` - Component renderer
- `src/hooks/useComponentCreators.ts` - PDF creation logic
- `src/hooks/useDragAndDrop.ts` - Drag & drop handling
- `src/hooks/useWhiteboardState.ts` - State management
- `src/utils/clipboardOperations.ts` - Copy/paste support
- `src/components/Overview.tsx` - Overview color mapping

## Future Enhancements

### Potential Improvements

- **PDF.js Integration**: For better rendering control and performance
- **Text Search**: Search within PDF documents
- **Annotations**: Add notes and highlights to PDFs
- **Print Support**: Direct printing from the viewer
- **Thumbnail View**: Small thumbnail preview mode
- **Multi-page Preview**: Show multiple pages simultaneously
- **Bookmarks**: PDF bookmark navigation support

### Performance Optimizations

- **Lazy Loading**: Load pages on demand
- **Caching**: Cache rendered pages for faster navigation
- **Compression**: Optimize PDF data storage
- **Streaming**: Support for large PDF files via streaming

## Browser Compatibility

- **Chrome/Edge**: Full support with iframe rendering
- **Firefox**: Full support with iframe rendering
- **Safari**: Full support with iframe rendering
- **Mobile**: Basic support (may vary by device)

Note: PDF rendering relies on browser's native PDF support or installed PDF plugins.
