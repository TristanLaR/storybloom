import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { getOptionalAuthenticatedUser } from "../lib/authHelpers";

export const getOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const user = await getOptionalAuthenticatedUser(ctx);
    const order = await ctx.db.get(args.orderId);

    if (!order) return null;

    // Only return the order if the user owns it
    if (!user || order.userId !== user._id) {
      return null;
    }

    return order;
  },
});

export const getOrderInternal = internalQuery({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

export const getUserOrders = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalAuthenticatedUser(ctx);
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getBookOrders = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const user = await getOptionalAuthenticatedUser(ctx);
    if (!user) {
      return [];
    }

    // First verify the user owns the book
    const book = await ctx.db.get(args.bookId);
    if (!book || book.userId !== user._id) {
      return [];
    }

    return await ctx.db
      .query("orders")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .order("desc")
      .collect();
  },
});

export const getOrderByLuluId = internalQuery({
  args: { luluOrderId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_lulu_order", (q) => q.eq("luluOrderId", args.luluOrderId))
      .collect();
  },
});
