import { Clock, Cloud, Type, Video, Music, Link as LinkIcon, Share2 } from "lucide-react";
import { Timer } from "@/components/Timer";
import { Weather } from "@/components/Weather";
import { ScrollingText } from "@/components/ScrollingText";
import { YouTubeVideo } from "@/components/YouTubeVideo";
import { SoundCloudWidget } from "@/components/SoundCloudWidget";
import { SpotifyWidget } from "@/components/SpotifyWidget";
import { StylishLink } from "@/components/StylishLink";
import { FlowCanvas } from "@/components/FlowCanvas";
import { ComponentRegistry } from "@/store/whiteboard";

/**
 * Component Registry System
 *
 * This file contains the registry of all available components that can be
 * dragged from the sidebar onto the whiteboard. Each component is registered
 * with its type, display name, React component, default props, and icon.
 *
 * To add a new component to the sidebar:
 * 1. Import your React component
 * 2. Add an entry to the COMPONENT_REGISTRY object below
 * 3. The component will automatically appear in the sidebar
 */

export const COMPONENT_REGISTRY: ComponentRegistry = {
  timer: {
    name: "Timer",
    component: Timer,
    defaultProps: {
      initialTime: 0,
    },
    icon: <Clock className="w-5 h-5" />,
    category: "Utilities",
  },

  weather: {
    name: "Weather",
    component: Weather,
    defaultProps: {
      latitude: 40.7128,
      longitude: -74.006,
      location: "New York",
    },
    icon: <Cloud className="w-5 h-5" />,
    category: "Data",
  },

  scrollingText: {
    name: "Scrolling Text",
    component: ScrollingText,
    defaultProps: {
      initialText: "Welcome to the whiteboard! Edit this text...",
    },
    icon: <Type className="w-5 h-5" />,
    category: "Content",
  },

  youtubeVideo: {
    name: "YouTube Video",
    component: YouTubeVideo,
    defaultProps: {
      initialUrl: "",
    },
    icon: <Video className="w-5 h-5" />,
    category: "Media",
  },

  soundcloud: {
    name: "SoundCloud",
    component: SoundCloudWidget,
    defaultProps: {
      initialUrl: "",
    },
    icon: <Music className="w-5 h-5 text-orange-500" />,
    category: "Media",
  },

  spotify: {
    name: "Spotify",
    component: SpotifyWidget,
    defaultProps: {
      initialUrl: "",
    },
    icon: <Music className="w-5 h-5 text-green-500" />,
    category: "Media",
  },

  stylishlink: {
    name: "Stylish Link",
    component: StylishLink,
    defaultProps: {
      initialUrl: "",
      initialTitle: "Click to Visit",
    },
    icon: <LinkIcon className="w-5 h-5 text-indigo-500" />,
    category: "Content",
  },

  flowCanvas: {
    name: "Flow Connections",
    component: FlowCanvas as unknown as React.ComponentType<Record<string, unknown>>,
    defaultProps: {
      width: 600,
      height: 300
    },
    icon: <Share2 className="w-5 h-5 text-blue-500" />,
    category: "Utilities",
  },

  // Example of how to add a new component:
  // textNote: {
  //   name: 'Text Note',
  //   component: TextNote,
  //   defaultProps: {
  //     text: 'Enter your note here...',
  //     fontSize: 14,
  //   },
  //   icon: <FileText className="w-5 h-5" />,
  //   category: 'Content',
  // },
};

/**
 * Helper function to get all component types
 */
export const getComponentTypes = (): string[] => {
  return Object.keys(COMPONENT_REGISTRY);
};

/**
 * Helper function to get component by type
 */
export const getComponent = (type: string) => {
  return COMPONENT_REGISTRY[type];
};

/**
 * Helper function to get components by category
 */
export const getComponentsByCategory = (): Record<
  string,
  ComponentRegistry
> => {
  const categories: Record<string, ComponentRegistry> = {};

  Object.entries(COMPONENT_REGISTRY).forEach(([type, config]) => {
    const category = config.category || "Other";
    if (!categories[category]) {
      categories[category] = {};
    }
    categories[category][type] = config;
  });

  return categories;
};

export default COMPONENT_REGISTRY;
