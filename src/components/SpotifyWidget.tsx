import React, { useState } from "react";
import { Music, Edit3, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
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
    <Card
      className="border-gray-200 overflow-hidden flex flex-col"
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
            <Button
              variant={isEditing ? "default" : "ghost"}
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            {url && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleOpenInNewTab}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        }
      />

      {/* Content */}
      <CardContent className="flex-grow relative p-0">
        {isEditing ? (
          <div className="p-4 h-full flex flex-col">
            <Label htmlFor="spotify-url" className="text-sm mb-2">
              Enter Spotify URL:
            </Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="spotify-url"
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
            <div className="text-xs text-muted-foreground mt-1">
              Paste a Spotify track, album, playlist, or artist URL
            </div>
            {embedUrl && (
              <div className="mt-4">
                <p className="text-xs font-medium mb-1">Preview:</p>
                <div className="border rounded h-20 overflow-hidden">
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
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">
              No track set. Click the edit button to add a Spotify URL.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpotifyWidget;
