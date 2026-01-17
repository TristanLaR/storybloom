import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const updateBookStatusInternal = internalMutation({
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

export const updateBookCover = internalMutation({
  args: {
    bookId: v.id("books"),
    coverImageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookId, {
      coverImageId: args.coverImageId,
      updatedAt: Date.now(),
    });
  },
});

export const updateBookCoverPrompt = internalMutation({
  args: {
    bookId: v.id("books"),
    coverPrompt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookId, {
      coverPrompt: args.coverPrompt,
      updatedAt: Date.now(),
    });
  },
});

export const incrementCoverRegenerationCount = internalMutation({
  args: {
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {
    const book = await ctx.db.get(args.bookId);
    if (!book) {
      throw new Error("Book not found");
    }

    await ctx.db.patch(args.bookId, {
      coverRegenerationCount: (book.coverRegenerationCount || 0) + 1,
      updatedAt: Date.now(),
    });
  },
});

export const updateBookTitle = internalMutation({
  args: {
    bookId: v.id("books"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookId, {
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

export const updateBookAuthor = internalMutation({
  args: {
    bookId: v.id("books"),
    authorName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookId, {
      authorName: args.authorName,
      updatedAt: Date.now(),
    });
  },
});

export const updateInteriorPdf = internalMutation({
  args: {
    bookId: v.id("books"),
    interiorPdfId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookId, {
      interiorPdfId: args.interiorPdfId,
      updatedAt: Date.now(),
    });
  },
});

export const updateCoverPdf = internalMutation({
  args: {
    bookId: v.id("books"),
    coverPdfId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookId, {
      coverPdfId: args.coverPdfId,
      updatedAt: Date.now(),
    });
  },
});
