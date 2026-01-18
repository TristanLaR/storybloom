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

// Generate a unique idempotency key
function generateIdempotencyKey(
  type: string,
  userId: string,
  resourceId: string,
  timestamp?: number
): string {
  const ts = timestamp || Date.now();
  return `${type}_${userId}_${resourceId}_${ts}`;
}

// Helper to get authenticated user from email
async function getAuthenticatedUserFromEmail(
  ctx: { runQuery: (ref: any, args: any) => Promise<any> },
  email: string | undefined
) {
  if (!email) {
    throw new Error("Authentication required");
  }

  const user = await ctx.runQuery(internal.users.queries.getUserByEmailInternal, {
    email,
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

// Create a payment intent for book generation
export const createGenerationPaymentIntent = action({
  args: {
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await getAuthenticatedUserFromEmail(ctx, identity.email);
    const stripe = getStripe();

    // Get book details and verify ownership
    const book = await ctx.runQuery(internal.books.internalQueries.getBookInternal, {
      bookId: args.bookId,
    });

    if (!book) {
      throw new Error("Book not found");
    }

    if (book.userId !== user._id) {
      throw new Error("You don't have permission to access this book");
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: {
          userId: user._id,
        },
      });
      customerId = customer.id;

      // Update user with Stripe customer ID
      await ctx.runMutation(internal.users.mutations.updateStripeCustomerId, {
        userId: user._id,
        stripeCustomerId: customerId,
      });
    }

    // Generate idempotency key to prevent duplicate payments
    const idempotencyKey = generateIdempotencyKey("generation", user._id, args.bookId);

    // Create payment intent with idempotency key
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: PAYMENT_AMOUNTS.generation,
        currency: "usd",
        customer: customerId,
        metadata: {
          type: "generation",
          bookId: args.bookId,
          userId: user._id,
        },
        description: `Book generation: ${book.title}`,
      },
      {
        idempotencyKey,
      }
    );

    // Create payment record
    await ctx.runMutation(internal.payments.mutations.createPaymentRecord, {
      userId: user._id,
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
    pageId: v.optional(v.id("pages")),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await getAuthenticatedUserFromEmail(ctx, identity.email);
    const stripe = getStripe();
    const count = args.count || 1;
    const amount = PAYMENT_AMOUNTS.regeneration * count;

    // Verify book ownership
    const book = await ctx.runQuery(internal.books.internalQueries.getBookInternal, {
      bookId: args.bookId,
    });

    if (!book || book.userId !== user._id) {
      throw new Error("You don't have permission to access this book");
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: {
          userId: user._id,
        },
      });
      customerId = customer.id;

      await ctx.runMutation(internal.users.mutations.updateStripeCustomerId, {
        userId: user._id,
        stripeCustomerId: customerId,
      });
    }

    // Generate idempotency key
    const resourceId = args.pageId || args.bookId;
    const idempotencyKey = generateIdempotencyKey("regeneration", user._id, resourceId);

    // Create payment intent with idempotency key
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: "usd",
        customer: customerId,
        metadata: {
          type: "regeneration",
          bookId: args.bookId,
          userId: user._id,
          pageId: args.pageId || "",
          count: String(count),
        },
        description: `Image regeneration (${count}x)`,
      },
      {
        idempotencyKey,
      }
    );

    // Create payment record
    await ctx.runMutation(internal.payments.mutations.createPaymentRecord, {
      userId: user._id,
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await getAuthenticatedUserFromEmail(ctx, identity.email);
    const stripe = getStripe();

    // Get order details and verify ownership
    const order = await ctx.runQuery(internal.orders.queries.getOrderInternal, {
      orderId: args.orderId,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.userId !== user._id) {
      throw new Error("You don't have permission to access this order");
    }

    // Use the server-calculated total amount from the order (not from client)
    const amount = order.totalAmount;

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: {
          userId: user._id,
        },
      });
      customerId = customer.id;

      await ctx.runMutation(internal.users.mutations.updateStripeCustomerId, {
        userId: user._id,
        stripeCustomerId: customerId,
      });
    }

    // Generate idempotency key for the order
    const idempotencyKey = generateIdempotencyKey("print_order", user._id, args.orderId);

    // Create payment intent with idempotency key
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: "usd",
        customer: customerId,
        metadata: {
          type: "print_order",
          orderId: args.orderId,
          userId: user._id,
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
      },
      {
        idempotencyKey,
      }
    );

    // Create payment record
    await ctx.runMutation(internal.payments.mutations.createPaymentRecord, {
      userId: user._id,
      orderId: args.orderId,
      type: "print_order",
      amount,
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
      amount,
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
