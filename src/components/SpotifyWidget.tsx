import React, { useState } from "react";
import { Music, Edit3, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ComponentHeader } from "./ComponentHeader";

interface SpotifyWidgetProps {
  initialUrl?: string;
  width?: number;
  height?: number;
  onHeaderMouseDown?: (event: React.MouseEvent) => void;
  onDelete?: (event: React.MouseEvent) => void;
}

export const SpotifyWidget: React.FC<SpotifyWidgetProps> = ({
  initialUrl = "",
  width = 400,
  height = 300,
  onHeaderMouseDown,
  onDelete,
}) => {
  const [url, setUrl] = useState<string>(initialUrl);
  const [isEditing, setIsEditing] = useState<boolean>(!initialUrl);

  // Extract Spotify ID and type from URL
  const getSpotifyEmbedUrl = (inputUrl: string): string | null => {
    // Regular expressions to match different Spotify URL formats
    const trackRegex =
      /(?:https?:\/\/)?(?:open\.)?spotify\.com\/track\/([a-zA-Z0-9]+)(?:[?].*)?$/;
    const albumRegex =
      /(?:https?:\/\/)?(?:open\.)?spotify\.com\/album\/([a-zA-Z0-9]+)(?:[?].*)?$/;
    const playlistRegex =
      /(?:https?:\/\/)?(?:open\.)?spotify\.com\/playlist\/([a-zA-Z0-9]+)(?:[?].*)?$/;
    const artistRegex =
      /(?:https?:\/\/)?(?:open\.)?spotify\.com\/artist\/([a-zA-Z0-9]+)(?:[?].*)?$/;
    const embedRegex =
      /(?:https?:\/\/)?(?:open\.)?spotify\.com\/embed\/([a-z]+)\/([a-zA-Z0-9]+)(?:[?].*)?$/;

    // Check if it's already an embed URL
    const embedMatch = inputUrl.match(embedRegex);
    if (embedMatch) {
      return `https://open.spotify.com/embed/${embedMatch[1]}/${embedMatch[2]}`;
    }

    // Check track URL
    const trackMatch = inputUrl.match(trackRegex);
    if (trackMatch) {
      return `https://open.spotify.com/embed/track/${trackMatch[1]}`;
    }

    // Check album URL
    const albumMatch = inputUrl.match(albumRegex);
    if (albumMatch) {
      return `https://open.spotify.com/embed/album/${albumMatch[1]}`;
    }

    // Check playlist URL
    const playlistMatch = inputUrl.match(playlistRegex);
    if (playlistMatch) {
      return `https://open.spotify.com/embed/playlist/${playlistMatch[1]}`;
    }

    // Check artist URL
    const artistMatch = inputUrl.match(artistRegex);
    if (artistMatch) {
      return `https://open.spotify.com/embed/artist/${artistMatch[1]}`;
    }

    // If it's a Spotify URI (spotify:track:ID format)
    if (inputUrl.startsWith("spotify:")) {
      const parts = inputUrl.split(":");
      if (parts.length === 3) {
        return `https://open.spotify.com/embed/${parts[1]}/${parts[2]}`;
      }
    }

    return null;
  };

  const embedUrl = getSpotifyEmbedUrl(url);

  const handleSaveUrl = () => {
    if (embedUrl) {
      setIsEditing(false);
    } else {
      alert("Please enter a valid Spotify URL");
    }
  };

  const handleOpenInNewTab = () => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col"
      style={{ width, height }}
    >
      <ComponentHeader
        title="Spotify"
        icon={Music}
        iconColor="bg-green-500"
        onMouseDown={onHeaderMouseDown}
        onDelete={onDelete}
        actions={
          <div className="flex items-center space-x-1">
            <button
              className={`p-1 rounded-full hover:bg-gray-200 text-gray-500 ${
                isEditing ? "bg-blue-100 text-blue-600" : ""
              }`}
              onClick={() => setIsEditing(!isEditing)}
              title={isEditing ? "Save" : "Edit URL"}
            >
              <Edit3 className="h-4 w-4" />
            </button>
            {url && !isEditing && (
              <button
                className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
                onClick={handleOpenInNewTab}
                title="Open in Spotify"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            )}
          </div>
        }
      />

      {/* Content */}
      <div className="flex-grow relative">
        {isEditing ? (
          <div className="p-4 h-full flex flex-col">
            <label className="text-sm text-gray-600 mb-2">
              Enter Spotify URL:
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="flex-grow"
              />
              <Button onClick={handleSaveUrl} size="sm">
                Save
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Paste a Spotify track, album, playlist, or artist URL
            </div>
            {embedUrl && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-700 mb-1">
                  Preview:
                </p>
                <div className="border border-gray-200 rounded h-20 overflow-hidden">
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowTransparency={true}
                    allow="encrypted-media"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            allowTransparency={true}
            allow="encrypted-media"
            className="absolute top-0 left-0 w-full h-full border-0"
          ></iframe>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">
              No track set. Click the edit button to add a Spotify URL.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifyWidget;
