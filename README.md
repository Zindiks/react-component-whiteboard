# React Component Whiteboard

A powerful, interactive whiteboard application built with React, TypeScript, and modern web technologies. Create, manipulate, and organize various widgets and components on an infinite canvas with drag-and-drop functionality, zoom controls, and real-time interactions.

## 🚀 Features

### 🎨 Interactive Whiteboard

- **Infinite Canvas**: Unlimited workspace for your creativity
- **Zoom & Pan**: Smooth zoom controls (10% - 700%) with mouse wheel, trackpad, and touch gestures
- **Marquee Selection**: Select multiple components with drag selection
- **Component Layering**: Z-index management for proper component stacking

### 🧩 Rich Component Library

- **Shapes**: Rectangle, Circle, Line, Arrow, Text
- **Media**: Image support with drag-and-drop from files or URLs
- **Widgets**:
  - Timer and Digital Watch
  - Weather Widget
  - Bitcoin Chart with real-time data
  - Currency Converter
  - Text Notes with Markdown support
  - Confetti Button for celebrations
- **Integrations**:
  - YouTube Video Player
  - SoundCloud Audio Player
  - Spotify Widget
  - External Images with URL detection

### 🎯 Advanced Functionality

- **Drag & Drop**: Native support for files, images, and URLs
- **Copy & Paste**: Full clipboard support for components and images
- **Keyboard Shortcuts**: Efficient workflow with customizable hotkeys
- **Overview/Minimap**: Bird's eye view of your entire whiteboard
- **Auto URL Detection**: Automatically creates appropriate widgets from pasted URLs
- **Component Categories**: Organized widget library with search and filtering

### 🖥️ Cross-Platform Support

- **Web Application**: Runs in any modern browser
- **Electron Desktop App**: Native desktop experience for Windows, macOS, and Linux
- **Responsive Design**: Works on tablets and touch devices

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS, Lucide React
- **State Management**: Zustand
- **Graphics**: D3.js for advanced interactions and transformations
- **Styling**: Tailwind CSS with custom animations
- **Desktop**: Electron for cross-platform desktop apps
- **Charts**: Recharts for data visualization
- **Markdown**: React Markdown with GitHub Flavored Markdown

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd react-component-whiteboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Desktop Application

```bash
# Build and run Electron app
npm run electron:dev

# Build for distribution
npm run electron:dist
```

## 🎮 Usage

### Basic Operations

- **Pan**: Hold `Space` + click and drag, or use middle/right mouse button
- **Zoom**: `Ctrl/Cmd` + mouse wheel, or use zoom controls
- **Select**: Click on components, drag for marquee selection
- **Delete**: Select components and press `Delete` or `Backspace`

### Keyboard Shortcuts

- `1` - Reset zoom to 100%
- `Shift + 1` - Zoom to fit all components
- `2` - Zoom to selected components
- `3` or `O` - Toggle overview/minimap
- `Escape` - Deselect all or close overview
- `Ctrl/Cmd + C` - Copy selected components
- `Ctrl/Cmd + V` - Paste components
- `Ctrl/Cmd + Shift + V` - Force paste image from clipboard

### Adding Components

1. Click category icons in the footer to open the component sidebar
2. Drag components from the sidebar onto the whiteboard
3. Drop files, images, or URLs directly onto the canvas
4. Use copy/paste for quick duplication

### Component Management

- **Resize**: Drag the resize handles on selected components
- **Move**: Drag components to reposition them
- **Layer**: Components automatically manage z-index based on selection
- **Edit**: Double-click text components to edit content

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── widgets/         # Individual widget components
│   ├── shapes/          # Basic shape components
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
│   ├── useWhiteboardState.ts    # Main state management
│   ├── useZoomControls.ts       # Zoom/pan functionality
│   ├── useDragAndDrop.ts        # Drag & drop logic
│   ├── useComponentCreators.ts  # Component creation
│   └── useEventHandlers.ts      # Global event handling
├── store/               # Zustand state management
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── constants/           # Application constants
└── styles/              # Global styles
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root to configure the application:

```env
# Logging Configuration
VITE_LOG_LEVEL=DEBUG              # Log level: ERROR, WARN, INFO, DEBUG, TRACE
VITE_FORCE_CONSOLE_LOGS=true      # Force console output (overrides defaults)
VITE_ENABLE_REMOTE_LOGGING=false  # Enable remote logging service
VITE_LOG_ENDPOINT=https://your-logging-service.com/api/logs
```

### Logging System

The application uses a structured logging system that replaces all console statements. See `LOGGING.md` for detailed documentation.

- **Development**: DEBUG level logs with console output
- **Production**: ERROR level logs only, no console output by default
- **Component-specific loggers**: Pre-configured for different app modules

## 🔧 Development

### Code Architecture

The application follows a modular architecture with:

- **Custom Hooks**: Logic separation for maintainability
- **Component Composition**: Reusable UI components
- **State Management**: Zustand for predictable state updates
- **Type Safety**: Full TypeScript coverage

### Key Hooks

- `useWhiteboardState`: Manages component state and operations
- `useZoomControls`: Handles zoom/pan transformations
- `useDragAndDrop`: File and component drag & drop
- `useComponentCreators`: Component factory functions
- `useEventHandlers`: Global keyboard and mouse events

### Building

```bash
# Development build
npm run build

# Electron build
npm run build:electron

# Production build with Electron
npm run electron:pack
```

## 🎨 Customization

### Adding New Widgets

1. Create a new component in `src/components/widgets/`
2. Add the widget definition to `src/constants/componentCategories.ts`
3. Update the component renderer in `DraggableWhiteboardComponent.tsx`

### Styling

- Tailwind CSS for utility-first styling
- Custom CSS variables for theming
- Responsive design with mobile-first approach

## 🐛 Troubleshooting

### Common Issues

- **Components not dragging**: Check if the transform is properly applied
- **Zoom not working**: Ensure event handlers are properly bound
- **Images not loading**: Verify CORS settings for external images

### Performance Tips

- Use React DevTools Profiler for performance analysis
- Optimize re-renders with proper dependency arrays
- Consider virtualization for large numbers of components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- D3.js for powerful data visualization and interactions
- Radix UI for accessible component primitives
- Tailwind CSS for utility-first styling
- All the open-source contributors who made this possible

## 📸 Screenshots

_Note: Add screenshots showing the whiteboard in action, different widgets, and the overview mode_

---

Built with ❤️ using React, TypeScript, and modern web technologies.
