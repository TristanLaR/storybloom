"use client";

import { cn } from "@/lib/utils";
import { useWizard } from "../wizard-context";
import type { ArtStyle } from "@/types";

interface StyleOption {
  value: ArtStyle;
  label: string;
  description: string;
  colors: string[];
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    value: "watercolor",
    label: "Watercolor",
    description: "Soft, dreamy illustrations with gentle color washes",
    colors: ["#E8D5E0", "#C9E4DE", "#F7D9C4"],
  },
  {
    value: "cartoon",
    label: "Digital Cartoon",
    description: "Bright, clean lines with vibrant modern style",
    colors: ["#FF6B6B", "#4ECDC4", "#FFE66D"],
  },
  {
    value: "classic",
    label: "Storybook Classic",
    description: "Timeless illustration style like vintage picture books",
    colors: ["#D4A574", "#8B7355", "#F5E6D3"],
  },
  {
    value: "whimsical",
    label: "Whimsical Fantasy",
    description: "Magical and enchanting with fantastical elements",
    colors: ["#9B5DE5", "#F15BB5", "#00BBF9"],
  },
  {
    value: "pastel",
    label: "Soft Pastel",
    description: "Gentle, muted colors with a calming aesthetic",
    colors: ["#FFB5E8", "#B5E8FF", "#E8FFB5"],
  },
  {
    value: "bold",
    label: "Bold & Colorful",
    description: "High contrast with striking, eye-catching colors",
    colors: ["#FF0000", "#00FF00", "#0066FF"],
  },
];

function StyleCard({
  style,
  isSelected,
  onSelect,
}: {
  style: StyleOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left w-full",
        isSelected
          ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200"
          : "border-gray-200 hover:border-gray-300 bg-white"
      )}
    >
      {/* Color Preview */}
      <div className="w-full h-20 rounded-lg overflow-hidden flex mb-3">
        {style.colors.map((color, index) => (
          <div
            key={index}
            className="flex-1 h-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
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
        </div>
      )}

      <span
        className={cn(
          "font-medium",
          isSelected ? "text-primary-700" : "text-gray-900"
        )}
      >
        {style.label}
      </span>
      <span className="text-sm text-gray-500 mt-1">{style.description}</span>
    </button>
  );
}

export function StyleStep() {
  const { data, setData } = useWizard();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <p className="text-gray-600 text-center">
        Choose an art style for your illustrations. This will define the visual
        look of your entire book.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {STYLE_OPTIONS.map((style) => (
          <StyleCard
            key={style.value}
            style={style}
            isSelected={data.artStyle === style.value}
            onSelect={() => setData({ artStyle: style.value })}
          />
        ))}
      </div>

      {!data.artStyle && (
        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          Please select an art style to continue
        </p>
      )}
    </div>
  );
}
