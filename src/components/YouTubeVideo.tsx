import React, { useState } from "react";
import { Video, Edit3, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ComponentHeader } from "./ComponentHeader";

interface YouTubeVideoProps {
  initialUrl?: string;
  width?: number;
  height?: number;
  onHeaderMouseDown?: (event: React.MouseEvent) => void;
}

export const YouTubeVideo: React.FC<YouTubeVideoProps> = ({
  initialUrl = "",
  width = 400,
  height = 300,
  onHeaderMouseDown,
}) => {
  const [url, setUrl] = useState<string>(initialUrl);
  const [isEditing, setIsEditing] = useState<boolean>(!initialUrl);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(url);

  const handleSaveUrl = () => {
    // If we have a valid video ID, exit editing mode
    if (getYouTubeVideoId(url)) {
      setIsEditing(false);
    } else {
      alert("Please enter a valid YouTube URL");
    }
  };

  const handleOpenInNewTab = () => {
    if (videoId) {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
    }
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col"
      style={{ width, height }}
    >
      <ComponentHeader
        title="YouTube Video"
        icon={Video}
        iconColor="bg-red-600"
        onMouseDown={onHeaderMouseDown}
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
            {videoId && !isEditing && (
              <button
                className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
                onClick={handleOpenInNewTab}
                title="Open in YouTube"
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
              Enter YouTube URL:
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-grow"
              />
              <Button onClick={handleSaveUrl} size="sm">
                Save
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Paste any YouTube video URL or video ID
            </div>
            {videoId && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-700 mb-1">
                  Preview:
                </p>
                <div className="border border-gray-200 rounded">
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                    alt="YouTube Video Preview"
                    className="w-full rounded"
                  />
                </div>
              </div>
            )}
          </div>
        ) : videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full border-0"
          ></iframe>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">
              No video set. Click the edit button to add a YouTube URL.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeVideo;
