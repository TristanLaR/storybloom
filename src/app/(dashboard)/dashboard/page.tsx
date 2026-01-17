"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock data for development
interface Book {
  _id: string;
  title: string;
  status: "setup" | "generating" | "draft" | "finalized" | "ordered";
  artStyle: string;
  coverImageUrl: string | null;
  authorName?: string;
  createdAt: number;
  updatedAt: number;
}

const mockBooks: Book[] = [
  {
    _id: "book-1",
    title: "The Great Adventure",
    status: "draft",
    artStyle: "watercolor",
    coverImageUrl: null,
    authorName: "Jane Smith",
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    _id: "book-2",
    title: "Princess and the Magic Garden",
    status: "finalized",
    artStyle: "whimsical",
    coverImageUrl: null,
    authorName: "Emma Wilson",
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    _id: "book-3",
    title: "Dinosaur Discovery",
    status: "ordered",
    artStyle: "cartoon",
    coverImageUrl: null,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
  },
];

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

const STATUS_CONFIG: Record<
  Book["status"],
  { label: string; color: string; bgColor: string }
> = {
  setup: {
    label: "Setup",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  generating: {
    label: "Generating",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  draft: {
    label: "Draft",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  finalized: {
    label: "Ready to Order",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  ordered: {
    label: "Ordered",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
};

type SortOption = "newest" | "oldest" | "title";
type FilterOption = "all" | Book["status"];

function BookActionsMenu({
  book,
  onDuplicate,
  onDelete,
}: {
  book: Book;
  onDuplicate: (bookId: string) => void;
  onDelete: (bookId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Book actions"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-20 py-1">
            {/* Edit / Continue */}
            {(book.status === "draft" || book.status === "setup") && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAction(() => router.push(`/book/${book._id}`));
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Continue Editing
              </button>
            )}

            {/* View / Download PDF */}
            {book.status === "finalized" && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAction(() => router.push(`/book/${book._id}`));
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Book
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAction(() => {
                      // In real implementation, trigger PDF download
                      console.log("Download PDF for:", book._id);
                    });
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </button>
              </>
            )}

            {/* Order / Reorder */}
            {book.status === "finalized" && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAction(() => router.push(`/book/${book._id}/order`));
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Order Print
              </button>
            )}

            {book.status === "ordered" && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAction(() => router.push(`/book/${book._id}/order`));
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reorder Print
              </button>
            )}

            {/* Duplicate */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAction(() => onDuplicate(book._id));
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Duplicate
            </button>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAction(() => onDelete(book._id));
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function BookCard({
  book,
  onDuplicate,
  onDelete,
}: {
  book: Book;
  onDuplicate: (bookId: string) => void;
  onDelete: (bookId: string) => void;
}) {
  const status = STATUS_CONFIG[book.status];
  const href =
    book.status === "setup"
      ? `/book/new?bookId=${book._id}`
      : book.status === "generating"
      ? `/book/${book._id}/generating`
      : `/book/${book._id}`;

  return (
    <Link
      href={href}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-300 transition-all duration-200"
    >
      {/* Cover Image */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden">
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto text-gray-300 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="text-xs text-gray-400 capitalize">
                {book.artStyle} style
              </span>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium",
              status.bgColor,
              status.color
            )}
          >
            {status.label}
          </span>
        </div>

        {/* Actions Menu */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <BookActionsMenu book={book} onDuplicate={onDuplicate} onDelete={onDelete} />
        </div>

        {/* Generating Animation */}
        {book.status === "generating" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white">
              <svg
                className="w-8 h-8 mx-auto animate-spin mb-2"
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
              <span className="text-sm">Creating your book...</span>
            </div>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
          {book.title}
        </h3>
        {book.authorName && (
          <p className="text-sm text-gray-500 truncate">by {book.authorName}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Updated {formatDate(book.updatedAt)}
        </p>
      </div>
    </Link>
  );
}

function CreateBookCard() {
  return (
    <Link
      href="/book/new"
      className="group bg-white rounded-xl border-2 border-dashed border-gray-300 overflow-hidden hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 flex flex-col"
    >
      <div className="aspect-square flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
            <svg
              className="w-8 h-8 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            Create New Book
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Start a new personalized story
          </p>
        </div>
      </div>
      <div className="p-4 border-t border-gray-100">
        <div className="h-[52px]" /> {/* Spacer to match BookCard height */}
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-12 h-12 text-primary-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Create Your First Book
      </h2>
      <p className="text-gray-600 max-w-md mx-auto mb-8">
        Design a personalized children&apos;s book with custom characters, settings, and
        stories. It&apos;s easy and fun!
      </p>
      <Link href="/book/new">
        <Button size="lg">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Your First Book
        </Button>
      </Link>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
        >
          <div className="aspect-square bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DeleteConfirmationModal({
  bookTitle,
  onConfirm,
  onCancel,
}: {
  bookTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Delete Book</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete &quot;{bookTitle}&quot;? This action cannot be undone.
          All pages, characters, and associated data will be permanently removed.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete Book
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterSortBar({
  filter,
  sort,
  onFilterChange,
  onSortChange,
}: {
  filter: FilterOption;
  sort: SortOption;
  onFilterChange: (filter: FilterOption) => void;
  onSortChange: (sort: SortOption) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Filter:</label>
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value as FilterOption)}
          className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Books</option>
          <option value="setup">Setup</option>
          <option value="generating">Generating</option>
          <option value="draft">Draft</option>
          <option value="finalized">Ready to Order</option>
          <option value="ordered">Ordered</option>
        </select>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Sort:</label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="title">Title (A-Z)</option>
        </select>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // In real implementation:
  // const books = useQuery(api.books.getUserBooks);
  // const isLoading = books === undefined;

  const [isLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [deleteModal, setDeleteModal] = useState<{ bookId: string; title: string } | null>(null);

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    // Filter
    if (filter !== "all") {
      result = result.filter((book) => book.status === filter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case "newest":
          return b.updatedAt - a.updatedAt;
        case "oldest":
          return a.updatedAt - b.updatedAt;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [books, filter, sort]);

  const handleDuplicate = useCallback((bookId: string) => {
    // In real implementation: call mutation
    // const newBookId = await duplicateBook({ bookId });
    const bookToDuplicate = books.find((b) => b._id === bookId);
    if (bookToDuplicate) {
      const newBook: Book = {
        ...bookToDuplicate,
        _id: `book-${Date.now()}`,
        title: `${bookToDuplicate.title} (Copy)`,
        status: "draft",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setBooks((prev) => [newBook, ...prev]);
    }
  }, [books]);

  const handleDelete = useCallback((bookId: string) => {
    const book = books.find((b) => b._id === bookId);
    if (book) {
      setDeleteModal({ bookId, title: book.title });
    }
  }, [books]);

  const confirmDelete = useCallback(() => {
    if (deleteModal) {
      // In real implementation: call mutation
      // await deleteBook({ bookId: deleteModal.bookId });
      setBooks((prev) => prev.filter((b) => b._id !== deleteModal.bookId));
      setDeleteModal(null);
    }
  }, [deleteModal]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Books</h1>
          <p className="text-gray-600 mt-2">
            Your personalized children&apos;s book collection
          </p>
        </div>
        {books.length > 0 && (
          <Link href="/book/new">
            <Button>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Book
            </Button>
          </Link>
        )}
      </div>

      {/* Filter/Sort Bar */}
      {books.length > 0 && (
        <FilterSortBar
          filter={filter}
          sort={sort}
          onFilterChange={setFilter}
          onSortChange={setSort}
        />
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : books.length === 0 ? (
        <EmptyState />
      ) : filteredAndSortedBooks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No books match the current filter.</p>
          <button
            onClick={() => setFilter("all")}
            className="text-primary-600 hover:underline mt-2"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <CreateBookCard />
          {filteredAndSortedBooks.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {books.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t">
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{books.length}</p>
            <p className="text-sm text-gray-500">Total Books</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {books.filter((b) => b.status === "draft").length}
            </p>
            <p className="text-sm text-gray-500">In Progress</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {books.filter((b) => b.status === "finalized").length}
            </p>
            <p className="text-sm text-gray-500">Ready to Order</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {books.filter((b) => b.status === "ordered").length}
            </p>
            <p className="text-sm text-gray-500">Ordered</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <DeleteConfirmationModal
          bookTitle={deleteModal.title}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal(null)}
        />
      )}
    </div>
  );
}
