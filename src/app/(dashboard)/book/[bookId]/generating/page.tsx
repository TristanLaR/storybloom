"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock data for development - replace with Convex subscriptions when backend is connected
interface GenerationJob {
  status: "pending" | "in_progress" | "completed" | "failed";
  progress: number;
  currentStep?: string;
  error?: string;
}

interface Page {
  pageNumber: number;
  imageUrl?: string | null;
  textContent: string;
}

const GENERATION_STEPS = [
  { id: "story", label: "Creating Story", description: "Writing your personalized tale" },
  { id: "images", label: "Generating Art", description: "Illustrating each page" },
  { id: "cover", label: "Designing Cover", description: "Creating the book cover" },
];

function StepIndicator({
  steps,
  currentProgress,
}: {
  steps: typeof GENERATION_STEPS;
  currentProgress: number;
}) {
  return (
    <div className="flex items-center justify-center space-x-2 sm:space-x-4">
      {steps.map((step, index) => {
        const isComplete = currentProgress > (index + 1) * 33;
        const isActive = currentProgress >= index * 33 && currentProgress <= (index + 1) * 33;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all",
                  isComplete
                    ? "bg-green-500 text-white"
                    : isActive
                    ? "bg-primary-500 text-white animate-pulse"
                    : "bg-gray-200 text-gray-500"
                )}
              >
                {isComplete ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-2 font-medium hidden sm:block",
                  isActive ? "text-primary-600" : "text-gray-500"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 sm:w-16 h-1 mx-2 rounded-full transition-all",
                  currentProgress > (index + 1) * 33 ? "bg-green-500" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PagePreview({ page }: { page: Page }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="aspect-square bg-gray-100 relative">
        {page.imageUrl ? (
          <img
            src={page.imageUrl}
            alt={`Page ${page.pageNumber}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse bg-gray-200 w-full h-full" />
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="text-xs text-gray-500 truncate">Page {page.pageNumber}</p>
      </div>
    </div>
  );
}

export default function GeneratingPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = use(params);
  const router = useRouter();

  // In a real implementation, these would come from Convex subscriptions:
  // const job = useQuery(api.generationJobs.getActiveJob, { bookId });
  // const pages = useQuery(api.pages.getBookPagesWithImages, { bookId });

  // Mock state for development
  const [job, setJob] = useState<GenerationJob>({
    status: "in_progress",
    progress: 0,
    currentStep: "Processing character images",
  });
  const [pages, setPages] = useState<Page[]>([]);
  const [isCancelling, setIsCancelling] = useState(false);

  // Mock progress simulation for development
  useEffect(() => {
    if (job.status !== "in_progress") return;

    const interval = setInterval(() => {
      setJob((prev) => {
        if (prev.progress >= 100) {
          return { ...prev, status: "completed" };
        }

        const newProgress = Math.min(prev.progress + Math.random() * 5, 100);
        let currentStep = "Processing character images";

        if (newProgress > 15) currentStep = "Generating story";
        if (newProgress > 25) currentStep = "Creating pages";
        if (newProgress > 30) currentStep = `Generating illustration ${Math.floor((newProgress - 30) / 2.5) + 1} of 24`;
        if (newProgress > 85) currentStep = "Generating cover";
        if (newProgress > 90) currentStep = "Finalizing book";

        // Add mock pages as they "complete"
        const completedPages = Math.floor((newProgress - 30) / 2.5);
        if (completedPages > 0 && completedPages <= 24) {
          setPages((prevPages) => {
            if (prevPages.length < completedPages) {
              const newPages = [...prevPages];
              for (let i = prevPages.length + 1; i <= completedPages; i++) {
                newPages.push({
                  pageNumber: i,
                  imageUrl: null, // Would be actual image URL
                  textContent: `Story content for page ${i}...`,
                });
              }
              return newPages;
            }
            return prevPages;
          });
        }

        return { ...prev, progress: newProgress, currentStep };
      });
    }, 500);

    return () => clearInterval(interval);
  }, [job.status]);

  // Redirect when complete
  useEffect(() => {
    if (job.status === "completed") {
      const timer = setTimeout(() => {
        router.push(`/book/${bookId}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [job.status, bookId, router]);

  const handleCancel = async () => {
    setIsCancelling(true);
    // In real implementation:
    // await cancelGenerationJob({ jobId: job._id });
    setJob((prev) => ({ ...prev, status: "failed", error: "Cancelled by user" }));
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  if (job.status === "failed") {
    return (
      <div className="max-w-xl mx-auto text-center space-y-6 py-16">
        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generation Failed</h1>
          <p className="text-gray-600 mt-2">{job.error || "Something went wrong during generation"}</p>
        </div>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (job.status === "completed") {
    return (
      <div className="max-w-xl mx-auto text-center space-y-6 py-16">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Book is Ready!</h1>
          <p className="text-gray-600 mt-2">Taking you to the editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-3xl">✨</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Creating Your Story</h1>
        <p className="text-gray-600">{job.currentStep}</p>
      </div>

      {/* Step Indicators */}
      <StepIndicator steps={GENERATION_STEPS} currentProgress={job.progress} />

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="bg-gray-200 rounded-full h-3 w-full overflow-hidden">
          <div
            className="bg-primary-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${job.progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{Math.round(job.progress)}% complete</span>
          <span>~{Math.max(1, Math.round((100 - job.progress) / 10))} min remaining</span>
        </div>
      </div>

      {/* Page Previews */}
      {pages.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Pages Preview</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {pages.slice(-8).map((page) => (
              <PagePreview key={page.pageNumber} page={page} />
            ))}
          </div>
          {pages.length > 8 && (
            <p className="text-sm text-gray-500 text-center">
              Showing last 8 of {pages.length} completed pages
            </p>
          )}
        </div>
      )}

      {/* Cancel Button */}
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={handleCancel}
          disabled={isCancelling}
          className="text-gray-500"
        >
          {isCancelling ? "Cancelling..." : "Cancel Generation"}
        </Button>
        <p className="text-xs text-gray-400 mt-2">
          Cancelling will lose any progress made
        </p>
      </div>
    </div>
  );
}
