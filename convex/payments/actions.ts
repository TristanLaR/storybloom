"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import Stripe from "stripe";

// Payment amounts in cents
const PAYMENT_AMOUNTS = {
  generation: 499, // $4.99 for book generation
  regeneration: 99, // $0.99 per image regeneration
};

// Initialize Stripe
function getStripe(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }
  return new Stripe(apiKey, { apiVersion: "2025-12-15.clover" });
}

// Create a payment intent for book generation
export const createGenerationPaymentIntent = action({
  args: {
    bookId: v.id("books"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const stripe = getStripe();

    // Get book details
    const book = await ctx.runQuery(internal.books.internalQueries.getBookInternal, {
      bookId: args.bookId,
    });

    if (!book) {
      throw new Error("Book not found");
    }

    // Get user for Stripe customer ID
    const user = await ctx.runQuery(internal.users.queries.getUserInternal, {
      userId: args.userId,
    });

    // Create or get Stripe customer
    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email || undefined,
        name: user?.name || undefined,
        metadata: {
          userId: args.userId,
        },
      });
      customerId = customer.id;

      // Update user with Stripe customer ID
      await ctx.runMutation(internal.users.mutations.updateStripeCustomerId, {
        userId: args.userId,
        stripeCustomerId: customerId,
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: PAYMENT_AMOUNTS.generation,
      currency: "usd",
      customer: customerId,
      metadata: {
        type: "generation",
        bookId: args.bookId,
        userId: args.userId,
      },
      description: `Book generation: ${book.title}`,
    });

    // Create payment record
    await ctx.runMutation(internal.payments.mutations.createPaymentRecord, {
      userId: args.userId,
      bookId: args.bookId,
      type: "generation",
      amount: PAYMENT_AMOUNTS.generation,
      stripePaymentIntentId: paymentIntent.id,
      status: "pending",
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: PAYMENT_AMOUNTS.generation,
    };
  },
});

// Create a payment intent for image regeneration
export const createRegenerationPaymentIntent = action({
  args: {
    bookId: v.id("books"),
    userId: v.id("users"),
    pageId: v.optional(v.id("pages")),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const stripe = getStripe();
    const count = args.count || 1;
    const amount = PAYMENT_AMOUNTS.regeneration * count;

    // Get user for Stripe customer ID
    const user = await ctx.runQuery(internal.users.queries.getUserInternal, {
      userId: args.userId,
    });

    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email || undefined,
        name: user?.name || undefined,
        metadata: {
          userId: args.userId,
        },
      });
      customerId = customer.id;

      await ctx.runMutation(internal.users.mutations.updateStripeCustomerId, {
        userId: args.userId,
        stripeCustomerId: customerId,
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: customerId,
      metadata: {
        type: "regeneration",
        bookId: args.bookId,
        userId: args.userId,
        pageId: args.pageId || "",
        count: String(count),
      },
      description: `Image regeneration (${count}x)`,
    });

    // Create payment record
    await ctx.runMutation(internal.payments.mutations.createPaymentRecord, {
      userId: args.userId,
      bookId: args.bookId,
      type: "regeneration",
      amount,
      stripePaymentIntentId: paymentIntent.id,
      status: "pending",
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
    };
  },
});

// Create a payment intent for print orders
export const createPrintOrderPaymentIntent = action({
  args: {
    orderId: v.id("orders"),
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const stripe = getStripe();

    // Get order details
    const order = await ctx.runQuery(internal.orders.queries.getOrderInternal, {
      orderId: args.orderId,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Get user for Stripe customer ID
    const user = await ctx.runQuery(internal.users.queries.getUserInternal, {
      userId: args.userId,
    });

    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email || undefined,
        name: user?.name || undefined,
        metadata: {
          userId: args.userId,
        },
      });
      customerId = customer.id;

      await ctx.runMutation(internal.users.mutations.updateStripeCustomerId, {
        userId: args.userId,
        stripeCustomerId: customerId,
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: args.amount,
      currency: "usd",
      customer: customerId,
      metadata: {
        type: "print_order",
        orderId: args.orderId,
        userId: args.userId,
        bookId: order.bookId,
      },
      description: `Print order #${args.orderId}`,
      shipping: {
        name: order.shippingAddress.name,
        address: {
          line1: order.shippingAddress.street1,
          line2: order.shippingAddress.street2 || undefined,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postal_code: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
        },
      },
    });

    // Create payment record
    await ctx.runMutation(internal.payments.mutations.createPaymentRecord, {
      userId: args.userId,
      orderId: args.orderId,
      type: "print_order",
      amount: args.amount,
      stripePaymentIntentId: paymentIntent.id,
      status: "pending",
    });

    // Update order with payment intent ID
    await ctx.runMutation(internal.orders.mutations.updateOrderPaymentIntent, {
      orderId: args.orderId,
      stripePaymentIntentId: paymentIntent.id,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: args.amount,
    };
  },
});

// Verify and process webhook event
export const processWebhookEvent = action({
  args: {
    payload: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set");
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        args.payload,
        args.signature,
        webhookSecret
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${(err as Error).message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        await ctx.runMutation(internal.payments.mutations.updatePaymentStatus, {
          stripePaymentIntentId: paymentIntent.id,
          status: "succeeded",
        });

        // Handle based on payment type
        const metadata = paymentIntent.metadata;

        if (metadata.type === "print_order" && metadata.orderId) {
          await ctx.runMutation(internal.orders.mutations.updateOrderStatus, {
            orderId: metadata.orderId as any,
            status: "paid",
          });
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        await ctx.runMutation(internal.payments.mutations.updatePaymentStatus, {
          stripePaymentIntentId: paymentIntent.id,
          status: "failed",
        });

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;

        if (charge.payment_intent) {
          await ctx.runMutation(internal.payments.mutations.updatePaymentStatus, {
            stripePaymentIntentId: charge.payment_intent as string,
            status: "refunded",
          });
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  },
});
