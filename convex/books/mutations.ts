import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createBook = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    theme: v.string(),
    themeCategory: v.optional(
      v.union(
        v.literal("adventure"),
        v.literal("friendship"),
        v.literal("family"),
        v.literal("learning"),
        v.literal("bedtime"),
        v.literal("custom")
      )
    ),
    artStyle: v.union(
      v.literal("watercolor"),
      v.literal("cartoon"),
      v.literal("classic"),
      v.literal("whimsical"),
      v.literal("pastel"),
      v.literal("bold")
    ),
    setting: v.object({
      primary: v.string(),
      timeOfDay: v.optional(v.string()),
      season: v.optional(v.string()),
      additionalNotes: v.optional(v.string()),
    }),
    mood: v.union(
      v.literal("lighthearted"),
      v.literal("gentle"),
      v.literal("exciting"),
      v.literal("educational")
    ),
    authorName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("books", {
      ...args,
      status: "setup",
      generationCreditsUsed: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateBook = mutation({
  args: {
    bookId: v.id("books"),
    title: v.optional(v.string()),
    theme: v.optional(v.string()),
    authorName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { bookId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    await ctx.db.patch(bookId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const updateBookStatus = mutation({
  args: {
    bookId: v.id("books"),
    status: v.union(
      v.literal("setup"),
      v.literal("generating"),
      v.literal("draft"),
      v.literal("finalized"),
      v.literal("ordered")
    ),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.status === "finalized") {
      updates.finalizedAt = Date.now();
    }

    await ctx.db.patch(args.bookId, updates);
  },
});

export const deleteBook = mutation({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    // Delete associated pages
    const pages = await ctx.db
      .query("pages")
      .withIndex("by_book", (q: any) => q.eq("bookId", args.bookId))
      .collect();

    for (const page of pages) {
      await ctx.db.delete(page._id);
    }

    // Delete associated characters
    const characters = await ctx.db
      .query("characters")
      .withIndex("by_book", (q: any) => q.eq("bookId", args.bookId))
      .collect();

    for (const character of characters) {
      await ctx.db.delete(character._id);
    }

    // Delete the book
    await ctx.db.delete(args.bookId);
  },
});
