import React, { useState, useCallback } from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";
import { shapeLogger } from "../../utils/componentLoggers";
import {
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface PdfShapeProps extends Omit<BaseShapeProps, "children"> {
  pdfSrc?: string;
  pdfName?: string;
  onPdfChange?: (pdfSrc: string, pdfName?: string) => void;
  borderRadius?: number;
  page?: number;
  zoom?: number;
}

export const PdfShape: React.FC<PdfShapeProps> = ({
  pdfSrc,
  pdfName,
  onPdfChange,
  borderRadius = 8,
  page = 1,
  zoom = 1,
  style,
  ...props
}) => {
  const [currentPage, setCurrentPage] = useState(page);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer.files);
      const pdfFile = files.find((file) => file.type === "application/pdf");

      if (pdfFile) {
        setIsLoading(true);
        setError(null);
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          onPdfChange?.(result, pdfFile.name);
          setIsLoading(false);
        };
        reader.onerror = () => {
          setError("Failed to load PDF file");
          setIsLoading(false);
        };
        reader.readAsDataURL(pdfFile);
      } else {
        setError("Please drop a PDF file");
      }
    },
    [onPdfChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDownload = useCallback(() => {
    if (pdfSrc && pdfName) {
      const link = document.createElement("a");
      link.href = pdfSrc;
      link.download = pdfName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [pdfSrc, pdfName]);

  const handleZoomIn = useCallback(() => {
    setCurrentZoom((prev) => Math.min(prev + 0.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setCurrentZoom((prev) => Math.max(prev - 0.2, 0.5));
  }, []);

  const handlePagePrevious = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handlePageNext = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  return (
    <BaseShape
      {...props}
      lockAspectRatio={false} // Don't lock aspect ratio for PDFs
      style={{
        ...style,
      }}
    >
      <div
        className="w-full h-full overflow-hidden relative bg-white dark:bg-gray-900"
        style={{
          borderRadius,
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {pdfSrc ? (
          <div className="w-full h-full relative">
            {/* PDF Controls */}
            <div className="absolute top-2 right-2 z-10 flex gap-1 bg-black/50 rounded-md p-1">
              <button
                onClick={handlePagePrevious}
                className="p-1 text-white hover:bg-white/20 rounded"
                title="Previous Page"
                disabled={currentPage <= 1}
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2 py-1 text-white text-xs self-center">
                {currentPage}
              </span>
              <button
                onClick={handlePageNext}
                className="p-1 text-white hover:bg-white/20 rounded"
                title="Next Page"
              >
                <ChevronRight size={14} />
              </button>
              <div className="w-px bg-white/20 mx-1"></div>
              <button
                onClick={handleZoomOut}
                className="p-1 text-white hover:bg-white/20 rounded"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1 text-white hover:bg-white/20 rounded"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                onClick={handleDownload}
                className="p-1 text-white hover:bg-white/20 rounded"
                title="Download PDF"
              >
                <Download size={14} />
              </button>
            </div>

            {/* PDF Viewer */}
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Loading PDF...
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-red-500">
                  <FileText size={32} className="mx-auto mb-2" />
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full overflow-auto">
                <iframe
                  src={`${pdfSrc}#page=${currentPage}&zoom=${Math.round(
                    currentZoom * 100
                  )}`}
                  className="w-full h-full border-none"
                  title={pdfName || "PDF Document"}
                  onError={() => {
                    shapeLogger.warn("PDF load error", { pdfSrc, pdfName });
                    setError("Failed to display PDF");
                  }}
                />
              </div>
            )}

            {/* PDF Info */}
            {pdfName && (
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded max-w-[calc(100%-4rem)] truncate">
                {pdfName}
              </div>
            )}
          </div>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
            style={{
              borderRadius,
            }}
          >
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-2 text-gray-400" />
              <div className="text-sm font-medium mb-1">Drop PDF here</div>
              <div className="text-xs text-gray-400">
                Supports PDF files up to 10MB
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseShape>
  );
};
