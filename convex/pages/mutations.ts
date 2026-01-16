import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";

export const createPage = internalMutation({
  args: {
    bookId: v.id("books"),
    pageNumber: v.number(),
    pageType: v.union(
      v.literal("title"),
      v.literal("story"),
      v.literal("back_cover")
    ),
    textContent: v.string(),
    textPosition: v.union(
      v.literal("top"),
      v.literal("middle"),
      v.literal("bottom")
    ),
    imagePrompt: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("pages", {
      ...args,
      imageGenerationCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updatePageImage = internalMutation({
  args: {
    pageId: v.id("pages"),
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.pageId, {
      imageId: args.imageId,
      updatedAt: Date.now(),
    });
  },
});

export const updatePagePrompt = internalMutation({
  args: {
    pageId: v.id("pages"),
    imagePrompt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.pageId, {
      imagePrompt: args.imagePrompt,
      updatedAt: Date.now(),
    });
  },
});

export const incrementRegenerationCount = internalMutation({
  args: {
    pageId: v.id("pages"),
  },
  handler: async (ctx, args) => {
    const page = await ctx.db.get(args.pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    await ctx.db.patch(args.pageId, {
      imageGenerationCount: page.imageGenerationCount + 1,
      updatedAt: Date.now(),
    });
  },
});

export const updatePageText = mutation({
  args: {
    pageId: v.id("pages"),
    textContent: v.string(),
    textPosition: v.optional(
      v.union(v.literal("top"), v.literal("middle"), v.literal("bottom"))
    ),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      textContent: args.textContent,
      updatedAt: Date.now(),
    };

    if (args.textPosition) {
      updates.textPosition = args.textPosition;
    }

    await ctx.db.patch(args.pageId, updates);
  },
});

export const deletePage = mutation({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.pageId);
  },
});
