"use client";

import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date | null;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
}

export function SaveStatusIndicator({
  status,
  lastSaved,
  error,
  onRetry,
  className,
}: SaveStatusIndicatorProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm transition-all",
        className
      )}
    >
      {status === "idle" && lastSaved && (
        <span className="text-gray-400">Last saved {formatTime(lastSaved)}</span>
      )}

      {status === "pending" && (
        <>
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-amber-600">Unsaved changes</span>
        </>
      )}

      {status === "saving" && (
        <>
          <svg
            className="w-4 h-4 animate-spin text-primary-500"
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
          <span className="text-primary-600">Saving...</span>
        </>
      )}

      {status === "saved" && (
        <>
          <svg
            className="w-4 h-4 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-green-600">Saved</span>
        </>
      )}

      {status === "error" && (
        <>
          <svg
            className="w-4 h-4 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-red-600">
            Failed to save
            {error?.message && (
              <span className="text-red-400 ml-1">({error.message})</span>
            )}
          </span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-red-600 hover:text-red-700 underline ml-1"
            >
              Retry
            </button>
          )}
        </>
      )}
    </div>
  );
}

// Compact version for tight spaces
interface SaveStatusBadgeProps {
  status: SaveStatus;
  className?: string;
}

export function SaveStatusBadge({ status, className }: SaveStatusBadgeProps) {
  if (status === "idle") return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all",
        status === "pending" && "bg-amber-100 text-amber-700",
        status === "saving" && "bg-primary-100 text-primary-700",
        status === "saved" && "bg-green-100 text-green-700",
        status === "error" && "bg-red-100 text-red-700",
        className
      )}
    >
      {status === "pending" && (
        <>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Unsaved</span>
        </>
      )}

      {status === "saving" && (
        <>
          <svg
            className="w-3 h-3 animate-spin"
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
          <span>Saving</span>
        </>
      )}

      {status === "saved" && (
        <>
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Saved</span>
        </>
      )}

      {status === "error" && (
        <>
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span>Error</span>
        </>
      )}
    </div>
  );
}
