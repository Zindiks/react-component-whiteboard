import React, { useState } from "react";
import { Edit3, ExternalLink, CloudRain } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ComponentHeader } from "./ComponentHeader";

interface SoundCloudWidgetProps {
  initialUrl?: string;
  width?: number;
  height?: number;
  onHeaderMouseDown?: (event: React.MouseEvent) => void;
  onDelete?: (event: React.MouseEvent) => void;
}

export const SoundCloudWidget: React.FC<SoundCloudWidgetProps> = ({
  initialUrl = "",
  width = 400,
  height = 300,
  onHeaderMouseDown,
  onDelete,
}) => {
  const [url, setUrl] = useState<string>(initialUrl);
  const [isEditing, setIsEditing] = useState<boolean>(!initialUrl);

  // Extract SoundCloud track or playlist ID from URL
  const getSoundCloudEmbedUrl = (inputUrl: string): string | null => {
    // Check if it's already an embed URL
    if (
      inputUrl.includes("api.soundcloud.com/tracks") ||
      inputUrl.includes("api.soundcloud.com/playlists")
    ) {
      return inputUrl;
    }

    // Check if it's a regular SoundCloud URL
    if (inputUrl.includes("soundcloud.com")) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(
        inputUrl
      )}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
    }

    // If it's just a track or playlist ID, assume it's a track
    if (/^\d+$/.test(inputUrl.trim())) {
      return `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${inputUrl.trim()}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
    }

    return null;
  };

  const embedUrl = getSoundCloudEmbedUrl(url);

  const handleSaveUrl = () => {
    if (embedUrl) {
      setIsEditing(false);
    } else {
      alert("Please enter a valid SoundCloud URL");
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
        title="SoundCloud"
        icon={CloudRain}
        iconColor="bg-orange-500"
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
                title="Open in SoundCloud"
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
              Enter SoundCloud URL:
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://soundcloud.com/artist/track"
                className="flex-grow"
              />
              <Button onClick={handleSaveUrl} size="sm">
                Save
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Paste a SoundCloud track or playlist URL
            </div>
            {embedUrl && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-700 mb-1">
                  Preview:
                </p>
                <div className="border border-gray-200 rounded h-20 overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    scrolling="no"
                    frameBorder="no"
                    src={embedUrl}
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        ) : embedUrl ? (
          <iframe
            width="100%"
            height="100%"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full border-0"
          ></iframe>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">
              No track set. Click the edit button to add a SoundCloud URL.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoundCloudWidget;
