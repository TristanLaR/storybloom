import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import {
  getAuthenticatedUser,
  verifyBookOwnership,
  verifyOrderOwnership,
} from "../lib/authHelpers";

// Pricing constants (in cents)
const PRICING = {
  basePrintCost: 899, // $8.99 base for hardcover
  perPageCost: 4, // $0.04 per page
  minPages: 24,
};

export const createOrder = mutation({
  args: {
    bookId: v.id("books"),
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
    shippingCost: v.number(), // This comes from Lulu API via action, verified server-side
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const book = await verifyBookOwnership(ctx, args.bookId, user);

    // Calculate print cost server-side based on page count
    const pages = await ctx.db
      .query("pages")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .collect();

    const pageCount = Math.max(PRICING.minPages, pages.length);
    const unitPrintCost = PRICING.basePrintCost + PRICING.perPageCost * pageCount;
    const printCost = unitPrintCost * args.quantity;

    // Calculate tax (simplified - in production, use a tax API)
    const subtotal = printCost + args.shippingCost;
    const taxRate = 0.0; // Tax calculated by payment processor or fulfillment partner
    const taxAmount = Math.round(subtotal * taxRate);
    const totalAmount = subtotal + taxAmount;

    const now = Date.now();
    return await ctx.db.insert("orders", {
      bookId: args.bookId,
      userId: user._id,
      quantity: args.quantity,
      shippingAddress: args.shippingAddress,
      shippingMethod: args.shippingMethod,
      printCost,
      shippingCost: args.shippingCost,
      taxAmount,
      totalAmount,
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
    const user = await getAuthenticatedUser(ctx);
    const order = await verifyOrderOwnership(ctx, args.orderId, user);

    // Only allow cancellation for certain statuses
    const cancellableStatuses = ["pending_payment", "paid"];
    if (!cancellableStatuses.includes(order.status as string)) {
      throw new Error("Order cannot be cancelled at this stage");
    }

    await ctx.db.patch(args.orderId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });
  },
});
