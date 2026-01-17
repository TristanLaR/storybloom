"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DownloadStatus = "idle" | "generating" | "downloading" | "complete" | "error";

interface PdfDownloaderProps {
  bookId: string;
  bookTitle: string;
  interiorPdfUrl?: string | null;
  coverPdfUrl?: string | null;
  onGenerateInterior?: () => Promise<string | null>;
  onGenerateCover?: () => Promise<string | null>;
  disabled?: boolean;
}

export function PdfDownloader({
  bookId,
  bookTitle,
  interiorPdfUrl,
  coverPdfUrl,
  onGenerateInterior,
  onGenerateCover,
  disabled = false,
}: PdfDownloaderProps) {
  const [interiorStatus, setInteriorStatus] = useState<DownloadStatus>("idle");
  const [coverStatus, setCoverStatus] = useState<DownloadStatus>("idle");
  const [interiorProgress, setInteriorProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Sanitize book title for filename
  const sanitizeFilename = (title: string): string => {
    return title
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 50);
  };

  const downloadFile = async (
    url: string,
    filename: string,
    onProgress: (progress: number) => void
  ): Promise<void> => {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Download failed");
    }

    const contentLength = response.headers.get("content-length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;

    const reader = response.body?.getReader();
    const chunks: ArrayBuffer[] = [];

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Convert Uint8Array to ArrayBuffer
        const buffer = value.buffer.slice(
          value.byteOffset,
          value.byteOffset + value.byteLength
        );
        chunks.push(buffer);
        loaded += value.length;

        if (total > 0) {
          onProgress(Math.round((loaded / total) * 100));
        } else {
          // Indeterminate progress
          onProgress(Math.min(90, loaded / 1000000 * 100));
        }
      }
    }

    // Combine chunks into a single blob
    const blob = new Blob(chunks, { type: "application/pdf" });

    // Create download link
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    onProgress(100);
  };

  const handleDownloadInterior = useCallback(async () => {
    setError(null);
    setInteriorProgress(0);

    try {
      let url = interiorPdfUrl;

      // Generate if not available
      if (!url && onGenerateInterior) {
        setInteriorStatus("generating");
        url = await onGenerateInterior();
      }

      if (!url) {
        throw new Error("Could not generate PDF");
      }

      setInteriorStatus("downloading");
      const filename = `${sanitizeFilename(bookTitle)}_Interior.pdf`;
      await downloadFile(url, filename, setInteriorProgress);

      setInteriorStatus("complete");
      setTimeout(() => setInteriorStatus("idle"), 2000);
    } catch (err) {
      setError((err as Error).message);
      setInteriorStatus("error");
    }
  }, [interiorPdfUrl, onGenerateInterior, bookTitle]);

  const handleDownloadCover = useCallback(async () => {
    setError(null);
    setCoverProgress(0);

    try {
      let url = coverPdfUrl;

      // Generate if not available
      if (!url && onGenerateCover) {
        setCoverStatus("generating");
        url = await onGenerateCover();
      }

      if (!url) {
        throw new Error("Could not generate PDF");
      }

      setCoverStatus("downloading");
      const filename = `${sanitizeFilename(bookTitle)}_Cover.pdf`;
      await downloadFile(url, filename, setCoverProgress);

      setCoverStatus("complete");
      setTimeout(() => setCoverStatus("idle"), 2000);
    } catch (err) {
      setError((err as Error).message);
      setCoverStatus("error");
    }
  }, [coverPdfUrl, onGenerateCover, bookTitle]);

  const handleDownloadAll = useCallback(async () => {
    await handleDownloadInterior();
    await handleDownloadCover();
  }, [handleDownloadInterior, handleDownloadCover]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Download PDFs</h3>
      <p className="text-sm text-gray-500">
        Download your book files for printing or archival.
      </p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* Interior PDF Download */}
        <DownloadButton
          label="Interior PDF"
          description="All pages (24 pages, ~50MB)"
          status={interiorStatus}
          progress={interiorProgress}
          onClick={handleDownloadInterior}
          disabled={disabled}
          available={!!interiorPdfUrl}
        />

        {/* Cover PDF Download */}
        <DownloadButton
          label="Cover PDF"
          description="Front, spine, and back cover"
          status={coverStatus}
          progress={coverProgress}
          onClick={handleDownloadCover}
          disabled={disabled}
          available={!!coverPdfUrl}
        />

        {/* Download All */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleDownloadAll}
          disabled={
            disabled ||
            interiorStatus !== "idle" ||
            coverStatus !== "idle"
          }
        >
          Download All PDFs
        </Button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        PDFs are generated in print-ready format (300 DPI, CMYK-compatible)
      </p>
    </div>
  );
}

interface DownloadButtonProps {
  label: string;
  description: string;
  status: DownloadStatus;
  progress: number;
  onClick: () => void;
  disabled: boolean;
  available: boolean;
}

function DownloadButton({
  label,
  description,
  status,
  progress,
  onClick,
  disabled,
  available,
}: DownloadButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || status !== "idle"}
      className={cn(
        "w-full p-4 rounded-lg border-2 transition-all text-left",
        status === "idle" && "border-gray-200 hover:border-primary-300 hover:bg-primary-50",
        status === "generating" && "border-amber-300 bg-amber-50",
        status === "downloading" && "border-primary-300 bg-primary-50",
        status === "complete" && "border-green-300 bg-green-50",
        status === "error" && "border-red-300 bg-red-50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{label}</span>
            {available && status === "idle" && (
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                Ready
              </span>
            )}
            {!available && status === "idle" && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                Will generate
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{description}</p>
        </div>

        <div className="flex items-center gap-2">
          {status === "idle" && (
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          )}

          {status === "generating" && (
            <div className="flex items-center gap-2 text-amber-600">
              <svg
                className="w-5 h-5 animate-spin"
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
              <span className="text-sm">Generating...</span>
            </div>
          )}

          {status === "downloading" && (
            <div className="flex items-center gap-2 text-primary-600">
              <div className="w-16 h-2 bg-primary-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm">{progress}%</span>
            </div>
          )}

          {status === "complete" && (
            <svg
              className="w-5 h-5 text-green-500"
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
          )}

          {status === "error" && (
            <svg
              className="w-5 h-5 text-red-500"
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
          )}
        </div>
      </div>

      {/* Progress bar for downloading */}
      {status === "downloading" && (
        <div className="mt-3 w-full h-1 bg-primary-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </button>
  );
}
