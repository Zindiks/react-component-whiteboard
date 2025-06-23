import React, { useState, useEffect } from "react";
import { ExternalLink, Globe, Copy } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";

interface StylishLinkProps {
  initialUrl?: string;
  initialTitle?: string;
  width?: number;
  height?: number;
}

export const StylishLink: React.FC<StylishLinkProps> = ({
  initialUrl = "",
  initialTitle = "",
  width = 400,
  height = 180,
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
    <Card
      className="border-gray-200 overflow-hidden flex flex-col"
      style={{ width, height }}
    >
      {/* Content */}
      <CardContent className="flex-grow relative p-0">
        {isEditing ? (
          <div className="p-4 h-full flex flex-col">
            <div className="mb-3">
              <Label htmlFor="link-title" className="text-xs mb-1">
                Link Title:
              </Label>
              <Input
                id="link-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for this link..."
                className="text-sm"
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="link-url" className="text-xs mb-1">
                URL:
              </Label>
              <Input
                id="link-url"
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
                className="w-full bg-card rounded-lg border shadow-sm p-4 transition-all duration-300 hover:shadow-md cursor-pointer"
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
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground truncate max-w-[80%]">
                    {getDomainFromUrl(url)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUrl();
                    }}
                  >
                    {copied ? (
                      <span className="text-xs text-green-500">✓</span>
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
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
      </CardContent>
    </Card>
  );
};

export default StylishLink;
