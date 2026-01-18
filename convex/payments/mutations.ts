import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const createPaymentRecord = internalMutation({
  args: {
    userId: v.id("users"),
    bookId: v.optional(v.id("books")),
    orderId: v.optional(v.id("orders")),
    type: v.union(
      v.literal("generation"),
      v.literal("print_order"),
      v.literal("regeneration")
    ),
    amount: v.number(),
    stripePaymentIntentId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("refunded")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("payments", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updatePaymentStatus = internalMutation({
  args: {
    stripePaymentIntentId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("refunded")
    ),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_stripe", (q) => q.eq("stripePaymentIntentId", args.stripePaymentIntentId))
      .first();

    if (payment) {
      await ctx.db.patch(payment._id, {
        status: args.status,
      });
    }
  },
});

export const getPaymentByIntentId = internalMutation({
  args: {
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_stripe", (q) => q.eq("stripePaymentIntentId", args.stripePaymentIntentId))
      .first();
  },
});
