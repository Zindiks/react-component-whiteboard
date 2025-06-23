export interface ComponentDefinition {
  type: string;
  label: string;
  icon: string;
  description: string;
}

export interface Category {
  name: string;
  icon: string;
  components: ComponentDefinition[];
}

export const COMPONENT_CATEGORIES: Category[] = [
  {
    name: "Utilities",
    icon: "⚙️",
    components: [
      {
        type: "timer",
        label: "Timer",
        icon: "⏰",
        description: "Countdown timer",
      },
      {
        type: "watch",
        label: "Watch",
        icon: "⌚",
        description: "Digital clock",
      },
      {
        type: "note",
        label: "Note",
        icon: "📝",
        description: "Markdown text editor",
      },
      {
        type: "confetti",
        label: "Confetti",
        icon: "🎉",
        description: "Celebration button",
      },
    ],
  },
  {
    name: "Data & Finance",
    icon: "📊",
    components: [
      {
        type: "weather",
        label: "Weather",
        icon: "🌤️",
        description: "Weather widget",
      },
      {
        type: "bitcoin",
        label: "Crypto Chart",
        icon: "💰",
        description: "Cryptocurrency prices",
      },
      {
        type: "currency",
        label: "Currency",
        icon: "💱",
        description: "Currency converter",
      },
    ],
  },
  {
    name: "Media",
    icon: "🎵",
    components: [
      {
        type: "youtubeVideo",
        label: "YouTube",
        icon: "🎬",
        description: "YouTube video player",
      },
      {
        type: "soundcloud",
        label: "SoundCloud",
        icon: "🔊",
        description: "SoundCloud track",
      },
      {
        type: "spotify",
        label: "Spotify",
        icon: "🎵",
        description: "Spotify player",
      },
      {
        type: "scrollingtext",
        label: "Scrolling Text",
        icon: "📣",
        description: "Animated text banner",
      },
    ],
  },
  {
    name: "Links & Web",
    icon: "🌐",
    components: [
      {
        type: "stylishlink",
        label: "Stylish Link",
        icon: "🔗",
        description: "Styled web link",
      },
    ],
  },
  {
    name: "Shapes",
    icon: "🔷",
    components: [
      {
        type: "rectangle",
        label: "Rectangle",
        icon: "⬜",
        description: "Rectangle shape",
      },
      {
        type: "ellipse",
        label: "Ellipse",
        icon: "🔵",
        description: "Ellipse/Circle shape",
      },
      {
        type: "arrow",
        label: "Arrow",
        icon: "➡️",
        description: "Arrow line",
      },
      {
        type: "line",
        label: "Line",
        icon: "➖",
        description: "Straight line",
      },
      {
        type: "text",
        label: "Text",
        icon: "📝",
        description: "Text shape",
      },
      {
        type: "imageShape",
        label: "Image",
        icon: "🖼️",
        description: "Image shape",
      },
    ],
  },
];
