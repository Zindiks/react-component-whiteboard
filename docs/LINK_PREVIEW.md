# Link Preview Component

## Overview

The Link Preview component automatically generates rich previews for generic web URLs, featuring thumbnails, titles, descriptions, and metadata extraction. It provides a more engaging way to display links compared to simple text links.

## Features

### Automatic Metadata Extraction

- **Title**: Extracts page title from meta tags
- **Description**: Retrieves page description/summary
- **Thumbnail**: Captures preview image (OpenGraph image, etc.)
- **Favicon**: Shows site icon for brand recognition
- **Site Name**: Displays the website/publisher name

### User Interface

- **Thumbnail Preview**: Large preview image at the top
- **Rich Metadata**: Title, description, and site information
- **Interactive Actions**: Visit link, refresh preview, edit URL
- **Loading States**: Smooth loading animation while fetching data
- **Error Handling**: Graceful fallbacks for failed requests
- **Theme Support**: Adapts to light/dark mode

### Smart URL Detection

- **Generic URL Support**: Handles any valid HTTP/HTTPS URL
- **Conflict Avoidance**: Excludes URLs handled by specialized components
  - YouTube URLs → YouTubeVideo component
  - SoundCloud URLs → SoundCloudWidget component
  - Spotify URLs → SpotifyWidget component
  - Image URLs → ImageShape component
- **URL Validation**: Validates and formats URLs automatically

## Usage

### Adding via Sidebar

1. Open the sidebar and navigate to "Links & Web" category (🌐)
2. Find the "Link Preview" component with 🔗 icon
3. Drag it to the desired location on the whiteboard
4. Enter the URL you want to preview

### Adding via Copy-Paste

1. Copy any generic web URL to your clipboard
2. Paste with `Ctrl+V` (or `Cmd+V` on Mac) on the whiteboard
3. A LinkPreview component will be created automatically

### Supported URL Examples

- `https://example.com`
- `www.github.com/user/repo`
- `blog.website.com/article`
- `company.com/product-page`

### Excluded URLs (Handled by Other Components)

- YouTube: `youtube.com/watch?v=...`
- SoundCloud: `soundcloud.com/...`
- Spotify: `open.spotify.com/...`
- Images: `example.com/image.jpg`

## Technical Implementation

### Preview Data API

Currently uses a mock implementation that simulates metadata extraction. In production, you should integrate with a link preview service:

```typescript
// Recommended services:
// - https://microlink.io
// - https://linkpreview.net
// - https://opengraph.io
// - Custom backend proxy to avoid CORS

const response = await fetch(
  `https://api.microlink.io?url=${encodeURIComponent(url)}`
);
const data = await response.json();
```

### Data Storage

- **URL**: Stored in the `text` field of the component
- **Preview Image**: Stored in the `imageSrc` field
- **Metadata**: Passed via `onPreviewUpdate` callback

### Component Structure

```typescript
interface LinkPreviewData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
  url: string;
}
```

### Default Dimensions

- **Width**: 400px
- **Height**: 280px
- **Minimum Width**: 320px
- **Minimum Height**: 200px

## Integration Points

### Files Updated

- `src/components/widgets/LinkPreview.tsx` - Main component
- `src/constants/appConstants.ts` - Size constants
- `src/constants/componentCategories.ts` - Sidebar integration
- `src/utils/urlDetection.ts` - URL detection logic
- `src/utils/clipboardOperations.ts` - Clipboard support
- `src/hooks/useComponentCreators.ts` - Component creation
- `src/hooks/useWhiteboardState.ts` - State management
- `src/components/DraggableWhiteboardComponent.tsx` - Rendering
- `src/components/Overview.tsx` - Color mapping
- `src/App.tsx` - Creator integration

### URL Detection Logic

```typescript
export const isGenericUrl = (url: string): boolean => {
  // Validates URL format
  // Excludes specialized component URLs
  // Ensures proper domain structure
  return true; // if valid generic URL
};
```

## API Integration

### Current Mock Implementation

The component currently uses a mock API that generates placeholder data:

```typescript
const mockData: LinkPreviewData = {
  url: formattedUrl,
  title: `${domain} - Link Preview`,
  description: `Preview of content from ${domain}`,
  siteName: domain,
  image: `https://via.placeholder.com/400x200/3b82f6/ffffff?text=${domain}`,
  favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
};
```

### Production Integration

For production use, replace the mock with a real API service:

```typescript
// Example with Microlink.io
const response = await fetch(
  `https://api.microlink.io?url=${encodeURIComponent(formattedUrl)}`
);
const data = await response.json();

const previewData: LinkPreviewData = {
  url: formattedUrl,
  title: data.data?.title || domain,
  description: data.data?.description || "",
  siteName: data.data?.publisher || domain,
  image: data.data?.image?.url || "",
  favicon:
    data.data?.logo?.url ||
    `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
};
```

## Configuration Options

### Constants (appConstants.ts)

```typescript
// Link preview dimensions
LINK_PREVIEW_WIDTH: 400,
LINK_PREVIEW_HEIGHT: 280,
LINK_PREVIEW_MIN_WIDTH: 320,
LINK_PREVIEW_MIN_HEIGHT: 200,
```

### Component Props

```typescript
interface LinkPreviewProps {
  initialUrl?: string;
  initialPreviewData?: LinkPreviewData;
  width?: number;
  height?: number;
  onPreviewUpdate?: (previewData: LinkPreviewData) => void;
}
```

## Error Handling

### Graceful Degradation

- **Network Errors**: Shows retry button with error message
- **Invalid URLs**: Displays validation error in edit mode
- **Missing Images**: Falls back to placeholder or hides image
- **Missing Metadata**: Shows URL domain as fallback title

### Loading States

- **Fetching**: Animated spinner with "Fetching preview..." message
- **Success**: Rich preview with all available metadata
- **Error**: Error icon with retry option

## Browser Compatibility

### CORS Considerations

Web browsers block cross-origin requests to most websites, which means:

- **Direct API calls** from the browser will often fail
- **Backend proxy** is recommended for production use
- **CORS-enabled services** like Microlink.io work directly

### Supported Browsers

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support with some CORS limitations
- **Mobile**: Responsive design works on all devices

## Future Enhancements

### Potential Features

- **Caching**: Cache preview data to avoid re-fetching
- **Bulk Processing**: Preview multiple URLs in batch
- **Custom Templates**: Different preview layouts/styles
- **Social Media Integration**: Special handling for social media URLs
- **Analytics**: Track link preview interactions
- **Offline Support**: Show cached previews when offline

### Performance Optimizations

- **Lazy Loading**: Only fetch preview when component is visible
- **Debounced Requests**: Avoid excessive API calls during URL editing
- **Image Optimization**: Compress and resize preview images
- **Request Caching**: Implement browser/memory caching

## Troubleshooting

### Common Issues

1. **CORS Errors**: Use a backend proxy or CORS-enabled service
2. **Missing Previews**: Check if the URL has proper meta tags
3. **Slow Loading**: Consider implementing request timeouts
4. **Rate Limiting**: Implement proper API rate limiting and caching

### Debug Mode

Enable debug logging by checking the browser console for LinkPreview-related messages.

## Display Modes

The Link Preview component now supports three different display modes to accommodate various layout needs:

### 1. Compact Mode (200x60px)

- **Purpose**: Minimal space usage for link lists or tight layouts
- **Content**: Logo/favicon + title + site name in a single row
- **Actions**: Click anywhere to visit link
- **Best For**: Sidebar lists, navigation menus, space-constrained areas

### 2. Medium Mode (280x120px)

- **Purpose**: Balance between information and space efficiency
- **Content**: Small thumbnail on side + title + description (if space allows)
- **Actions**: Visit button + refresh button
- **Best For**: Content cards, moderate-sized containers

### 3. Full Mode (400x280px) - Default

- **Purpose**: Complete rich preview with maximum information
- **Content**: Large thumbnail header + full title + description + metadata
- **Actions**: Visit, refresh, and edit buttons
- **Best For**: Main content areas, detailed link showcases

### Usage in Sidebar

Three separate components are available in the "Links & Web" category:

- **Link Preview** → Full mode (400x280px)
- **Link Compact** → Compact mode (200x60px)
- **Link Medium** → Medium mode (280x120px)

### Display Mode Prop

```tsx
<LinkPreview
  initialUrl="https://example.com"
  displayMode="compact" // 'compact' | 'medium' | 'full'
  width={200}
  height={60}
/>
```

The component also auto-detects appropriate display mode based on container size when no explicit mode is provided.
