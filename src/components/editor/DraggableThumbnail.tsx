"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface DraggableThumbnailProps {
  pageId: string;
  pageNumber: number;
  imageUrl: string | null;
  isSelected: boolean;
  isDragDisabled?: boolean;
  onSelect: () => void;
  onDragStart: (pageId: string) => void;
  onDragOver: (pageId: string) => void;
  onDragEnd: () => void;
  dragOverId: string | null;
  draggingId: string | null;
}

export function DraggableThumbnail({
  pageId,
  pageNumber,
  imageUrl,
  isSelected,
  isDragDisabled = false,
  onSelect,
  onDragStart,
  onDragOver,
  onDragEnd,
  dragOverId,
  draggingId,
}: DraggableThumbnailProps) {
  const isDragging = draggingId === pageId;
  const isDraggedOver = dragOverId === pageId && draggingId !== pageId;

  return (
    <div
      draggable={!isDragDisabled}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart(pageId);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragOver(pageId);
      }}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className={cn(
        "relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing",
        isSelected
          ? "border-primary-500 ring-2 ring-primary-200"
          : "border-gray-200 hover:border-gray-300",
        isDragging && "opacity-50 scale-95",
        isDraggedOver && "border-primary-400 border-dashed bg-primary-50",
        isDragDisabled && "cursor-pointer"
      )}
    >
      {/* Drop indicator */}
      {isDraggedOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary-100/50 z-10">
          <div className="w-1 h-full bg-primary-500 absolute left-0" />
        </div>
      )}

      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Page ${pageNumber}`}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="text-gray-400 text-xs">No image</div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2 flex items-center justify-between">
        <span>{pageNumber}</span>
        {!isDragDisabled && (
          <svg
            className="w-3 h-3 text-white/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        )}
      </div>
    </div>
  );
}

interface PageThumbnailGridProps {
  pages: Array<{
    _id: string;
    pageNumber: number;
    imageUrl: string | null;
    pageType: "title" | "story" | "back_cover";
  }>;
  selectedPageIndex: number;
  onSelectPage: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function PageThumbnailGrid({
  pages,
  selectedPageIndex,
  onSelectPage,
  onReorder,
}: PageThumbnailGridProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (pageId: string) => {
    setDraggingId(pageId);
  };

  const handleDragOver = (pageId: string) => {
    if (draggingId && pageId !== draggingId) {
      setDragOverId(pageId);
    }
  };

  const handleDragEnd = () => {
    if (draggingId && dragOverId) {
      const fromIndex = pages.findIndex((p) => p._id === draggingId);
      const toIndex = pages.findIndex((p) => p._id === dragOverId);

      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        onReorder(fromIndex, toIndex);
      }
    }

    setDraggingId(null);
    setDragOverId(null);
  };

  return (
    <div className="space-y-2">
      {pages.map((page, index) => {
        // Title page and back cover cannot be reordered
        const isDragDisabled =
          page.pageType === "title" || page.pageType === "back_cover";

        return (
          <DraggableThumbnail
            key={page._id}
            pageId={page._id}
            pageNumber={page.pageNumber}
            imageUrl={page.imageUrl}
            isSelected={index === selectedPageIndex}
            isDragDisabled={isDragDisabled}
            onSelect={() => onSelectPage(index)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            dragOverId={dragOverId}
            draggingId={draggingId}
          />
        );
      })}
    </div>
  );
}
