"use client";

import { Input } from "@/components/ui/input";
import { useWizard } from "../wizard-context";

export function TitleStep() {
  const { data, setData } = useWizard();

  return (
    <div className="max-w-md mx-auto space-y-6">
      <p className="text-gray-600 text-center">
        What would you like to call your book? Don&apos;t worry, you can change
        this later.
      </p>

      <Input
        label="Book Title"
        placeholder="My Amazing Adventure"
        value={data.title}
        onChange={(e) => setData({ title: e.target.value })}
        className="text-lg"
      />

      <Input
        label="Author Name (optional)"
        placeholder="Written by..."
        value={data.authorName || ""}
        onChange={(e) => setData({ authorName: e.target.value })}
      />
    </div>
  );
}
