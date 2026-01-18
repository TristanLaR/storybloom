import { query } from "../_generated/server";
import { v } from "convex/values";
import { getOptionalAuthenticatedUser } from "../lib/authHelpers";

export const listUserBooks = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalAuthenticatedUser(ctx);
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("books")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getBook = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const user = await getOptionalAuthenticatedUser(ctx);
    const book = await ctx.db.get(args.bookId);

    if (!book) return null;

    // Only return the book if the user owns it
    if (!user || book.userId !== user._id) {
      return null;
    }

    return book;
  },
});

export const getBookWithPages = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const user = await getOptionalAuthenticatedUser(ctx);
    const book = await ctx.db.get(args.bookId);

    if (!book) return null;

    // Only return the book if the user owns it
    if (!user || book.userId !== user._id) {
      return null;
    }

    const pages = await ctx.db
      .query("pages")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .order("asc")
      .collect();

    const characters = await ctx.db
      .query("characters")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .collect();

    return { ...book, pages, characters };
  },
});
