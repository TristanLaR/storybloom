"use client";

import { cn } from "@/lib/utils";
import { useWizard } from "../wizard-context";

const SETTING_SUGGESTIONS = [
  "Enchanted forest",
  "Cozy home",
  "Magical kingdom",
  "Underwater world",
  "Outer space",
  "Farm",
  "School",
  "Beach",
];

const TIME_OF_DAY_OPTIONS = [
  { value: "morning", label: "Morning", emoji: "🌅" },
  { value: "afternoon", label: "Afternoon", emoji: "☀️" },
  { value: "evening", label: "Evening", emoji: "🌆" },
  { value: "night", label: "Night", emoji: "🌙" },
];

const SEASON_OPTIONS = [
  { value: "spring", label: "Spring", emoji: "🌸" },
  { value: "summer", label: "Summer", emoji: "🌻" },
  { value: "autumn", label: "Autumn", emoji: "🍂" },
  { value: "winter", label: "Winter", emoji: "❄️" },
];

export function SettingStep() {
  const { data, setData } = useWizard();

  const updateSetting = (updates: Partial<typeof data.setting>) => {
    setData({
      setting: {
        ...data.setting,
        ...updates,
      },
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Primary Setting */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Where does your story take place?
        </label>
        <input
          type="text"
          value={data.setting.primary}
          onChange={(e) => updateSetting({ primary: e.target.value })}
          placeholder="Describe the main setting..."
          className={cn(
            "w-full px-3 py-2 rounded-lg border bg-white text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "border-gray-300"
          )}
        />
        <div className="flex flex-wrap gap-2">
          {SETTING_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => updateSetting({ primary: suggestion })}
              className={cn(
                "px-3 py-1 text-sm rounded-full border transition-colors",
                data.setting.primary === suggestion
                  ? "bg-primary-100 border-primary-300 text-primary-700"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Time of Day */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Time of day <span className="text-gray-400">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {TIME_OF_DAY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                updateSetting({
                  timeOfDay:
                    data.setting.timeOfDay === option.value
                      ? undefined
                      : option.value,
                })
              }
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
                data.setting.timeOfDay === option.value
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              )}
            >
              <span>{option.emoji}</span>
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Season */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Season <span className="text-gray-400">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SEASON_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                updateSetting({
                  season:
                    data.setting.season === option.value
                      ? undefined
                      : option.value,
                })
              }
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
                data.setting.season === option.value
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              )}
            >
              <span>{option.emoji}</span>
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Additional details <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={data.setting.additionalNotes || ""}
          onChange={(e) => updateSetting({ additionalNotes: e.target.value })}
          placeholder="Any specific details about the setting? e.g., A treehouse with colorful decorations..."
          rows={3}
          className={cn(
            "w-full px-3 py-2 rounded-lg border bg-white text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "border-gray-300"
          )}
        />
      </div>

      {!data.setting.primary && (
        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          Please describe where your story takes place to continue
        </p>
      )}
    </div>
  );
}
