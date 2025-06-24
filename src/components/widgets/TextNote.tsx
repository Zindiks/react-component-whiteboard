import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Edit, Eye, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WIDGET_CONSTANTS } from "../../constants/appConstants";

interface TextNoteProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

export const TextNote: React.FC<TextNoteProps> = ({
  initialContent = "# Hello World\n\nThis is a **markdown** note. You can edit it!",
  onContentChange,
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
          const newWidth = Math.max(
            WIDGET_CONSTANTS.TEXT_NOTE_MIN_WIDTH,
            startWidth + deltaX
          );
          setCurrentWidth(newWidth);
        }
        if (direction === "se" || direction === "s") {
          const newHeight = Math.max(
            WIDGET_CONSTANTS.TEXT_NOTE_MIN_HEIGHT,
            startHeight + deltaY
          );
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
    <Card
      ref={noteRef}
      className="resize overflow-auto min-w-[300px] min-h-[200px] max-w-[600px] max-h-[400px]"
      style={{ width: currentWidth, height: currentHeight }}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText
              size={WIDGET_CONSTANTS.TEXT_NOTE_ICON_SIZE}
              className="text-green-600 dark:text-green-400"
            />
            <h3 className="font-semibold text-sm">Text Note</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            title={isEditing ? "Preview" : "Edit"}
          >
            {isEditing ? (
              <Eye className="w-4 h-4" />
            ) : (
              <Edit className="w-4 h-4" />
            )}
          </Button>
        </div>
        {/* Content */}
        <div
          className="relative"
          style={{
            height: currentHeight - WIDGET_CONSTANTS.TEXT_NOTE_HEADER_HEIGHT,
          }}
        >
          {isEditing ? (
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-full resize-none font-mono text-sm"
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
                    <h1 className="text-lg font-bold mb-2 text-foreground">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-bold mb-2 text-foreground">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-bold mb-1 text-foreground">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2 text-foreground leading-relaxed">
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
                    <li className="mb-1 text-foreground">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-border pl-3 italic text-muted-foreground my-2">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-foreground">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-muted p-2 rounded text-xs font-mono text-foreground overflow-auto">
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-muted p-2 rounded text-xs font-mono text-foreground overflow-auto mb-2">
                      {children}
                    </pre>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-foreground">{children}</em>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-primary hover:text-primary/80 underline"
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
          <div className="px-3 py-2 border-t bg-muted">
            <p className="text-xs text-muted-foreground">
              Ctrl+S to save • Esc to cancel • Supports GitHub Flavored Markdown
            </p>
          </div>
        )}

        {/* Resize Handles */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-muted-foreground/30 opacity-0 hover:opacity-100 transition-opacity"
          onMouseDown={(e) => handleResizeStart("se", e)}
          title="Resize"
        >
          <div className="absolute bottom-1 right-1 w-2 h-2">
            <div className="w-full h-px bg-foreground mb-px"></div>
            <div className="w-full h-px bg-foreground"></div>
          </div>
        </div>

        <div
          className="absolute bottom-0 right-2 left-2 h-2 cursor-s-resize opacity-0 hover:opacity-30 hover:bg-muted-foreground transition-all"
          onMouseDown={(e) => handleResizeStart("s", e)}
          title="Resize height"
        ></div>

        <div
          className="absolute top-2 bottom-2 right-0 w-2 cursor-e-resize opacity-0 hover:opacity-30 hover:bg-muted-foreground transition-all"
          onMouseDown={(e) => handleResizeStart("e", e)}
          title="Resize width"
        ></div>
      </CardContent>
    </Card>
  );
};
