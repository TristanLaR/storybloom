"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageRegeneratorProps {
  imageUrl: string | null;
  imagePrompt: string;
  regenerationCount: number;
  onRegenerate: (newPrompt?: string) => Promise<void>;
  onPromptChange: (prompt: string) => void;
  disabled?: boolean;
}

export function ImageRegenerator({
  imageUrl,
  imagePrompt,
  regenerationCount,
  onRegenerate,
  onPromptChange,
  disabled = false,
}: ImageRegeneratorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [localPrompt, setLocalPrompt] = useState(imagePrompt);
  const [mode, setMode] = useState<"variation" | "edit">("variation");

  const hasPromptChanged = localPrompt !== imagePrompt;

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      if (mode === "edit" && hasPromptChanged) {
        onPromptChange(localPrompt);
        await onRegenerate(localPrompt);
      } else {
        await onRegenerate();
      }
    } finally {
      setIsRegenerating(false);
      setIsExpanded(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Image Preview */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Page illustration"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Regeneration Loading Overlay */}
        {isRegenerating && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <svg
                className="animate-spin h-8 w-8 mx-auto mb-2"
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
              <p className="text-sm">Generating...</p>
            </div>
          </div>
        )}

        {/* Regeneration Count Badge */}
        {regenerationCount > 0 && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {regenerationCount} regeneration{regenerationCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={disabled || isRegenerating}
        >
          {isExpanded ? "Hide Options" : "Regenerate"}
        </Button>
        {imageUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMode("variation");
              handleRegenerate();
            }}
            disabled={disabled || isRegenerating}
            title="Get a new variation with the same prompt"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Expanded Options */}
      {isExpanded && (
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg animate-in slide-in-from-top-2">
          {/* Mode Selection */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode("variation")}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                mode === "variation"
                  ? "bg-primary-100 text-primary-700 border-2 border-primary-500"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              )}
            >
              Get Variation
            </button>
            <button
              onClick={() => setMode("edit")}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                mode === "edit"
                  ? "bg-primary-100 text-primary-700 border-2 border-primary-500"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              )}
            >
              Edit Prompt
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-500">
            {mode === "variation"
              ? "Generate a new image using the same prompt"
              : "Modify the prompt to create a different illustration"}
          </p>

          {/* Prompt Editor (only for edit mode) */}
          {mode === "edit" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Image Prompt
              </label>
              <textarea
                value={localPrompt}
                onChange={(e) => setLocalPrompt(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe what the illustration should show..."
              />
              {hasPromptChanged && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-amber-600">Prompt modified</span>
                  <button
                    onClick={() => setLocalPrompt(imagePrompt)}
                    className="text-gray-500 hover:text-gray-700 underline"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleRegenerate}
            disabled={disabled || isRegenerating}
            isLoading={isRegenerating}
            className="w-full"
          >
            {isRegenerating
              ? "Generating..."
              : mode === "variation"
              ? "Generate Variation"
              : "Regenerate with New Prompt"}
          </Button>

          {/* Cost Warning */}
          <p className="text-xs text-center text-gray-400">
            Each regeneration uses additional credits
          </p>
        </div>
      )}
    </div>
  );
}
