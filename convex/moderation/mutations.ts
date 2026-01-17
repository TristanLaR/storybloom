import { mutation } from "../_generated/server";
import { v } from "convex/values";
import {
  moderateContent,
  quickModerationCheck,
  type ContentToModerate,
} from "./contentFilter";

export const createModerationFlag = mutation({
  args: {
    bookId: v.optional(v.id("books")),
    userId: v.id("users"),
    contentType: v.union(
      v.literal("book_setup"),
      v.literal("character"),
      v.literal("story_text"),
      v.literal("image_prompt"),
      v.literal("generated_content")
    ),
    flaggedContent: v.string(),
    flaggedItems: v.array(v.string()),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    autoBlocked: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("moderationFlags", {
      bookId: args.bookId,
      userId: args.userId,
      contentType: args.contentType,
      flaggedContent: args.flaggedContent,
      flaggedItems: args.flaggedItems,
      severity: args.severity,
      status: args.autoBlocked ? "auto_blocked" : "pending_review",
      createdAt: Date.now(),
    });
  },
});

export const reviewModerationFlag = mutation({
  args: {
    flagId: v.id("moderationFlags"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    reviewedBy: v.string(),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.flagId, {
      status: args.status,
      reviewedBy: args.reviewedBy,
      reviewedAt: Date.now(),
      reviewNotes: args.reviewNotes,
    });
  },
});

// Validate content before generation
export const validateBookSetup = mutation({
  args: {
    userId: v.id("users"),
    bookId: v.optional(v.id("books")),
    title: v.string(),
    theme: v.string(),
    settingDescription: v.string(),
    characterNames: v.array(v.string()),
    characterDescriptions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const content: ContentToModerate = {
      title: args.title,
      theme: args.theme,
      settingDescription: args.settingDescription,
      characterNames: args.characterNames,
      characterDescriptions: args.characterDescriptions,
    };

    const result = moderateContent(content);

    // If flagged, create a moderation record
    if (!result.isApproved || result.requiresReview) {
      await ctx.db.insert("moderationFlags", {
        bookId: args.bookId,
        userId: args.userId,
        contentType: "book_setup",
        flaggedContent: JSON.stringify({
          title: args.title,
          theme: args.theme,
          setting: args.settingDescription,
        }),
        flaggedItems: result.flaggedItems,
        severity: result.severity === "none" ? "low" : result.severity,
        status: result.severity === "high" ? "auto_blocked" : "pending_review",
        createdAt: Date.now(),
      });
    }

    return {
      isApproved: result.isApproved,
      message: result.message,
      severity: result.severity,
    };
  },
});

// Quick validation for individual text inputs
export const validateTextInput = mutation({
  args: {
    text: v.string(),
    inputType: v.string(),
  },
  handler: async (ctx, args) => {
    const result = quickModerationCheck(args.text);
    return {
      isValid: result.isClean,
      reason: result.reason,
    };
  },
});

// Validate image prompt before generation
export const validateImagePrompt = mutation({
  args: {
    userId: v.id("users"),
    bookId: v.optional(v.id("books")),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const result = quickModerationCheck(args.prompt);

    if (!result.isClean) {
      await ctx.db.insert("moderationFlags", {
        bookId: args.bookId,
        userId: args.userId,
        contentType: "image_prompt",
        flaggedContent: args.prompt,
        flaggedItems: [result.reason || "Unknown issue"],
        severity: "medium",
        status: "auto_blocked",
        createdAt: Date.now(),
      });
    }

    return {
      isValid: result.isClean,
      reason: result.reason,
    };
  },
});
