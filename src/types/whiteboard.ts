export type Component = {
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
};

export interface Point {
  x: number;
  y: number;
}

export type Position = {
  x: number;
  y: number;
};

export interface InitialPosition {
  id: number;
  x: number;
  y: number;
}
