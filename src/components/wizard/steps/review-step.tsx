"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWizard, type WizardStep } from "../wizard-context";

const GENERATION_FEE = 4.99;

const ART_STYLE_LABELS: Record<string, string> = {
  watercolor: "Watercolor",
  cartoon: "Digital Cartoon",
  classic: "Storybook Classic",
  whimsical: "Whimsical Fantasy",
  pastel: "Soft Pastel",
  bold: "Bold & Colorful",
};

const MOOD_LABELS: Record<string, string> = {
  lighthearted: "Lighthearted & Funny",
  gentle: "Gentle & Calming",
  exciting: "Exciting & Adventurous",
  educational: "Educational",
};

const THEME_CATEGORY_LABELS: Record<string, string> = {
  adventure: "Adventure",
  friendship: "Friendship",
  family: "Family",
  learning: "Learning",
  bedtime: "Bedtime",
  custom: "Custom",
};

function EditButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
      aria-label={`Edit ${label}`}
    >
      Edit
    </button>
  );
}

function SummarySection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <EditButton onClick={onEdit} label={title} />
      </div>
      {children}
    </div>
  );
}

export function ReviewStep() {
  const { data, goToStep } = useWizard();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleEdit = (step: WizardStep) => {
    goToStep(step);
  };

  const handleCreateBook = async () => {
    setIsCreating(true);

    // For now, simulate creation and redirect
    // In a real implementation, this would call the Convex mutation
    try {
      // Placeholder: Would call createBookWithCharacters mutation here
      // const result = await createBookWithCharacters({ ... });
      // router.push(`/book/${result.bookId}/generating`);

      // For now, just simulate a delay and redirect to dashboard
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to create book:", error);
      setIsCreating(false);
    }
  };

  const isValid =
    data.title &&
    data.theme &&
    data.themeCategory &&
    data.mood &&
    data.artStyle &&
    data.setting.primary &&
    data.characters.length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <p className="text-gray-600 text-center">
        Review your book details before we start creating your story.
      </p>

      {/* Title & Author */}
      <SummarySection title="Book Details" onEdit={() => handleEdit("title")}>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Title:</dt>
            <dd className="text-gray-900 font-medium">{data.title}</dd>
          </div>
          {data.authorName && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Author:</dt>
              <dd className="text-gray-900">{data.authorName}</dd>
            </div>
          )}
        </dl>
      </SummarySection>

      {/* Theme & Mood */}
      <SummarySection title="Story Theme" onEdit={() => handleEdit("theme")}>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Category:</dt>
            <dd className="text-gray-900">
              {data.themeCategory
                ? THEME_CATEGORY_LABELS[data.themeCategory]
                : "Not set"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Mood:</dt>
            <dd className="text-gray-900">
              {data.mood ? MOOD_LABELS[data.mood] : "Not set"}
            </dd>
          </div>
          {data.theme && (
            <div className="pt-2 border-t border-gray-200">
              <dt className="text-gray-500 mb-1">Story Idea:</dt>
              <dd className="text-gray-900">{data.theme}</dd>
            </div>
          )}
        </dl>
      </SummarySection>

      {/* Characters */}
      <SummarySection
        title={`Characters (${data.characters.length})`}
        onEdit={() => handleEdit("characters")}
      >
        {data.characters.length === 0 ? (
          <p className="text-sm text-gray-500">No characters added</p>
        ) : (
          <div className="space-y-3">
            {data.characters.map((character) => (
              <div
                key={character.id}
                className="flex items-center gap-3 p-2 bg-white rounded-lg"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  {character.referenceImagePreview ? (
                    <img
                      src={character.referenceImagePreview}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {character.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {character.role === "main" ? "Main Character" : "Supporting"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SummarySection>

      {/* Setting */}
      <SummarySection title="Setting" onEdit={() => handleEdit("setting")}>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Location:</dt>
            <dd className="text-gray-900">{data.setting.primary || "Not set"}</dd>
          </div>
          {data.setting.timeOfDay && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Time of Day:</dt>
              <dd className="text-gray-900 capitalize">
                {data.setting.timeOfDay}
              </dd>
            </div>
          )}
          {data.setting.season && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Season:</dt>
              <dd className="text-gray-900 capitalize">{data.setting.season}</dd>
            </div>
          )}
          {data.setting.additionalNotes && (
            <div className="pt-2 border-t border-gray-200">
              <dt className="text-gray-500 mb-1">Additional Details:</dt>
              <dd className="text-gray-900">{data.setting.additionalNotes}</dd>
            </div>
          )}
        </dl>
      </SummarySection>

      {/* Art Style */}
      <SummarySection title="Art Style" onEdit={() => handleEdit("style")}>
        <p className="text-sm text-gray-900">
          {data.artStyle ? ART_STYLE_LABELS[data.artStyle] : "Not selected"}
        </p>
      </SummarySection>

      {/* Pricing */}
      <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Generation Fee</h4>
            <p className="text-sm text-gray-600">
              One-time fee to create your personalized story
            </p>
          </div>
          <div className="text-2xl font-bold text-primary-700">
            ${GENERATION_FEE.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Validation Warning */}
      {!isValid && (
        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          Please complete all required fields before creating your book
        </p>
      )}

      {/* Create Button */}
      <Button
        onClick={handleCreateBook}
        disabled={!isValid || isCreating}
        isLoading={isCreating}
        className="w-full"
        size="lg"
      >
        {isCreating ? "Creating Your Book..." : "Create My Book"}
      </Button>

      <p className="text-xs text-center text-gray-500">
        By clicking &quot;Create My Book&quot;, you agree to our terms of service and
        understand that the generation fee will be charged.
      </p>
    </div>
  );
}
