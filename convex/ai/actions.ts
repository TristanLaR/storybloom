"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { generateStoryWithGemini, type GenerateStoryParams } from "./gemini";
import {
  generateImageWithNanoBanana,
  generateCoverImage,
  extractCharacterStyle,
  PRINT_DIMENSIONS,
  type CharacterReference,
} from "./nanoBanana";

export const generateStory = action({
  args: {
    title: v.string(),
    theme: v.string(),
    mood: v.string(),
    artStyle: v.string(),
    authorName: v.optional(v.string()),
    characters: v.array(
      v.object({
        name: v.string(),
        role: v.union(v.literal("main"), v.literal("supporting")),
        description: v.string(),
        relationship: v.optional(v.string()),
      })
    ),
    setting: v.object({
      primary: v.string(),
      timeOfDay: v.optional(v.string()),
      season: v.optional(v.string()),
      additionalNotes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    const params: GenerateStoryParams = {
      title: args.title,
      theme: args.theme,
      mood: args.mood,
      artStyle: args.artStyle,
      authorName: args.authorName,
      characters: args.characters,
      setting: args.setting,
    };

    return await generateStoryWithGemini(params, apiKey);
  },
});

export const generateImage = action({
  args: {
    prompt: v.string(),
    style: v.string(),
    characters: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        stylePrompt: v.optional(v.string()),
      })
    ),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.NANO_BANANA_API_KEY;
    if (!apiKey) {
      throw new Error("NANO_BANANA_API_KEY environment variable is not set");
    }

    const characters: CharacterReference[] = args.characters.map(
      (c: { name: string; description: string; stylePrompt?: string }) => ({
        name: c.name,
        description: c.description,
        stylePrompt: c.stylePrompt,
      })
    );

    const result = await generateImageWithNanoBanana(
      {
        prompt: args.prompt,
        style: args.style,
        characters,
        dimensions: {
          width: args.width || PRINT_DIMENSIONS.width,
          height: args.height || PRINT_DIMENSIONS.height,
        },
      },
      apiKey
    );

    // If we have image data, store it in Convex
    if (result.imageData) {
      const blob = new Blob([result.imageData], { type: "image/png" });
      const storageId = await ctx.storage.store(blob);
      return {
        storageId,
        width: result.width,
        height: result.height,
      };
    }

    return {
      imageUrl: result.imageUrl,
      width: result.width,
      height: result.height,
    };
  },
});

export const generateBookCover = action({
  args: {
    prompt: v.string(),
    style: v.string(),
    title: v.string(),
    authorName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.NANO_BANANA_API_KEY;
    if (!apiKey) {
      throw new Error("NANO_BANANA_API_KEY environment variable is not set");
    }

    const result = await generateCoverImage(
      args.prompt,
      args.style,
      args.title,
      args.authorName,
      apiKey
    );

    // Store the cover image in Convex
    if (result.imageData) {
      const blob = new Blob([result.imageData], { type: "image/png" });
      const storageId = await ctx.storage.store(blob);
      return {
        storageId,
        width: result.width,
        height: result.height,
      };
    }

    return {
      imageUrl: result.imageUrl,
      width: result.width,
      height: result.height,
    };
  },
});

export const analyzeCharacterImage = action({
  args: {
    imageUrl: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.NANO_BANANA_API_KEY;
    if (!apiKey) {
      throw new Error("NANO_BANANA_API_KEY environment variable is not set");
    }

    // Fetch the image
    const response = await fetch(args.imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const imageBuffer = await response.arrayBuffer();

    const stylePrompt = await extractCharacterStyle(
      imageBuffer,
      args.description,
      apiKey
    );

    return { stylePrompt };
  },
});
