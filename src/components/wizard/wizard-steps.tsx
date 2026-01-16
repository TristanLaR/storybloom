"use client";

import { useWizard } from "./wizard-context";
import { TitleStep } from "./steps/title-step";

// Placeholder components for steps that will be implemented later
function ThemeStep() {
  return (
    <div className="text-center text-gray-500">
      Theme selection coming in Issue #10
    </div>
  );
}

function CharactersStep() {
  return (
    <div className="text-center text-gray-500">
      Character creation coming in Issue #11
    </div>
  );
}

function SettingStep() {
  return (
    <div className="text-center text-gray-500">
      Setting selection coming in Issue #12
    </div>
  );
}

function StyleStep() {
  return (
    <div className="text-center text-gray-500">
      Art style selection coming in Issue #12
    </div>
  );
}

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
