# YouTube URL Auto-Component Feature

## Overview

The whiteboard now automatically creates YouTube, SoundCloud, and Spotify components when their URLs are pasted or dropped onto the canvas, eliminating the need to manually select widgets from the sidebar.

## Feature Details

### Supported URL Types

#### YouTube URLs

- Standard: `https://www.youtube.com/watch?v=VIDEO_ID`
- Short: `https://youtu.be/VIDEO_ID`
- Mobile: `https://m.youtube.com/watch?v=VIDEO_ID`
- Embed: `https://www.youtube.com/embed/VIDEO_ID`
- No-cookie: `https://youtube-nocookie.com/embed/VIDEO_ID`

#### SoundCloud URLs

- Standard: `https://soundcloud.com/artist/track`
- Mobile: `https://m.soundcloud.com/artist/track`
- Short: `https://on.soundcloud.com/...`

#### Spotify URLs

- Web: `https://open.spotify.com/track/TRACK_ID`
- Standard: `https://spotify.com/track/TRACK_ID`
- URI: `spotify:track:TRACK_ID`

### Component Specifications

| Platform   | Size      | Aspect Ratio | Notes                                      |
| ---------- | --------- | ------------ | ------------------------------------------ |
| YouTube    | 400×300px | 4:3          | Updated from 16:9 for better compatibility |
| SoundCloud | 400×200px | 2:1          | Optimized for audio player                 |
| Spotify    | 400×200px | 2:1          | Optimized for track/playlist display       |

### How It Works

1. **URL Detection**: When content is pasted or dropped, the system checks if it's a recognized media URL
2. **Priority Order**: YouTube → SoundCloud → Spotify → Image URLs
3. **Component Creation**: Automatically creates the appropriate component type
4. **Pre-configuration**: The URL is automatically set in the component
5. **Positioning**: Component is centered at mouse position or drop location

### User Experience

#### Before

1. Add YouTube widget from sidebar
2. Click edit button
3. Paste URL
4. Save

#### After

1. Paste YouTube URL directly → Done!

### Integration Points

#### Paste Functionality (`handlePasteComponents`)

- Enhanced to detect media URLs before checking for images
- Maintains backward compatibility with shape copy-paste
- Falls back to image detection if no media URL found

#### Drag & Drop (`handleDrop`)

- Extended to handle media URLs from external sources
- Works with URLs dragged from web pages
- Processes text/plain, text/uri-list, and text/html data types

#### Component System

- Added `youtubeUrl`, `soundcloudUrl`, `spotifyUrl` properties to Component interface
- Updated DraggableComponent to pass URL props to widgets
- Modified widget components to accept `initialUrl` prop

### Technical Implementation

#### URL Detection Functions

```typescript
isYouTubeUrl(url: string): boolean
isSoundCloudUrl(url: string): boolean
isSpotifyUrl(url: string): boolean
```

#### Component Creation Functions

```typescript
createYouTubeComponentAtMouse(youtubeUrl: string): void
createSoundCloudComponentAtMouse(soundcloudUrl: string): void
createSpotifyComponentAtMouse(spotifyUrl: string): void
```

### Testing

Use the provided `youtube-url-test.html` file to test various URL formats. The test page includes:

- Examples of all supported URL formats
- Click-to-copy functionality
- Step-by-step testing instructions
- Expected behavior documentation

### Configuration

#### Default Sizes

- YouTube: 400×300px (4:3 aspect ratio)
- SoundCloud: 400×200px
- Spotify: 400×200px

These can be adjusted in the respective `create*ComponentAtMouse` functions.

#### URL Pattern Matching

URL detection uses both URL parsing and string matching for robustness:

- Primary: URL object hostname checking
- Fallback: String pattern matching for malformed URLs

### Future Enhancements

1. **Custom Sizing**: Allow users to set default component sizes
2. **More Platforms**: Add support for Vimeo, Twitch, etc.
3. **Smart Positioning**: Avoid overlapping with existing components
4. **URL Validation**: Check if URLs are accessible before creating components
5. **Batch Processing**: Handle multiple URLs pasted at once

### Compatibility

- ✅ Works with all existing copy-paste functionality
- ✅ Maintains force image paste (Ctrl+Shift+V)
- ✅ Compatible with existing widget system
- ✅ No breaking changes to existing components
