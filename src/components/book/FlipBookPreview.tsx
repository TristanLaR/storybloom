"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface BookPage {
  id: string;
  imageUrl: string | null;
  text: string;
  pageNumber: number;
}

interface FlipBookPreviewProps {
  pages: BookPage[];
  coverImageUrl?: string | null;
  title: string;
  authorName?: string;
  className?: string;
  initialPage?: number;
  onPageChange?: (pageNumber: number) => void;
}

type FlipState = "idle" | "flipping-forward" | "flipping-backward";

export function FlipBookPreview({
  pages,
  coverImageUrl,
  title,
  authorName,
  className,
  initialPage = 0,
  onPageChange,
}: FlipBookPreviewProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [flipState, setFlipState] = useState<FlipState>("idle");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Total pages including cover (index 0) and back cover (last)
  const totalDisplayPages = pages.length + 2; // cover + pages + back cover

  const goToPage = useCallback(
    (page: number) => {
      if (page < 0 || page >= totalDisplayPages || flipState !== "idle") return;

      const direction = page > currentPage ? "forward" : "backward";
      setFlipState(direction === "forward" ? "flipping-forward" : "flipping-backward");

      setTimeout(() => {
        setCurrentPage(page);
        setFlipState("idle");
        onPageChange?.(page);
      }, 300);
    },
    [currentPage, flipState, totalDisplayPages, onPageChange]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalDisplayPages - 1) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalDisplayPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextPage();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevPage();
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      } else if (e.key === "f" || e.key === "F") {
        setIsFullscreen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextPage, prevPage, isFullscreen]);

  // Touch navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;

      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX.current - touchEndX;
      const threshold = 50;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          nextPage();
        } else {
          prevPage();
        }
      }

      touchStartX.current = null;
    },
    [nextPage, prevPage]
  );

  // Click navigation (click left/right side of book)
  const handleBookClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const midpoint = rect.width / 2;

      if (clickX > midpoint) {
        nextPage();
      } else {
        prevPage();
      }
    },
    [nextPage, prevPage]
  );

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Get current page content
  const getPageContent = (pageIndex: number) => {
    if (pageIndex === 0) {
      // Front cover
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 p-8 text-center">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <>
              <svg
                className="w-20 h-20 text-primary-300 mb-6"
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
              <h2 className="text-2xl font-bold text-primary-800 mb-2">{title}</h2>
              {authorName && (
                <p className="text-primary-600">by {authorName}</p>
              )}
            </>
          )}
        </div>
      );
    }

    if (pageIndex === totalDisplayPages - 1) {
      // Back cover
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50 p-8 text-center">
          <p className="text-gray-500 mb-4">The End</p>
          <svg
            className="w-12 h-12 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
      );
    }

    // Interior page
    const page = pages[pageIndex - 1];
    return (
      <div className="w-full h-full flex flex-col">
        {/* Image */}
        <div className="flex-1 bg-gray-100 relative">
          {page.imageUrl ? (
            <img
              src={page.imageUrl}
              alt={`Page ${page.pageNumber}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Text */}
        <div className="p-4 bg-white">
          <p className="text-sm text-gray-700 leading-relaxed">{page.text}</p>
        </div>
      </div>
    );
  };

  const bookContent = (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col",
        isFullscreen
          ? "fixed inset-0 z-50 bg-black p-8"
          : "w-full max-w-lg mx-auto",
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between mb-4",
          isFullscreen ? "text-white" : "text-gray-700"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Page {currentPage + 1} of {totalDisplayPages}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isFullscreen
                ? "hover:bg-white/10 text-white"
                : "hover:bg-gray-100 text-gray-600"
            )}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Book */}
      <div
        className={cn(
          "relative flex-1 flex items-center justify-center",
          isFullscreen && "max-h-[calc(100vh-8rem)]"
        )}
      >
        {/* Navigation arrows */}
        <button
          onClick={prevPage}
          disabled={currentPage === 0 || flipState !== "idle"}
          className={cn(
            "absolute left-0 z-10 p-2 rounded-full transition-all",
            isFullscreen
              ? "bg-white/10 hover:bg-white/20 text-white disabled:opacity-30"
              : "bg-white shadow-md hover:shadow-lg text-gray-600 disabled:opacity-30",
            "disabled:cursor-not-allowed"
          )}
          aria-label="Previous page"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextPage}
          disabled={currentPage === totalDisplayPages - 1 || flipState !== "idle"}
          className={cn(
            "absolute right-0 z-10 p-2 rounded-full transition-all",
            isFullscreen
              ? "bg-white/10 hover:bg-white/20 text-white disabled:opacity-30"
              : "bg-white shadow-md hover:shadow-lg text-gray-600 disabled:opacity-30",
            "disabled:cursor-not-allowed"
          )}
          aria-label="Next page"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Book container */}
        <div
          onClick={handleBookClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={cn(
            "relative aspect-square w-full max-w-md cursor-pointer perspective-1000",
            isFullscreen && "max-w-2xl"
          )}
          style={{ perspective: "1000px" }}
        >
          {/* Book shadow */}
          <div
            className={cn(
              "absolute inset-0 bg-black/20 rounded-lg transform translate-y-2 translate-x-2 blur-lg",
              isFullscreen && "blur-xl"
            )}
          />

          {/* Current page */}
          <div
            className={cn(
              "absolute inset-0 bg-white rounded-lg overflow-hidden shadow-xl",
              "transition-transform duration-300 ease-in-out origin-left",
              flipState === "flipping-forward" && "animate-flip-forward",
              flipState === "flipping-backward" && "animate-flip-backward"
            )}
            style={{
              transformStyle: "preserve-3d",
              transform:
                flipState === "flipping-forward"
                  ? "rotateY(-15deg)"
                  : flipState === "flipping-backward"
                  ? "rotateY(15deg)"
                  : "rotateY(0deg)",
            }}
          >
            {getPageContent(currentPage)}

            {/* Page edge effect */}
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-gray-200 to-transparent" />
          </div>

          {/* Page stack effect */}
          <div className="absolute inset-0 bg-gray-50 rounded-lg -z-10 transform translate-x-1" />
          <div className="absolute inset-0 bg-gray-100 rounded-lg -z-20 transform translate-x-2" />
        </div>
      </div>

      {/* Page dots indicator */}
      <div className="flex justify-center gap-1 mt-4">
        {Array.from({ length: totalDisplayPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToPage(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              currentPage === index
                ? isFullscreen
                  ? "bg-white w-4"
                  : "bg-primary-500 w-4"
                : isFullscreen
                ? "bg-white/40 hover:bg-white/60"
                : "bg-gray-300 hover:bg-gray-400"
            )}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>

      {/* Keyboard hints */}
      <div
        className={cn(
          "text-center text-xs mt-2",
          isFullscreen ? "text-white/60" : "text-gray-400"
        )}
      >
        Use arrow keys or click/tap to navigate. Press F for fullscreen.
      </div>
    </div>
  );

  return bookContent;
}

// Simpler preview mode for embedding
export function FlipBookPreviewCompact({
  pages,
  coverImageUrl,
  title,
  className,
}: {
  pages: BookPage[];
  coverImageUrl?: string | null;
  title: string;
  className?: string;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = pages.length + 1; // cover + pages

  return (
    <div className={cn("relative", className)}>
      <div
        className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg cursor-pointer"
        onClick={() => setCurrentPage((prev) => (prev + 1) % totalPages)}
      >
        {currentPage === 0 ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-16 h-16 text-primary-300"
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
            )}
          </div>
        ) : (
          <div className="w-full h-full">
            {pages[currentPage - 1]?.imageUrl ? (
              <img
                src={pages[currentPage - 1].imageUrl!}
                alt={`Page ${currentPage}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <svg
                  className="w-12 h-12 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {Array.from({ length: totalPages }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              currentPage === i ? "bg-white" : "bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
