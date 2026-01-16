"use client";

import { TitleStep } from "./steps/title-step";
import { ThemeStep } from "./steps/theme-step";
import { CharactersStep } from "./steps/characters-step";
import { SettingStep } from "./steps/setting-step";
import { StyleStep } from "./steps/style-step";
import { ReviewStep } from "./steps/review-step";
import { useWizard } from "./wizard-context";

export function WizardSteps() {
  const { currentStep } = useWizard();

  switch (currentStep) {
    case "title":
      return <TitleStep />;
    case "theme":
      return <ThemeStep />;
    case "characters":
      return <CharactersStep />;
    case "setting":
      return <SettingStep />;
    case "style":
      return <StyleStep />;
    case "review":
      return <ReviewStep />;
    default:
      return null;
  }
}
