export interface Component {
  id: number;
  x: number;
  y: number;
  type: string;
  width?: number;
  height?: number;
  zIndex?: number;
  imageSrc?: string; // For image components
  text?: string; // For text components
  youtubeUrl?: string; // For YouTube video components
  soundcloudUrl?: string; // For SoundCloud components
  spotifyUrl?: string; // For Spotify components
  // Text formatting options
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  textAlign?: "left" | "center" | "right";
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  // Shape formatting options
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
  // Line formatting options
  strokeStyle?: "solid" | "dashed" | "dotted";
  arrowStyle?: "none" | "arrow" | "double-arrow";
  arrowSize?: number;
  // Smart arrow connection properties
  startShapeId?: number;
  endShapeId?: number;
  startConnectionPoint?: string;
  endConnectionPoint?: string;
  // Arrow bend style properties
  bendStyle?: "straight" | "elbowed" | "curved";
  bendRadius?: number;
  elbowOffset?: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface InitialPosition {
  id: number;
  x: number;
  y: number;
}
