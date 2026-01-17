"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CoverEditorProps {
  coverImageUrl: string | null;
  title: string;
  authorName: string;
  coverPrompt: string;
  regenerationCount: number;
  onTitleChange: (title: string) => void;
  onAuthorChange: (author: string) => void;
  onPromptChange: (prompt: string) => void;
  onRegenerate: (newPrompt?: string) => Promise<void>;
  onSave: () => void;
  disabled?: boolean;
}

type TitlePosition = "top" | "center" | "bottom";
type AuthorPosition = "below-title" | "bottom";

export function CoverEditor({
  coverImageUrl,
  title,
  authorName,
  coverPrompt,
  regenerationCount,
  onTitleChange,
  onAuthorChange,
  onPromptChange,
  onRegenerate,
  onSave,
  disabled = false,
}: CoverEditorProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [localPrompt, setLocalPrompt] = useState(coverPrompt);
  const [titlePosition, setTitlePosition] = useState<TitlePosition>("center");
  const [authorPosition, setAuthorPosition] = useState<AuthorPosition>("below-title");

  const hasPromptChanged = localPrompt !== coverPrompt;

  const handleRegenerate = useCallback(async () => {
    setIsRegenerating(true);
    try {
      if (hasPromptChanged) {
        onPromptChange(localPrompt);
        await onRegenerate(localPrompt);
      } else {
        await onRegenerate();
      }
    } finally {
      setIsRegenerating(false);
      setShowPromptEditor(false);
    }
  }, [hasPromptChanged, localPrompt, onPromptChange, onRegenerate]);

  return (
    <div className="space-y-6">
      {/* Cover Preview */}
      <div className="relative aspect-square max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt="Book cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-primary-400">
                <svg
                  className="w-16 h-16 mx-auto mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <p className="text-sm">Cover Preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Text Overlay */}
        <div
          className={cn(
            "absolute inset-x-0 flex flex-col items-center p-6",
            titlePosition === "top" && "top-0",
            titlePosition === "center" && "top-1/2 -translate-y-1/2",
            titlePosition === "bottom" && "bottom-0"
          )}
        >
          <div className="bg-black/50 backdrop-blur-sm rounded-xl px-6 py-4 max-w-[80%] text-center">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              {title || "Book Title"}
            </h2>
            {authorName && authorPosition === "below-title" && (
              <p className="text-white/90 mt-2 text-sm">by {authorName}</p>
            )}
          </div>
        </div>

        {authorName && authorPosition === "bottom" && titlePosition !== "bottom" && (
          <div className="absolute bottom-0 inset-x-0 p-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
              <p className="text-white/90 text-sm">by {authorName}</p>
            </div>
          </div>
        )}

        {/* Regeneration Loading Overlay */}
        {isRegenerating && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <div className="text-center text-white">
              <svg
                className="animate-spin h-10 w-10 mx-auto mb-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm">Generating new cover...</p>
            </div>
          </div>
        )}

        {/* Regeneration Count Badge */}
        {regenerationCount > 0 && (
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {regenerationCount} regeneration{regenerationCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Cover Settings */}
      <div className="bg-white rounded-xl border p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Cover Settings</h3>

        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Book Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={onSave}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter book title"
            disabled={disabled}
          />
        </div>

        {/* Author Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Author Name
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => onAuthorChange(e.target.value)}
            onBlur={onSave}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter author name"
            disabled={disabled}
          />
        </div>

        {/* Title Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title Position
          </label>
          <div className="flex gap-2">
            {(["top", "center", "bottom"] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => setTitlePosition(pos)}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                  titlePosition === pos
                    ? "bg-primary-100 text-primary-700 border-2 border-primary-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
                disabled={disabled}
              >
                {pos.charAt(0).toUpperCase() + pos.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Author Position (only if not at same position as title) */}
        {authorName && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author Position
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setAuthorPosition("below-title")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                  authorPosition === "below-title"
                    ? "bg-primary-100 text-primary-700 border-2 border-primary-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
                disabled={disabled}
              >
                Below Title
              </button>
              <button
                onClick={() => setAuthorPosition("bottom")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                  authorPosition === "bottom"
                    ? "bg-primary-100 text-primary-700 border-2 border-primary-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                  titlePosition === "bottom" && "opacity-50 cursor-not-allowed"
                )}
                disabled={disabled || titlePosition === "bottom"}
              >
                Bottom
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Regeneration Controls */}
      <div className="bg-white rounded-xl border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Cover Image</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPromptEditor(!showPromptEditor)}
            disabled={disabled || isRegenerating}
          >
            {showPromptEditor ? "Hide Prompt" : "Edit Prompt"}
          </Button>
        </div>

        {showPromptEditor && (
          <div className="space-y-3 animate-in slide-in-from-top-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Prompt
              </label>
              <textarea
                value={localPrompt}
                onChange={(e) => setLocalPrompt(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe what the cover should look like..."
                disabled={disabled || isRegenerating}
              />
              {hasPromptChanged && (
                <div className="flex items-center gap-2 text-xs mt-1">
                  <span className="text-amber-600">Prompt modified</span>
                  <button
                    onClick={() => setLocalPrompt(coverPrompt)}
                    className="text-gray-500 hover:text-gray-700 underline"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleRegenerate}
            disabled={disabled || isRegenerating}
            isLoading={isRegenerating}
            className="flex-1"
          >
            {isRegenerating
              ? "Generating..."
              : hasPromptChanged
              ? "Regenerate with New Prompt"
              : "Regenerate Cover"}
          </Button>
          {coverImageUrl && (
            <Button
              variant="ghost"
              onClick={() => {
                setLocalPrompt(coverPrompt);
                handleRegenerate();
              }}
              disabled={disabled || isRegenerating}
              title="Get a variation with the same prompt"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </Button>
          )}
        </div>

        <p className="text-xs text-center text-gray-400">
          Each regeneration uses additional credits
        </p>
      </div>
    </div>
  );
}
