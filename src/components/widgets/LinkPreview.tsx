import React, { useState, useEffect, useCallback } from "react";
import {
  ExternalLink,
  Globe,
  RefreshCw,
  Image,
  AlertCircle,
  LayoutGrid,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface LinkPreviewData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
  url: string;
}

type DisplayMode = "compact" | "medium" | "full";

interface LinkPreviewProps {
  initialUrl?: string;
  initialPreviewData?: LinkPreviewData;
  width?: number;
  height?: number;
  displayMode?: DisplayMode;
  onPreviewUpdate?: (previewData: LinkPreviewData) => void;
  onDisplayModeChange?: (mode: DisplayMode) => void;
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({
  initialUrl = "",
  initialPreviewData,
  width = 400,
  height = 280,
  displayMode = "full",
  onPreviewUpdate,
  onDisplayModeChange,
}) => {
  const [url, setUrl] = useState<string>(initialUrl);
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(
    initialPreviewData || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(!initialUrl);
  const [currentDisplayMode, setCurrentDisplayMode] =
    useState<DisplayMode>(displayMode);

  // Sync internal display mode with external prop changes
  useEffect(() => {
    if (displayMode !== currentDisplayMode) {
      setCurrentDisplayMode(displayMode);
    }
  }, [displayMode, currentDisplayMode]);

  // Helper function to validate and format URL
  const formatUrl = useCallback((inputUrl: string): string => {
    if (!inputUrl) return "";
    if (!inputUrl.startsWith("http://") && !inputUrl.startsWith("https://")) {
      return `https://${inputUrl}`;
    }
    return inputUrl;
  }, []);

  // Extract domain from URL
  const getDomainFromUrl = useCallback(
    (inputUrl: string): string => {
      try {
        const urlObj = new URL(formatUrl(inputUrl));
        return urlObj.hostname;
      } catch {
        return "";
      }
    },
    [formatUrl]
  );

  // Fetch link preview data
  const fetchPreviewData = useCallback(
    async (targetUrl: string) => {
      if (!targetUrl) return;

      setIsLoading(true);
      setError(null);

      try {
        const formattedUrl = formatUrl(targetUrl);

        // For demo purposes, we'll use a mock API response
        // In a real implementation, you'd use a service like:
        // - linkpreview.net
        // - microlink.io
        // - opengraph.io
        // - your own backend proxy to avoid CORS issues

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock response based on domain - in real app, replace with actual API call
        const domain = getDomainFromUrl(targetUrl);
        const mockData: LinkPreviewData = {
          url: formattedUrl,
          title: `${
            domain.charAt(0).toUpperCase() + domain.slice(1)
          } - Link Preview`,
          description: `This is a preview of the content from ${domain}. In a real implementation, this would show actual metadata from the page.`,
          siteName: domain,
          image: `https://via.placeholder.com/400x200/3b82f6/ffffff?text=${encodeURIComponent(
            domain
          )}`,
          favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        };

        // TODO: Replace with actual API call like:
        /*
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(formattedUrl)}`);
      const data = await response.json();
      
      const mockData: LinkPreviewData = {
        url: formattedUrl,
        title: data.data?.title || domain,
        description: data.data?.description || '',
        siteName: data.data?.publisher || domain,
        image: data.data?.image?.url || '',
        favicon: data.data?.logo?.url || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      };
      */

        setPreviewData(mockData);
        if (onPreviewUpdate) {
          onPreviewUpdate(mockData);
        }
      } catch (err) {
        setError("Failed to fetch link preview");
        console.error("Link preview fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [formatUrl, getDomainFromUrl, onPreviewUpdate]
  );

  // Effect to fetch preview when URL changes - only fetch if we don't have preview data already
  useEffect(() => {
    if (url && !isEditing && !previewData) {
      fetchPreviewData(url);
    }
  }, [url, isEditing, previewData, fetchPreviewData]);

  const handleSave = () => {
    if (!url) {
      setError("Please enter a URL");
      return;
    }
    setPreviewData(null); // Clear existing data
    setIsEditing(false);
  };

  const handleRefresh = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (url) {
      setPreviewData(null); // Clear existing data to force refetch
      fetchPreviewData(url);
    }
  };

  const handleVisitLink = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (previewData?.url) {
      window.open(previewData.url, "_blank");
    }
  };

  const handleEdit = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setIsEditing(true);
    setError(null);
  };

  // Handle display mode changes
  const handleDisplayModeChange = (
    newMode: DisplayMode,
    event?: React.MouseEvent
  ) => {
    // Prevent event bubbling to avoid triggering parent handlers
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setCurrentDisplayMode(newMode);
    onDisplayModeChange?.(newMode);
  };

  // Helper function to determine display mode based on size if not explicitly set
  const getEffectiveDisplayMode = (): DisplayMode => {
    // Always use current display mode (which syncs with displayMode prop via useEffect)
    return currentDisplayMode;
  };

  const effectiveDisplayMode = getEffectiveDisplayMode();

  // Render compact layout (logo + text only)
  const renderCompactLayout = () => (
    <div className="h-full flex items-center p-3">
      <div className="flex items-center flex-grow min-w-0">
        {previewData?.favicon ? (
          <img
            src={previewData.favicon}
            alt="Site icon"
            className="w-4 h-4 mr-2 flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <Globe className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
        )}
        <div className="min-w-0 flex-grow">
          <div className="font-medium text-xs truncate text-gray-900 dark:text-gray-100">
            {previewData?.title || getDomainFromUrl(previewData?.url || "")}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {previewData?.siteName || getDomainFromUrl(previewData?.url || "")}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="ml-2 p-1 h-6 w-6"
          onClick={(e) => handleVisitLink(e)}
          title="Visit link"
        >
          <ExternalLink className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-1 p-1 h-6 w-6"
          onClick={(e) => handleDisplayModeChange("medium", e)}
          title="Expand view"
        >
          <Maximize2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );

  // Render medium layout (image on side + text)
  const renderMediumLayout = () => (
    <div className="h-full flex">
      {previewData?.image && (
        <div className="w-16 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          <img
            src={previewData.image}
            alt={previewData.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      <div className="flex-grow p-3 flex flex-col min-w-0">
        <div className="flex items-center mb-1">
          {previewData?.favicon && !previewData?.image && (
            <img
              src={previewData.favicon}
              alt="Site icon"
              className="w-3 h-3 mr-1 flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          {!previewData?.favicon && !previewData?.image && (
            <Globe className="w-3 h-3 mr-1 text-gray-500 flex-shrink-0" />
          )}
          <span className="text-xs text-gray-500 truncate">
            {previewData?.siteName || getDomainFromUrl(previewData?.url || "")}
          </span>
        </div>
        <h3 className="font-medium text-xs mb-1 line-clamp-2 text-gray-900 dark:text-gray-100 flex-grow">
          {previewData?.title}
        </h3>
        {previewData?.description && height > 120 && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
            {previewData.description}
          </p>
        )}
        <div className="flex gap-1 mt-auto">
          <Button
            variant="default"
            size="sm"
            className="flex-grow text-xs h-6"
            onClick={(e) => handleVisitLink(e)}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Visit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleRefresh(e)}
            title="Refresh"
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleDisplayModeChange("full", e)}
            title="Expand to full view"
            className="h-6 w-6 p-0"
          >
            <Maximize2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Render full layout (current layout)
  const renderFullLayout = () => (
    <div className="h-full flex flex-col">
      {/* Preview Image */}
      {previewData?.image && (
        <div className="h-32 bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <img
            src={previewData.image}
            alt={previewData.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-grow p-4 flex flex-col">
        {/* Site info */}
        <div className="flex items-center mb-2">
          {previewData?.favicon && (
            <img
              src={previewData.favicon}
              alt="Site icon"
              className="w-4 h-4 mr-2"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <Globe
            className={`w-4 h-4 mr-2 text-gray-500 ${
              previewData?.favicon ? "hidden" : "inline"
            }`}
          />
          <span className="text-xs text-gray-500 truncate">
            {previewData?.siteName || getDomainFromUrl(previewData?.url || "")}
          </span>
        </div>
        {/* Title */}
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-gray-900 dark:text-gray-100">
          {previewData?.title}
        </h3>
        {/* Description */}
        {previewData?.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 flex-grow">
            {previewData.description}
          </p>
        )}{" "}
        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <Button
            variant="default"
            size="sm"
            className="flex-grow"
            onClick={handleVisitLink}
          >
            <ExternalLink className="w-3 h-3 mr-2" />
            Visit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            title="Refresh preview"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            title="Edit URL"
          >
            Edit
          </Button>
        </div>
        {/* Display mode toggle - only show in full mode */}
        {effectiveDisplayMode === "full" && (
          <div className="flex justify-center gap-1 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant={currentDisplayMode === "compact" ? "default" : "outline"}
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={(e) => handleDisplayModeChange("compact", e)}
              title="Compact view"
            >
              <Minimize2 className="w-3 h-3 mr-1" />S
            </Button>
            <Button
              variant={currentDisplayMode === "medium" ? "default" : "outline"}
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={(e) => handleDisplayModeChange("medium", e)}
              title="Medium view"
            >
              <LayoutGrid className="w-3 h-3 mr-1" />M
            </Button>
            <Button
              variant={currentDisplayMode === "full" ? "default" : "outline"}
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={(e) => handleDisplayModeChange("full", e)}
              title="Full view"
            >
              <Maximize2 className="w-3 h-3 mr-1" />L
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card
      className="border-gray-200 overflow-hidden flex flex-col bg-white dark:bg-gray-900"
      style={{ width, height }}
    >
      <CardContent className="flex-grow relative p-0">
        {isEditing ? (
          <div className="p-4 h-full flex flex-col">
            <div className="mb-4">
              <Label htmlFor="preview-url" className="text-sm mb-2 block">
                Enter URL to preview:
              </Label>
              <Input
                id="preview-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSave();
                  }
                }}
              />
              {error && (
                <div className="flex items-center mt-2 text-red-500 text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </div>
              )}
            </div>
            <Button onClick={handleSave} className="w-full mt-auto">
              Generate Preview
            </Button>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {isLoading ? (
              <div className="flex-grow flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Fetching preview...
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="flex-grow flex items-center justify-center">
                <div className="text-center text-red-500 p-4">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm mb-3">{error}</div>
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : previewData ? (
              <>
                {effectiveDisplayMode === "compact" && renderCompactLayout()}
                {effectiveDisplayMode === "medium" && renderMediumLayout()}
                {effectiveDisplayMode === "full" && renderFullLayout()}
              </>
            ) : (
              <div className="flex-grow flex items-center justify-center">
                <div className="text-center text-gray-500 p-4">
                  <Image className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm">No preview available</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LinkPreview;
