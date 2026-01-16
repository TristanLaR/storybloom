import { query } from "../_generated/server";
import { v } from "convex/values";

export const listUserBooks = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("books")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getBook = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bookId);
  },
});

export const getBookWithPages = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const book = await ctx.db.get(args.bookId);
    if (!book) return null;

    const pages = await ctx.db
      .query("pages")
      .withIndex("by_book", (q: any) => q.eq("bookId", args.bookId))
      .order("asc")
      .collect();

    const characters = await ctx.db
      .query("characters")
      .withIndex("by_book", (q: any) => q.eq("bookId", args.bookId))
      .collect();

    return { ...book, pages, characters };
  },
});
