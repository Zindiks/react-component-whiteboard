import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  Edit3,
  Link as LinkIcon,
  Globe,
  Copy,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ComponentHeader } from "./ComponentHeader";

interface StylishLinkProps {
  initialUrl?: string;
  initialTitle?: string;
  width?: number;
  height?: number;
  onHeaderMouseDown?: (event: React.MouseEvent) => void;
  onDelete?: (event: React.MouseEvent) => void;
}

export const StylishLink: React.FC<StylishLinkProps> = ({
  initialUrl = "",
  initialTitle = "",
  width = 400,
  height = 180,
  onHeaderMouseDown,
  onDelete,
}) => {
  const [url, setUrl] = useState<string>(initialUrl);
  const [title, setTitle] = useState<string>(initialTitle || "Untitled Link");
  const [isEditing, setIsEditing] = useState<boolean>(!initialUrl);
  const [copied, setCopied] = useState<boolean>(false);
  const [favicon, setFavicon] = useState<string>("");
  const [urlColor, setUrlColor] = useState<string>("#3b82f6"); // Default blue
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Helper function to validate URL and add protocol if missing
  const formatUrl = (inputUrl: string): string => {
    if (!inputUrl) return "";
    if (!inputUrl.startsWith("http://") && !inputUrl.startsWith("https://")) {
      return `https://${inputUrl}`;
    }
    return inputUrl;
  };

  // Extract domain from URL
  const getDomainFromUrl = (inputUrl: string): string => {
    try {
      const url = new URL(formatUrl(inputUrl));
      return url.hostname;
    } catch {
      return "";
    }
  };

  // Set random color based on URL
  useEffect(() => {
    if (url) {
      // Generate a color based on the domain name
      const domain = getDomainFromUrl(url);
      if (domain) {
        // Simple hash function to generate a color from string
        let hash = 0;
        for (let i = 0; i < domain.length; i++) {
          hash = domain.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Convert to hex color - skew toward brighter colors
        const hue = Math.abs(hash) % 360;
        const saturation = 70 + (Math.abs(hash) % 20); // 70-90%
        const lightness = 45 + (Math.abs(hash) % 15); // 45-60%

        setUrlColor(`hsl(${hue}, ${saturation}%, ${lightness}%)`);

        // Try to get favicon
        setFavicon(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(formatUrl(url));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!url) {
      alert("Please enter a URL");
      return;
    }
    setIsEditing(false);
  };

  const handleVisitLink = () => {
    if (url) {
      window.open(formatUrl(url), "_blank");
    }
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col"
      style={{ width, height }}
    >
      <ComponentHeader
        title="Stylish Link"
        icon={LinkIcon}
        iconColor="bg-indigo-500"
        onMouseDown={onHeaderMouseDown}
        onDelete={onDelete}
        actions={
          <button
            className={`p-1 rounded-full hover:bg-gray-200 text-gray-500 ${
              isEditing ? "bg-blue-100 text-blue-600" : ""
            }`}
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? "Save" : "Edit link"}
          >
            <Edit3 className="h-4 w-4" />
          </button>
        }
      />

      {/* Content */}
      <div className="flex-grow relative">
        {isEditing ? (
          <div className="p-4 h-full flex flex-col">
            <div className="mb-3">
              <label className="text-xs text-gray-600 mb-1 block">
                Link Title:
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for this link..."
                className="text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-600 mb-1 block">URL:</label>
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="text-sm"
              />
            </div>

            <Button onClick={handleSave} className="w-full mt-auto">
              Save Link
            </Button>
          </div>
        ) : (
          <div
            className="p-4 h-full flex flex-col"
            style={{
              background: `linear-gradient(135deg, ${urlColor}10, ${urlColor}30)`,
              borderLeft: `4px solid ${urlColor}`,
            }}
          >
            <div className="flex-grow flex flex-col items-center justify-center">
              <div
                className="w-full bg-white rounded-lg border border-gray-100 shadow-sm p-4 transition-all duration-300 hover:shadow-md"
                style={{ transform: isHovered ? "translateY(-2px)" : "none" }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleVisitLink}
              >
                <div className="flex items-center mb-2">
                  {favicon && (
                    <img
                      src={favicon}
                      alt="Site icon"
                      className="w-5 h-5 mr-2"
                      onError={(e) => {
                        // If favicon fails to load, show default icon
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <Globe
                    className={`w-4 h-4 ${favicon ? "hidden" : "inline mr-2"}`}
                    style={{ color: urlColor }}
                  />
                  <span
                    className="text-sm font-medium flex-grow truncate"
                    style={{ color: urlColor }}
                  >
                    {title || "Visit Link"}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 truncate max-w-[80%]">
                    {getDomainFromUrl(url)}
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUrl();
                    }}
                    title="Copy link"
                  >
                    {copied ? (
                      <span className="text-xs text-green-500">Copied!</span>
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 text-center">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleVisitLink}
                style={{
                  borderColor: urlColor,
                  color: urlColor,
                }}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-2" />
                Visit {getDomainFromUrl(url)}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StylishLink;
