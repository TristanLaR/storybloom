"use client";

import { use, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InlineTextEditor } from "@/components/editor/InlineTextEditor";
import { ImageRegenerator } from "@/components/editor/ImageRegenerator";
import { PageThumbnailGrid } from "@/components/editor/DraggableThumbnail";
import { useAutoSave } from "@/hooks/useAutoSave";
import { SaveStatusIndicator } from "@/components/editor/SaveStatusIndicator";

// Mock page data for development
interface BookPage {
  _id: string;
  pageNumber: number;
  pageType: "title" | "story" | "back_cover";
  textContent: string;
  textPosition: "top" | "middle" | "bottom";
  imageUrl: string | null;
  imagePrompt: string;
  imageGenerationCount: number;
  fontSize?: number;
}

interface Book {
  _id: string;
  title: string;
  authorName?: string;
  status: "draft" | "finalized" | "ordered";
  artStyle: string;
  coverImageUrl?: string | null;
}

// Mock data
const mockBook: Book = {
  _id: "book-1",
  title: "The Great Adventure",
  authorName: "Jane Smith",
  status: "draft",
  artStyle: "watercolor",
  coverImageUrl: null,
};

const createMockPages = (): BookPage[] => Array.from({ length: 24 }, (_, i) => ({
  _id: `page-${i + 1}`,
  pageNumber: i + 1,
  pageType: i === 0 ? "title" : i === 23 ? "back_cover" : "story",
  textContent: i === 0
    ? `${mockBook.title}\n\nby ${mockBook.authorName}`
    : `Once upon a time, on page ${i + 1}, the adventure continued with even more excitement and wonder...`,
  textPosition: i === 0 ? "middle" : "bottom",
  imageUrl: null,
  imagePrompt: i === 0
    ? `Title page illustration for "${mockBook.title}" in watercolor style, featuring the main characters in a magical setting`
    : `Illustration for page ${i + 1} showing the adventure continuing, watercolor style, children's book illustration`,
  imageGenerationCount: 0,
  fontSize: 14,
}));

function PagePreview({
  page,
  book,
  showMargins,
  onTextChange,
  onPositionChange,
  onFontSizeChange,
  onSave,
  editable = true,
}: {
  page: BookPage;
  book: Book;
  showMargins: boolean;
  onTextChange?: (text: string) => void;
  onPositionChange?: (position: "top" | "middle" | "bottom") => void;
  onFontSizeChange?: (size: number) => void;
  onSave?: () => void;
  editable?: boolean;
}) {
  return (
    <div className="relative bg-white rounded-lg shadow-lg aspect-square max-w-md mx-auto overflow-hidden">
      {/* Background/Image */}
      <div className="absolute inset-0 bg-gray-100">
        {page.imageUrl ? (
          <img
            src={page.imageUrl}
            alt={`Page ${page.pageNumber}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Inline Text Editor */}
      {editable && onTextChange && onPositionChange ? (
        <InlineTextEditor
          value={page.textContent}
          textPosition={page.textPosition}
          fontSize={page.fontSize || 14}
          onChange={onTextChange}
          onPositionChange={onPositionChange}
          onFontSizeChange={onFontSizeChange}
          onBlur={onSave}
        />
      ) : (
        /* Static Text Display */
        <div
          className={cn(
            "absolute left-0 right-0 p-4 text-center",
            page.textPosition === "top" && "top-0",
            page.textPosition === "middle" && "top-1/2 -translate-y-1/2",
            page.textPosition === "bottom" && "bottom-0"
          )}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 max-w-xs mx-auto">
            <p
              className="text-gray-800 whitespace-pre-line"
              style={{ fontSize: `${page.fontSize || 14}px` }}
            >
              {page.textContent}
            </p>
          </div>
        </div>
      )}

      {/* Bleed/Safety Margins */}
      {showMargins && (
        <>
          {/* Bleed margin (outer) - red */}
          <div className="absolute inset-0 border-4 border-red-500/30 pointer-events-none" />
          {/* Safety margin (inner) - green */}
          <div className="absolute inset-4 border-2 border-green-500/30 border-dashed pointer-events-none" />
          <div className="absolute top-2 right-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
            <span className="text-red-400">Bleed</span> / <span className="text-green-400">Safe</span>
          </div>
        </>
      )}
    </div>
  );
}

function SpreadPreview({
  leftPage,
  rightPage,
  book,
  showMargins,
}: {
  leftPage: BookPage | null;
  rightPage: BookPage | null;
  book: Book;
  showMargins: boolean;
}) {
  return (
    <div className="flex gap-2 justify-center">
      <div className="w-1/2 max-w-xs">
        {leftPage ? (
          <PagePreview page={leftPage} book={book} showMargins={showMargins} />
        ) : (
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
            Inside Cover
          </div>
        )}
      </div>
      <div className="w-1/2 max-w-xs">
        {rightPage ? (
          <PagePreview page={rightPage} book={book} showMargins={showMargins} />
        ) : (
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
            Back Cover
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookEditorPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = use(params);
  const router = useRouter();

  // In real implementation, fetch from Convex:
  // const book = useQuery(api.books.getBook, { bookId });
  // const pages = useQuery(api.pages.getBookPagesWithImages, { bookId });

  const book = mockBook;
  const [pages, setPages] = useState<BookPage[]>(() => createMockPages());

  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"single" | "spread">("single");
  const [showMargins, setShowMargins] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);

  const selectedPage = pages[selectedPageIndex];
  const leftPage = viewMode === "spread" ? pages[selectedPageIndex] : null;
  const rightPage = viewMode === "spread" ? pages[selectedPageIndex + 1] : null;

  // Memoize the current page data for auto-save
  const currentPageData = useMemo(
    () => ({
      pageId: selectedPage._id,
      textContent: selectedPage.textContent,
      textPosition: selectedPage.textPosition,
      fontSize: selectedPage.fontSize,
      imagePrompt: selectedPage.imagePrompt,
    }),
    [selectedPage._id, selectedPage.textContent, selectedPage.textPosition, selectedPage.fontSize, selectedPage.imagePrompt]
  );

  // Auto-save hook
  const handleAutoSave = useCallback(
    async (data: typeof currentPageData) => {
      // In real implementation, call Convex mutation:
      // await updatePageText({ pageId: data.pageId, textContent: data.textContent, textPosition: data.textPosition });
      console.log("Auto-saving page:", data.pageId);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Auto-save complete for page:", data.pageId);
    },
    []
  );

  const { status: saveStatus, lastSaved, error: saveError, save: manualSave } = useAutoSave({
    data: currentPageData,
    onSave: handleAutoSave,
    debounceMs: 2000,
    enabled: true,
  });

  // Update handlers for inline text editing
  const updatePage = useCallback((pageIndex: number, updates: Partial<BookPage>) => {
    setPages((prevPages) =>
      prevPages.map((page, index) =>
        index === pageIndex ? { ...page, ...updates } : page
      )
    );
  }, []);

  const handleTextChange = useCallback(
    (text: string) => {
      updatePage(selectedPageIndex, { textContent: text });
    },
    [selectedPageIndex, updatePage]
  );

  const handlePositionChange = useCallback(
    (position: "top" | "middle" | "bottom") => {
      updatePage(selectedPageIndex, { textPosition: position });
    },
    [selectedPageIndex, updatePage]
  );

  const handleFontSizeChange = useCallback(
    (size: number) => {
      updatePage(selectedPageIndex, { fontSize: size });
    },
    [selectedPageIndex, updatePage]
  );

  const handleImagePromptChange = useCallback(
    (prompt: string) => {
      updatePage(selectedPageIndex, { imagePrompt: prompt });
    },
    [selectedPageIndex, updatePage]
  );

  const handleRegenerate = useCallback(
    async (newPrompt?: string) => {
      // In real implementation, call Convex action:
      // await regeneratePageImage({ pageId: selectedPage._id, newPrompt });
      console.log("Regenerating image for page:", selectedPage._id, "with prompt:", newPrompt);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update regeneration count
      updatePage(selectedPageIndex, {
        imageGenerationCount: selectedPage.imageGenerationCount + 1,
        // In real implementation, the imageUrl would be updated by the mutation
      });

      console.log("Image regenerated successfully");
    },
    [selectedPageIndex, selectedPage, updatePage]
  );

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      // In real implementation, call Convex mutation:
      // await reorderPages({ bookId, fromIndex, toIndex });
      setPages((prevPages) => {
        const newPages = [...prevPages];
        const [movedPage] = newPages.splice(fromIndex, 1);
        newPages.splice(toIndex, 0, movedPage);

        // Update page numbers
        return newPages.map((page, index) => ({
          ...page,
          pageNumber: index + 1,
        }));
      });

      // Adjust selection if needed
      if (selectedPageIndex === fromIndex) {
        setSelectedPageIndex(toIndex);
      } else if (fromIndex < selectedPageIndex && toIndex >= selectedPageIndex) {
        setSelectedPageIndex(selectedPageIndex - 1);
      } else if (fromIndex > selectedPageIndex && toIndex <= selectedPageIndex) {
        setSelectedPageIndex(selectedPageIndex + 1);
      }

      console.log("Reordered page from", fromIndex, "to", toIndex);
    },
    [selectedPageIndex]
  );

  const handlePrevPage = () => {
    const step = viewMode === "spread" ? 2 : 1;
    setSelectedPageIndex((prev) => Math.max(0, prev - step));
  };

  const handleNextPage = () => {
    const step = viewMode === "spread" ? 2 : 1;
    setSelectedPageIndex((prev) => Math.min(pages.length - 1, prev + step));
  };

  const canGoPrev = selectedPageIndex > 0;
  const canGoNext = viewMode === "spread"
    ? selectedPageIndex < pages.length - 2
    : selectedPageIndex < pages.length - 1;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{book.title}</h1>
            <p className="text-sm text-gray-500">
              {book.authorName ? `by ${book.authorName}` : "Draft"} • {pages.length} pages
            </p>
          </div>
          <SaveStatusIndicator
            status={saveStatus}
            lastSaved={lastSaved}
            error={saveError}
            onRetry={manualSave}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={manualSave}
            disabled={saveStatus === "saving" || saveStatus === "idle"}
          >
            {saveStatus === "saving" ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/book/${bookId}/order`)}
          >
            Order Print
          </Button>
          <Button size="sm">Finalize Book</Button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex overflow-hidden mt-4 gap-4">
        {/* Thumbnail Sidebar */}
        {showThumbnails && (
          <div className="w-24 lg:w-32 flex-shrink-0 overflow-y-auto pr-2">
            <PageThumbnailGrid
              pages={pages}
              selectedPageIndex={selectedPageIndex}
              onSelectPage={setSelectedPageIndex}
              onReorder={handleReorder}
            />
          </div>
        )}

        {/* Preview Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* View Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowThumbnails(!showThumbnails)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showThumbnails ? "bg-gray-100" : "hover:bg-gray-100"
                )}
                title="Toggle thumbnails"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <div className="border-l h-6 mx-2" />
              <button
                onClick={() => setViewMode("single")}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "single" ? "bg-primary-100 text-primary-600" : "hover:bg-gray-100"
                )}
                title="Single page view"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("spread")}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "spread" ? "bg-primary-100 text-primary-600" : "hover:bg-gray-100"
                )}
                title="Spread view"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </button>
              <div className="border-l h-6 mx-2" />
              <button
                onClick={() => setShowMargins(!showMargins)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showMargins ? "bg-primary-100 text-primary-600" : "hover:bg-gray-100"
                )}
                title="Toggle bleed/safety margins"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </button>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={!canGoPrev}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm text-gray-600 min-w-[80px] text-center">
                {viewMode === "spread"
                  ? `${selectedPageIndex + 1}-${Math.min(selectedPageIndex + 2, pages.length)} of ${pages.length}`
                  : `${selectedPageIndex + 1} of ${pages.length}`}
              </span>
              <button
                onClick={handleNextPage}
                disabled={!canGoNext}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Page Preview Area */}
          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl p-8 overflow-auto relative">
            {viewMode === "single" ? (
              <PagePreview
                page={selectedPage}
                book={book}
                showMargins={showMargins}
                onTextChange={handleTextChange}
                onPositionChange={handlePositionChange}
                onFontSizeChange={handleFontSizeChange}
                editable={true}
              />
            ) : (
              <SpreadPreview
                leftPage={leftPage}
                rightPage={rightPage}
                book={book}
                showMargins={showMargins}
              />
            )}
          </div>
        </div>

        {/* Edit Panel */}
        <div className="w-72 lg:w-80 flex-shrink-0 bg-white rounded-xl border p-4 overflow-y-auto">
          <h2 className="font-semibold text-gray-900 mb-4">
            Page {selectedPageIndex + 1} Settings
          </h2>

          <div className="space-y-4">
            {/* Page Type Badge */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Type
              </label>
              <span className="inline-block px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
                {selectedPage.pageType === "title"
                  ? "Title Page"
                  : selectedPage.pageType === "back_cover"
                  ? "Back Cover"
                  : "Story Page"}
              </span>
            </div>

            {/* Text Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Content
              </label>
              <textarea
                value={selectedPage.textContent}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {selectedPage.textContent.length}/200 characters
              </p>
            </div>

            {/* Text Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Position
              </label>
              <div className="flex gap-2">
                {(["top", "middle", "bottom"] as const).map((position) => (
                  <button
                    key={position}
                    onClick={() => handlePositionChange(position)}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                      selectedPage.textPosition === position
                        ? "bg-primary-100 text-primary-700 border-2 border-primary-500"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {position.charAt(0).toUpperCase() + position.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Regenerator */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Illustration
              </label>
              <ImageRegenerator
                imageUrl={selectedPage.imageUrl}
                imagePrompt={selectedPage.imagePrompt}
                regenerationCount={selectedPage.imageGenerationCount}
                onRegenerate={handleRegenerate}
                onPromptChange={handleImagePromptChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
