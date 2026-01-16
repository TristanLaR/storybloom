"use client";

import { Input } from "@/components/ui/input";
import { useWizard } from "../wizard-context";

const MAX_TITLE_LENGTH = 60;

export function TitleStep() {
  const { data, setData } = useWizard();

  const titleLength = data.title.length;
  const isOverLimit = titleLength > MAX_TITLE_LENGTH;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <p className="text-gray-600 text-center">
        What would you like to call your book? Don&apos;t worry, you can change
        this later.
      </p>

      <div className="space-y-2">
        <Input
          label="Book Title"
          placeholder="My Amazing Adventure"
          value={data.title}
          onChange={(e) => setData({ title: e.target.value })}
          className="text-lg"
          error={isOverLimit ? `Title is too long` : undefined}
        />
        <div className="flex justify-end">
          <span
            className={`text-sm ${
              isOverLimit ? "text-red-500" : "text-gray-400"
            }`}
          >
            {titleLength}/{MAX_TITLE_LENGTH}
          </span>
        </div>
      </div>

      <Input
        label="Author Name (optional)"
        placeholder="Written by..."
        value={data.authorName || ""}
        onChange={(e) => setData({ authorName: e.target.value })}
      />

      {!data.title && (
        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          Please enter a title to continue
        </p>
      )}
    </div>
  );
}
