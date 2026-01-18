import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { getOptionalAuthenticatedUser } from "../lib/authHelpers";

export const getBookPages = query({
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
      .query("pages")
      .withIndex("by_book_page", (q) => q.eq("bookId", args.bookId))
      .collect();
  },
});

export const getPage = query({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    const user = await getOptionalAuthenticatedUser(ctx);
    const page = await ctx.db.get(args.pageId);

    if (!page) return null;

    // Verify the user owns the book that contains this page
    const book = await ctx.db.get(page.bookId);
    if (!book || !user || book.userId !== user._id) {
      return null;
    }

    return page;
  },
});

export const getPageInternal = internalQuery({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.pageId);
  },
});

export const getBookPagesInternal = internalQuery({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pages")
      .withIndex("by_book_page", (q) => q.eq("bookId", args.bookId))
      .collect();
  },
});

export const getPageWithImage = query({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    const user = await getOptionalAuthenticatedUser(ctx);
    const page = await ctx.db.get(args.pageId);

    if (!page) return null;

    // Verify the user owns the book that contains this page
    const book = await ctx.db.get(page.bookId);
    if (!book || !user || book.userId !== user._id) {
      return null;
    }

    let imageUrl: string | null = null;
    if (page.imageId) {
      imageUrl = await ctx.storage.getUrl(page.imageId);
    }

    return { ...page, imageUrl };
  },
});

export const getBookPagesWithImages = query({
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

    const pages = await ctx.db
      .query("pages")
      .withIndex("by_book_page", (q) => q.eq("bookId", args.bookId))
      .collect();

    const pagesWithImages = await Promise.all(
      pages.map(async (page) => {
        let imageUrl: string | null = null;
        if (page.imageId) {
          imageUrl = await ctx.storage.getUrl(page.imageId);
        }
        return { ...page, imageUrl };
      })
    );

    return pagesWithImages;
  },
});
