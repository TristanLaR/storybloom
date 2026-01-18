import { query } from "../_generated/server";
import { v } from "convex/values";
import { getOptionalAuthenticatedUser } from "../lib/authHelpers";

export const getBookCharacters = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const user = await getOptionalAuthenticatedUser(ctx);
    if (!user) {
      return [];
    }

    // Verify the user owns the book
    const book = await ctx.db.get(args.bookId);
    if (!book || book.userId !== user._id) {
      return [];
    }

    return await ctx.db
      .query("characters")
      .withIndex("by_book_order", (q) => q.eq("bookId", args.bookId))
      .collect();
  },
});

export const getCharacter = query({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    const user = await getOptionalAuthenticatedUser(ctx);
    const character = await ctx.db.get(args.characterId);

    if (!character) return null;

    // Verify the user owns the book that contains this character
    const book = await ctx.db.get(character.bookId);
    if (!book || !user || book.userId !== user._id) {
      return null;
    }

    return character;
  },
});
