"use client";

import { useWizard } from "./wizard-context";
import { TitleStep } from "./steps/title-step";
import { ThemeStep } from "./steps/theme-step";
import { CharactersStep } from "./steps/characters-step";
import { SettingStep } from "./steps/setting-step";
import { StyleStep } from "./steps/style-step";

function ReviewStep() {
  const { data } = useWizard();

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Book Summary</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Title:</dt>
            <dd className="text-gray-900 font-medium">
              {data.title || "Not set"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Author:</dt>
            <dd className="text-gray-900">
              {data.authorName || "Not specified"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Theme:</dt>
            <dd className="text-gray-900">{data.theme || "Not set"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Characters:</dt>
            <dd className="text-gray-900">{data.characters.length} added</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Art Style:</dt>
            <dd className="text-gray-900">{data.artStyle || "Not selected"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

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
