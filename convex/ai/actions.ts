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
import {
  moderateContent,
  quickModerationCheck,
  moderateGeneratedStory,
  sanitizeForPrompt,
  detectPromptInjection,
  type ContentToModerate,
} from "../moderation/contentFilter";

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
    // Check for prompt injection in all user inputs
    const allInputs = [
      args.title,
      args.theme,
      args.setting.primary,
      args.setting.additionalNotes || "",
      ...args.characters.map((c) => c.name),
      ...args.characters.map((c) => c.description),
      ...args.characters.map((c) => c.relationship || ""),
    ];

    for (const input of allInputs) {
      const injectionCheck = detectPromptInjection(input);
      if (injectionCheck.detected) {
        throw new Error(
          "Content contains potentially harmful instructions and cannot be processed"
        );
      }
    }

    // Content moderation check before generation
    const contentToModerate: ContentToModerate = {
      title: args.title,
      theme: args.theme,
      settingDescription: args.setting.primary,
      characterNames: args.characters.map((c) => c.name),
      characterDescriptions: args.characters.map((c) => c.description),
    };

    const moderationResult = moderateContent(contentToModerate);
    if (!moderationResult.isApproved) {
      throw new Error(
        `Content moderation failed: ${moderationResult.message || "Content contains inappropriate material"}`
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    // Sanitize user inputs before passing to AI
    const params: GenerateStoryParams = {
      title: sanitizeForPrompt(args.title),
      theme: sanitizeForPrompt(args.theme),
      mood: args.mood,
      artStyle: args.artStyle,
      authorName: args.authorName ? sanitizeForPrompt(args.authorName) : undefined,
      characters: args.characters.map((c) => ({
        name: sanitizeForPrompt(c.name),
        role: c.role,
        description: sanitizeForPrompt(c.description),
        relationship: c.relationship ? sanitizeForPrompt(c.relationship) : undefined,
      })),
      setting: {
        primary: sanitizeForPrompt(args.setting.primary),
        timeOfDay: args.setting.timeOfDay,
        season: args.setting.season,
        additionalNotes: args.setting.additionalNotes
          ? sanitizeForPrompt(args.setting.additionalNotes)
          : undefined,
      },
    };

    const result = await generateStoryWithGemini(params, apiKey);

    // Moderate the generated content before returning
    const generatedModerationResult = moderateGeneratedStory(result.pages);
    if (!generatedModerationResult.isApproved) {
      throw new Error(
        `Generated content failed moderation: ${generatedModerationResult.message || "AI generated inappropriate content"}`
      );
    }

    return result;
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
    // Check for prompt injection
    const injectionCheck = detectPromptInjection(args.prompt);
    if (injectionCheck.detected) {
      throw new Error(
        "Image prompt contains potentially harmful instructions and cannot be processed"
      );
    }

    // Content moderation check for image prompt
    const promptCheck = quickModerationCheck(args.prompt);
    if (!promptCheck.isClean) {
      throw new Error(
        `Image prompt moderation failed: ${promptCheck.reason || "Content contains inappropriate material"}`
      );
    }

    // Also check character descriptions
    for (const char of args.characters) {
      const charInjectionCheck = detectPromptInjection(char.description);
      if (charInjectionCheck.detected) {
        throw new Error(
          "Character description contains potentially harmful instructions"
        );
      }

      const charCheck = quickModerationCheck(char.description);
      if (!charCheck.isClean) {
        throw new Error(
          `Character description moderation failed: ${charCheck.reason || "Content contains inappropriate material"}`
        );
      }
    }

    const apiKey = process.env.NANO_BANANA_API_KEY;
    if (!apiKey) {
      throw new Error("NANO_BANANA_API_KEY environment variable is not set");
    }

    // Sanitize inputs
    const characters: CharacterReference[] = args.characters.map((c) => ({
      name: sanitizeForPrompt(c.name),
      description: sanitizeForPrompt(c.description),
      stylePrompt: c.stylePrompt ? sanitizeForPrompt(c.stylePrompt) : undefined,
    }));

    const result = await generateImageWithNanoBanana(
      {
        prompt: sanitizeForPrompt(args.prompt),
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
    // Check for prompt injection
    const inputs = [args.prompt, args.title, args.authorName || ""];
    for (const input of inputs) {
      const injectionCheck = detectPromptInjection(input);
      if (injectionCheck.detected) {
        throw new Error(
          "Input contains potentially harmful instructions and cannot be processed"
        );
      }
    }

    // Content moderation check for cover prompt
    const promptCheck = quickModerationCheck(args.prompt);
    if (!promptCheck.isClean) {
      throw new Error(
        `Cover prompt moderation failed: ${promptCheck.reason || "Content contains inappropriate material"}`
      );
    }

    const titleCheck = quickModerationCheck(args.title);
    if (!titleCheck.isClean) {
      throw new Error(
        `Title moderation failed: ${titleCheck.reason || "Content contains inappropriate material"}`
      );
    }

    const apiKey = process.env.NANO_BANANA_API_KEY;
    if (!apiKey) {
      throw new Error("NANO_BANANA_API_KEY environment variable is not set");
    }

    const result = await generateCoverImage(
      sanitizeForPrompt(args.prompt),
      args.style,
      sanitizeForPrompt(args.title),
      args.authorName ? sanitizeForPrompt(args.authorName) : undefined,
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
    // Check for prompt injection in description
    const injectionCheck = detectPromptInjection(args.description);
    if (injectionCheck.detected) {
      throw new Error(
        "Description contains potentially harmful instructions"
      );
    }

    // Content moderation check
    const descCheck = quickModerationCheck(args.description);
    if (!descCheck.isClean) {
      throw new Error(
        `Description moderation failed: ${descCheck.reason || "Content contains inappropriate material"}`
      );
    }

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
      sanitizeForPrompt(args.description),
      apiKey
    );

    return { stylePrompt };
  },
});
