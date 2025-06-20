import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Edit, Eye, FileText } from "lucide-react";
import { ComponentHeader } from "./ComponentHeader";

interface TextNoteProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onHeaderMouseDown?: (event: React.MouseEvent) => void;
}

export const TextNote: React.FC<TextNoteProps> = ({
  initialContent = "# Hello World\n\nThis is a **markdown** note. You can edit it!",
  onContentChange,
  onHeaderMouseDown,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [savedContent, setSavedContent] = useState(initialContent);
  const [currentWidth, setCurrentWidth] = useState(320);
  const [currentHeight, setCurrentHeight] = useState(240);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setSavedContent(content);
    setIsEditing(false);
    onContentChange?.(content);
  };

  const handleCancel = () => {
    setContent(savedContent);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save with Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
    // Cancel with Escape
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  const hasChanges = content !== savedContent;

  // Resize handlers
  const handleResizeStart = useCallback(
    (direction: "se" | "e" | "s", e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = currentWidth;
      const startHeight = currentHeight;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        if (direction === "se" || direction === "e") {
          const newWidth = Math.max(200, startWidth + deltaX);
          setCurrentWidth(newWidth);
        }
        if (direction === "se" || direction === "s") {
          const newHeight = Math.max(150, startHeight + deltaY);
          setCurrentHeight(newHeight);
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [currentWidth, currentHeight]
  );

  return (
    <div
      ref={noteRef}
      className="bg-white border border-gray-200 rounded-lg shadow-sm resize overflow-auto min-w-[300px] min-h-[200px] max-w-[600px] max-h-[400px]"
      style={{ width: currentWidth, height: currentHeight }}
    >
      <ComponentHeader
        title="Text Note"
        icon={FileText}
        iconColor="bg-green-500"
        onMouseDown={onHeaderMouseDown}
        actions={
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
            title={isEditing ? "Preview" : "Edit"}
          >
            {isEditing ? (
              <Eye className="w-4 h-4" />
            ) : (
              <Edit className="w-4 h-4" />
            )}
          </button>
        }
      />

      <div className="p-4">
        {/* Content */}
        <div className="relative" style={{ height: currentHeight - 60 }}>
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-full p-3 text-sm border-none resize-none focus:outline-none font-mono"
              placeholder="Start writing your markdown note..."
              style={{ minHeight: "100%" }}
            />
          ) : (
            <div
              className="w-full h-full p-3 overflow-auto prose prose-sm max-w-none"
              style={{ fontSize: "14px" }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom styling for markdown elements
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold mb-2 text-gray-900">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-bold mb-2 text-gray-800">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-bold mb-1 text-gray-800">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2 text-gray-700 leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-2 ml-4 list-disc">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-2 ml-4 list-decimal">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="mb-1 text-gray-700">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-600 my-2">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-gray-800">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-gray-100 p-2 rounded text-xs font-mono text-gray-800 overflow-auto">
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-gray-100 p-2 rounded text-xs font-mono text-gray-800 overflow-auto mb-2">
                      {children}
                    </pre>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-700">{children}</em>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-blue-600 hover:text-blue-800 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {savedContent}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">
              Ctrl+S to save • Esc to cancel • Supports GitHub Flavored Markdown
            </p>
          </div>
        )}

        {/* Resize Handles */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-300 opacity-0 hover:opacity-100 transition-opacity"
          onMouseDown={(e) => handleResizeStart("se", e)}
          title="Resize"
        >
          <div className="absolute bottom-1 right-1 w-2 h-2">
            <div className="w-full h-px bg-gray-600 mb-px"></div>
            <div className="w-full h-px bg-gray-600"></div>
          </div>
        </div>

        <div
          className="absolute bottom-0 right-2 left-2 h-2 cursor-s-resize opacity-0 hover:opacity-30 hover:bg-gray-400 transition-all"
          onMouseDown={(e) => handleResizeStart("s", e)}
          title="Resize height"
        ></div>

        <div
          className="absolute top-2 bottom-2 right-0 w-2 cursor-e-resize opacity-0 hover:opacity-30 hover:bg-gray-400 transition-all"
          onMouseDown={(e) => handleResizeStart("e", e)}
          title="Resize width"
        ></div>
      </div>
    </div>
  );
};
