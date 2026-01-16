"use client";

import { ReactNode } from "react";
import { WizardProvider, useWizard } from "./wizard-context";
import { StepIndicator } from "./step-indicator";
import { WizardNavigation } from "./wizard-navigation";

interface WizardContainerProps {
  children: ReactNode;
}

function WizardContent({ children }: { children: ReactNode }) {
  const { currentStep, stepLabels } = useWizard();

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <StepIndicator />

      {/* Step Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {stepLabels[currentStep]}
        </h2>
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">{children}</div>

      {/* Navigation */}
      <WizardNavigation />
    </div>
  );
}

export function WizardContainer({ children }: WizardContainerProps) {
  return (
    <WizardProvider>
      <WizardContent>{children}</WizardContent>
    </WizardProvider>
  );
}
