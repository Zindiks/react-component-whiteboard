import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";

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

  return (
    <Card
      className="border-gray-200 overflow-hidden flex flex-col cursor-move rounded-lg"
      style={{ width, height }}
      onMouseDown={onHeaderMouseDown} // Now the entire component is draggable
    >
      {/* Content - no header, starts from top */}
      <CardContent className="flex-grow relative p-0 rounded-lg overflow-hidden">
        {isEditing ? (
          <div className="p-4 h-full flex flex-col">
            <Label htmlFor="youtube-url" className="text-sm mb-2">
              Enter YouTube URL:
            </Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="youtube-url"
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
            <div className="text-xs text-muted-foreground mt-1">
              Paste any YouTube video URL or video ID
            </div>
            {videoId && (
              <div className="mt-4">
                <p className="text-xs font-medium mb-1">Preview:</p>
                <div className="border rounded">
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
            className="absolute top-0 left-0 w-full h-full border-0 rounded-lg"
          ></iframe>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
            <p className="text-muted-foreground text-center px-4">
              No video set. Select this component to add a YouTube URL.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default YouTubeVideo;
