"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { generateStoryWithGemini, type GenerateStoryParams } from "./gemini";

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
