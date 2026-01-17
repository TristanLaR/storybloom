"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const MAX_CHARACTERS = 200;
const FONT_SIZES = [12, 14, 16, 18, 20, 24];

interface InlineTextEditorProps {
  value: string;
  textPosition: "top" | "middle" | "bottom";
  onChange: (value: string) => void;
  onPositionChange: (position: "top" | "middle" | "bottom") => void;
  onFontSizeChange?: (size: number) => void;
  fontSize?: number;
  onBlur?: () => void;
  disabled?: boolean;
}

export function InlineTextEditor({
  value,
  textPosition,
  onChange,
  onPositionChange,
  onFontSizeChange,
  fontSize = 14,
  onBlur,
  disabled = false,
}: InlineTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const characterCount = value.length;
  const isOverLimit = characterCount > MAX_CHARACTERS;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isEditing) {
          setIsEditing(false);
          setShowControls(false);
          onBlur?.();
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, onBlur]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      setShowControls(false);
      onBlur?.();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute left-0 right-0 p-4 text-center transition-all",
        textPosition === "top" && "top-0",
        textPosition === "middle" && "top-1/2 -translate-y-1/2",
        textPosition === "bottom" && "bottom-0"
      )}
      onMouseEnter={() => !disabled && setShowControls(true)}
      onMouseLeave={() => !isEditing && setShowControls(false)}
    >
      {/* Text Display / Editor */}
      <div
        className={cn(
          "bg-white/90 backdrop-blur-sm rounded-lg p-3 max-w-xs mx-auto relative group",
          !disabled && "cursor-text hover:ring-2 hover:ring-primary-300",
          isEditing && "ring-2 ring-primary-500"
        )}
        onClick={() => !disabled && setIsEditing(true)}
      >
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                "w-full bg-transparent text-gray-800 resize-none focus:outline-none text-center",
                isOverLimit && "text-red-500"
              )}
              style={{ fontSize: `${fontSize}px` }}
              rows={Math.max(3, value.split("\n").length)}
              placeholder="Enter page text..."
            />

            {/* Character Count */}
            <div
              className={cn(
                "text-xs text-right",
                isOverLimit ? "text-red-500" : "text-gray-400"
              )}
            >
              {characterCount}/{MAX_CHARACTERS} characters • {wordCount} words
            </div>
          </div>
        ) : (
          <p
            className="text-gray-800 whitespace-pre-line"
            style={{ fontSize: `${fontSize}px` }}
          >
            {value || (
              <span className="text-gray-400 italic">Click to add text...</span>
            )}
          </p>
        )}

        {/* Edit indicator */}
        {showControls && !isEditing && !disabled && (
          <div className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
            Edit
          </div>
        )}
      </div>

      {/* Controls */}
      {(showControls || isEditing) && !disabled && (
        <div className="mt-2 flex items-center justify-center gap-2 animate-in fade-in duration-200">
          {/* Text Position */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1 flex gap-1 shadow-sm">
            {(["top", "middle", "bottom"] as const).map((pos) => (
              <button
                key={pos}
                onClick={(e) => {
                  e.stopPropagation();
                  onPositionChange(pos);
                }}
                className={cn(
                  "p-1.5 rounded text-xs font-medium transition-colors",
                  textPosition === pos
                    ? "bg-primary-500 text-white"
                    : "hover:bg-gray-100 text-gray-600"
                )}
                title={`Position: ${pos}`}
              >
                {pos === "top" && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
                {pos === "middle" && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />
                  </svg>
                )}
                {pos === "bottom" && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Font Size */}
          {onFontSizeChange && (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1 flex gap-1 shadow-sm">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = FONT_SIZES.indexOf(fontSize);
                  if (currentIndex > 0) {
                    onFontSizeChange(FONT_SIZES[currentIndex - 1]);
                  }
                }}
                disabled={fontSize <= FONT_SIZES[0]}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                title="Decrease font size"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="px-2 py-1 text-xs text-gray-600">{fontSize}px</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = FONT_SIZES.indexOf(fontSize);
                  if (currentIndex < FONT_SIZES.length - 1) {
                    onFontSizeChange(FONT_SIZES[currentIndex + 1]);
                  }
                }}
                disabled={fontSize >= FONT_SIZES[FONT_SIZES.length - 1]}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                title="Increase font size"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
