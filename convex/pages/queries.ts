import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";

export const getBookPages = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pages")
      .withIndex("by_book_page", (q: any) => q.eq("bookId", args.bookId))
      .collect();
  },
});

export const getPage = query({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.pageId);
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
      .withIndex("by_book_page", (q: any) => q.eq("bookId", args.bookId))
      .collect();
  },
});

export const getPageWithImage = query({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    const page = await ctx.db.get(args.pageId);
    if (!page) return null;

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
    const pages = await ctx.db
      .query("pages")
      .withIndex("by_book_page", (q: any) => q.eq("bookId", args.bookId))
      .collect();

    const pagesWithImages = await Promise.all(
      pages.map(async (page: any) => {
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
