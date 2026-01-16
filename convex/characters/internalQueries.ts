import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

export const getCharactersInternal = internalQuery({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("characters")
      .withIndex("by_book_order", (q: any) => q.eq("bookId", args.bookId))
      .collect();
  },
});
