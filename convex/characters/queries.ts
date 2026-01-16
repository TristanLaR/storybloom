import { query } from "../_generated/server";
import { v } from "convex/values";

export const getBookCharacters = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("characters")
      .withIndex("by_book_order", (q: any) => q.eq("bookId", args.bookId))
      .collect();
  },
});

export const getCharacter = query({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.characterId);
  },
});
