"use client";

import { Button } from "@/components/ui/button";
import { useWizard } from "./wizard-context";

export function WizardNavigation() {
  const { nextStep, prevStep, canGoNext, canGoPrev, isFirstStep, isLastStep } =
    useWizard();

  return (
    <div className="flex justify-between pt-6 border-t">
      <Button
        variant="outline"
        onClick={prevStep}
        disabled={!canGoPrev}
        className={isFirstStep ? "invisible" : ""}
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </Button>

      {isLastStep ? (
        <Button onClick={() => console.log("Submit wizard")}>
          Create Book
          <svg
            className="w-4 h-4 ml-2"
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
        </Button>
      ) : (
        <Button onClick={nextStep} disabled={!canGoNext}>
          Next
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      )}
    </div>
  );
}
