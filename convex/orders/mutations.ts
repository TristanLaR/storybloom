import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const createOrder = mutation({
  args: {
    bookId: v.id("books"),
    userId: v.id("users"),
    quantity: v.number(),
    shippingAddress: v.object({
      name: v.string(),
      street1: v.string(),
      street2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      postalCode: v.string(),
      country: v.string(),
      phone: v.optional(v.string()),
    }),
    shippingMethod: v.string(),
    printCost: v.number(),
    shippingCost: v.number(),
    taxAmount: v.number(),
    totalAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("orders", {
      ...args,
      status: "pending_payment",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateOrderStatus = internalMutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending_payment"),
      v.literal("paid"),
      v.literal("submitted_to_lulu"),
      v.literal("printing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const updateOrderPaymentIntent = internalMutation({
  args: {
    orderId: v.id("orders"),
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      stripePaymentIntentId: args.stripePaymentIntentId,
      updatedAt: Date.now(),
    });
  },
});

export const updateOrderLuluIds = internalMutation({
  args: {
    orderId: v.id("orders"),
    luluOrderId: v.optional(v.string()),
    luluPrintJobId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.luluOrderId) {
      updates.luluOrderId = args.luluOrderId;
    }
    if (args.luluPrintJobId) {
      updates.luluPrintJobId = args.luluPrintJobId;
    }

    await ctx.db.patch(args.orderId, updates);
  },
});

export const updateOrderTracking = internalMutation({
  args: {
    orderId: v.id("orders"),
    trackingNumber: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.trackingNumber) {
      updates.trackingNumber = args.trackingNumber;
    }
    if (args.trackingUrl) {
      updates.trackingUrl = args.trackingUrl;
    }

    await ctx.db.patch(args.orderId, updates);
  },
});

export const cancelOrder = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    // Only allow cancellation for certain statuses
    if (!["pending_payment", "paid"].includes(order.status)) {
      throw new Error("Order cannot be cancelled at this stage");
    }

    await ctx.db.patch(args.orderId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });
  },
});
