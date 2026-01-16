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
