"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type {
  ArtStyle,
  Mood,
  ThemeCategory,
  Setting,
  CharacterRole,
} from "@/types";

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  description: string;
  relationship?: string;
  referenceImage?: File;
  referenceImagePreview?: string;
}

export interface WizardData {
  title: string;
  theme: string;
  themeCategory?: ThemeCategory;
  characters: Character[];
  setting: Setting;
  artStyle?: ArtStyle;
  mood?: Mood;
  authorName?: string;
}

export type WizardStep =
  | "title"
  | "theme"
  | "characters"
  | "setting"
  | "style"
  | "review";

const STEPS: WizardStep[] = [
  "title",
  "theme",
  "characters",
  "setting",
  "style",
  "review",
];

const STEP_LABELS: Record<WizardStep, string> = {
  title: "Title",
  theme: "Theme",
  characters: "Characters",
  setting: "Setting",
  style: "Art Style",
  review: "Review",
};

interface WizardContextType {
  currentStep: WizardStep;
  currentStepIndex: number;
  totalSteps: number;
  data: WizardData;
  steps: WizardStep[];
  stepLabels: Record<WizardStep, string>;
  setData: (data: Partial<WizardData>) => void;
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const initialData: WizardData = {
  title: "",
  theme: "",
  themeCategory: undefined,
  characters: [],
  setting: {
    primary: "",
    timeOfDay: undefined,
    season: undefined,
    additionalNotes: undefined,
  },
  artStyle: undefined,
  mood: undefined,
  authorName: undefined,
};

const WizardContext = createContext<WizardContextType | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [data, setDataState] = useState<WizardData>(initialData);

  const currentStep = STEPS[currentStepIndex];
  const totalSteps = STEPS.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  const setData = useCallback((newData: Partial<WizardData>) => {
    setDataState((prev) => ({ ...prev, ...newData }));
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    const index = STEPS.indexOf(step);
    if (index !== -1) {
      setCurrentStepIndex(index);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const canGoNext = currentStepIndex < STEPS.length - 1;
  const canGoPrev = currentStepIndex > 0;

  return (
    <WizardContext.Provider
      value={{
        currentStep,
        currentStepIndex,
        totalSteps,
        data,
        steps: STEPS,
        stepLabels: STEP_LABELS,
        setData,
        goToStep,
        nextStep,
        prevStep,
        canGoNext,
        canGoPrev,
        isFirstStep,
        isLastStep,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}
