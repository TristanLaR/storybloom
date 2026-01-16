"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useWizard, Character } from "../wizard-context";
import type { CharacterRole } from "@/types";

const MAX_CHARACTERS = 4;

function CharacterCard({
  character,
  onEdit,
  onDelete,
}: {
  character: Character;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
        {character.referenceImagePreview ? (
          <img
            src={character.referenceImagePreview}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-8 h-8"
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
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{character.name}</h4>
            <span
              className={cn(
                "inline-block px-2 py-0.5 text-xs rounded-full mt-1",
                character.role === "main"
                  ? "bg-primary-100 text-primary-700"
                  : "bg-gray-200 text-gray-600"
              )}
            >
              {character.role === "main" ? "Main Character" : "Supporting"}
            </span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
        {character.description && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
            {character.description}
          </p>
        )}
      </div>
    </div>
  );
}

function CharacterForm({
  character,
  onSave,
  onCancel,
}: {
  character?: Character;
  onSave: (character: Character) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Character>>(
    character || {
      id: crypto.randomUUID(),
      name: "",
      role: "main",
      description: "",
    }
  );
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    character?.referenceImagePreview
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, referenceImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name) {
      onSave({
        ...formData,
        referenceImagePreview: imagePreview,
      } as Character);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-xl">
      <div className="flex gap-4">
        {/* Image Upload */}
        <div className="flex-shrink-0">
          <label className="block w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-400 cursor-pointer overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs mt-1">Photo</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex-1 space-y-3">
          <Input
            placeholder="Character name"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                checked={formData.role === "main"}
                onChange={() =>
                  setFormData({ ...formData, role: "main" as CharacterRole })
                }
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm">Main</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                checked={formData.role === "supporting"}
                onChange={() =>
                  setFormData({ ...formData, role: "supporting" as CharacterRole })
                }
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm">Supporting</span>
            </label>
          </div>
        </div>
      </div>

      <textarea
        placeholder="Describe this character's personality, traits, and notable features..."
        value={formData.description || ""}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!formData.name}>
          {character ? "Save Changes" : "Add Character"}
        </Button>
      </div>
    </form>
  );
}

export function CharactersStep() {
  const { data, setData } = useWizard();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const canAddMore = data.characters.length < MAX_CHARACTERS;

  const handleAddCharacter = (character: Character) => {
    setData({ characters: [...data.characters, character] });
    setIsAddingNew(false);
  };

  const handleUpdateCharacter = (updatedCharacter: Character) => {
    setData({
      characters: data.characters.map((c) =>
        c.id === updatedCharacter.id ? updatedCharacter : c
      ),
    });
    setEditingId(null);
  };

  const handleDeleteCharacter = (id: string) => {
    setData({ characters: data.characters.filter((c) => c.id !== id) });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <p className="text-gray-600 text-center">
        Add characters for your story. You can add up to {MAX_CHARACTERS} characters.
        Upload a reference photo to help our AI capture their appearance.
      </p>

      {/* Character List */}
      <div className="space-y-3">
        {data.characters.map((character) =>
          editingId === character.id ? (
            <CharacterForm
              key={character.id}
              character={character}
              onSave={handleUpdateCharacter}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <CharacterCard
              key={character.id}
              character={character}
              onEdit={() => setEditingId(character.id)}
              onDelete={() => handleDeleteCharacter(character.id)}
            />
          )
        )}

        {/* Add New Form */}
        {isAddingNew ? (
          <CharacterForm
            onSave={handleAddCharacter}
            onCancel={() => setIsAddingNew(false)}
          />
        ) : (
          canAddMore && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
            >
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Character
            </button>
          )
        )}
      </div>

      {/* Character count */}
      <p className="text-sm text-center text-gray-500">
        {data.characters.length} of {MAX_CHARACTERS} characters added
      </p>

      {data.characters.length === 0 && (
        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          Please add at least one character to continue
        </p>
      )}
    </div>
  );
}
