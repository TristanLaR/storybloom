"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  status: SaveStatus;
  lastSaved: Date | null;
  error: Error | null;
  save: () => Promise<void>;
  reset: () => void;
}

export function useAutoSave<T>({
  data,
  onSave,
  debounceMs = 2000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<T>(data);
  const savedDataRef = useRef<T>(data);
  const isSavingRef = useRef(false);

  // Serialize data for comparison
  const serializeData = useCallback((d: T): string => {
    try {
      return JSON.stringify(d);
    } catch {
      return String(d);
    }
  }, []);

  // Check if data has changed from last saved version
  const hasChanges = useCallback(() => {
    return serializeData(data) !== serializeData(savedDataRef.current);
  }, [data, serializeData]);

  // Save function
  const save = useCallback(async () => {
    if (isSavingRef.current) return;
    if (!hasChanges()) {
      setStatus("saved");
      return;
    }

    isSavingRef.current = true;
    setStatus("saving");
    setError(null);

    try {
      await onSave(data);
      savedDataRef.current = data;
      setLastSaved(new Date());
      setStatus("saved");
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to save"));
      setStatus("error");
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave, hasChanges]);

  // Reset to idle status after saved
  useEffect(() => {
    if (status === "saved") {
      const timer = setTimeout(() => {
        setStatus("idle");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Auto-save effect
  useEffect(() => {
    if (!enabled) return;

    // Check if data actually changed
    const currentSerialized = serializeData(data);
    const lastSerialized = serializeData(lastDataRef.current);

    if (currentSerialized === lastSerialized) return;

    lastDataRef.current = data;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only mark as pending if there are actual changes from saved version
    if (hasChanges()) {
      setStatus("pending");

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        save();
      }, debounceMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, debounceMs, enabled, save, serializeData, hasChanges]);

  // Save on unmount if there are pending changes
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Trigger immediate save on unmount if there are changes
      if (hasChanges() && !isSavingRef.current) {
        onSave(lastDataRef.current).catch(console.error);
      }
    };
  }, [onSave, hasChanges]);

  // Reset function
  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setStatus("idle");
    setError(null);
    savedDataRef.current = data;
    lastDataRef.current = data;
  }, [data]);

  return {
    status,
    lastSaved,
    error,
    save,
    reset,
  };
}

// Helper hook for tracking page changes specifically
interface PageData {
  textContent: string;
  textPosition: string;
  fontSize?: number;
  imagePrompt?: string;
}

interface UsePageAutoSaveOptions {
  pageId: string;
  pageData: PageData;
  onSave: (pageId: string, data: PageData) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

export function usePageAutoSave({
  pageId,
  pageData,
  onSave,
  debounceMs = 2000,
  enabled = true,
}: UsePageAutoSaveOptions): UseAutoSaveReturn {
  const handleSave = useCallback(
    async (data: PageData) => {
      await onSave(pageId, data);
    },
    [pageId, onSave]
  );

  return useAutoSave({
    data: pageData,
    onSave: handleSave,
    debounceMs,
    enabled,
  });
}
