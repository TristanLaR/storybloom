"use client";

import { cn } from "@/lib/utils";
import { useWizard } from "./wizard-context";

export function StepIndicator() {
  const { steps, stepLabels, currentStepIndex, goToStep } = useWizard();

  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <li key={step} className="flex-1 relative">
              {/* Connector line */}
              {index !== 0 && (
                <div
                  className={cn(
                    "absolute top-4 left-0 right-1/2 h-0.5 -translate-y-1/2",
                    isCompleted || isCurrent
                      ? "bg-primary-600"
                      : "bg-gray-200"
                  )}
                />
              )}
              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-4 left-1/2 right-0 h-0.5 -translate-y-1/2",
                    isCompleted ? "bg-primary-600" : "bg-gray-200"
                  )}
                />
              )}

              <button
                onClick={() => isCompleted && goToStep(step)}
                disabled={isUpcoming}
                className={cn(
                  "relative flex flex-col items-center group",
                  isUpcoming && "cursor-not-allowed",
                  isCompleted && "cursor-pointer"
                )}
              >
                {/* Step circle */}
                <span
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors",
                    isCompleted &&
                      "bg-primary-600 text-white hover:bg-primary-700",
                    isCurrent &&
                      "bg-primary-600 text-white ring-4 ring-primary-100",
                    isUpcoming && "bg-gray-200 text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
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
                  ) : (
                    index + 1
                  )}
                </span>

                {/* Step label */}
                <span
                  className={cn(
                    "mt-2 text-xs font-medium hidden sm:block",
                    isCurrent && "text-primary-600",
                    isCompleted && "text-gray-700",
                    isUpcoming && "text-gray-400"
                  )}
                >
                  {stepLabels[step]}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
