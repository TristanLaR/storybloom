"use client";

import { cn } from "@/lib/utils";
import { useWizard } from "../wizard-context";
import type { ThemeCategory, Mood } from "@/types";

const THEME_CATEGORIES: { value: ThemeCategory; label: string; emoji: string }[] = [
  { value: "adventure", label: "Adventure", emoji: "🗺️" },
  { value: "friendship", label: "Friendship", emoji: "🤝" },
  { value: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { value: "learning", label: "Learning", emoji: "📚" },
  { value: "bedtime", label: "Bedtime", emoji: "🌙" },
  { value: "custom", label: "Custom", emoji: "✨" },
];

const MOODS: { value: Mood; label: string; description: string }[] = [
  {
    value: "lighthearted",
    label: "Lighthearted & Funny",
    description: "Silly moments and giggles",
  },
  {
    value: "gentle",
    label: "Gentle & Calming",
    description: "Soft, soothing stories",
  },
  {
    value: "exciting",
    label: "Exciting & Adventurous",
    description: "Action and discovery",
  },
  {
    value: "educational",
    label: "Educational",
    description: "Learn while reading",
  },
];

export function ThemeStep() {
  const { data, setData } = useWizard();

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Theme Category */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Choose a story theme
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {THEME_CATEGORIES.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => setData({ themeCategory: category.value })}
              className={cn(
                "flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                data.themeCategory === category.value
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              )}
            >
              <span className="text-2xl mb-1">{category.emoji}</span>
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Theme Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Describe your story idea
        </label>
        <textarea
          value={data.theme}
          onChange={(e) => setData({ theme: e.target.value })}
          placeholder="e.g., A brave adventure about a child who learns to face their fears..."
          rows={3}
          className={cn(
            "w-full px-3 py-2 rounded-lg border bg-white text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "border-gray-300"
          )}
        />
        <p className="text-xs text-gray-500">
          Be as detailed as you like. This helps our AI create a unique story for you.
        </p>
      </div>

      {/* Mood Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          What mood should the story have?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              type="button"
              onClick={() => setData({ mood: mood.value })}
              className={cn(
                "flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left",
                data.mood === mood.value
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <span
                className={cn(
                  "font-medium",
                  data.mood === mood.value ? "text-primary-700" : "text-gray-700"
                )}
              >
                {mood.label}
              </span>
              <span className="text-sm text-gray-500">{mood.description}</span>
            </button>
          ))}
        </div>
      </div>

      {(!data.themeCategory || !data.theme || !data.mood) && (
        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          Please select a theme, describe your story, and choose a mood to continue
        </p>
      )}
    </div>
  );
}
