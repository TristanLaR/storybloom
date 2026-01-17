"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import {
  createLuluClient,
  LULU_PRODUCT_SPECS,
  SHIPPING_OPTIONS,
  mapLuluStatusToOrderStatus,
  type LuluAddress,
  type LuluShippingMethod,
  type LuluPrintJobStatus,
} from "./client";

// Calculate shipping costs for all available methods
export const calculateShippingOptions = action({
  args: {
    address: v.object({
      name: v.string(),
      street1: v.string(),
      street2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      postalCode: v.string(),
      country: v.string(),
      phone: v.optional(v.string()),
    }),
    quantity: v.number(),
    pageCount: v.number(),
  },
  handler: async (ctx, args) => {
    const client = createLuluClient();

    const luluAddress: LuluAddress = {
      name: args.address.name,
      street1: args.address.street1,
      street2: args.address.street2,
      city: args.address.city,
      state_code: args.address.state,
      postal_code: args.address.postalCode,
      country_code: args.address.country,
      phone_number: args.address.phone,
    };

    const lineItems = [
      {
        pod_package_id: LULU_PRODUCT_SPECS.productId,
        quantity: args.quantity,
      },
    ];

    try {
      const shippingOptions = await client.getShippingOptions(luluAddress, lineItems);

      return shippingOptions.map((option) => {
        const optionInfo = SHIPPING_OPTIONS.find(
          (o) => o.level === option.shipping_level
        );

        return {
          level: option.shipping_level,
          name: optionInfo?.name || option.shipping_level,
          cost: parseFloat(option.total_cost_incl_tax) * 100, // Convert to cents
          currency: option.currency,
          estimatedDelivery: option.estimated_delivery_dates,
        };
      });
    } catch (error) {
      console.error("Failed to get shipping options:", error);
      throw new Error("Unable to calculate shipping. Please try again.");
    }
  },
});

// Calculate print cost for a book
export const calculatePrintCost = action({
  args: {
    quantity: v.number(),
    pageCount: v.number(),
  },
  handler: async (ctx, args) => {
    // Lulu pricing (approximate - actual pricing from API)
    // Base cost for hardcover square book + per-page cost
    const baseCost = 899; // $8.99 base in cents
    const perPageCost = 4; // $0.04 per page in cents
    const totalPages = Math.max(24, args.pageCount); // Minimum 24 pages

    const unitCost = baseCost + perPageCost * totalPages;
    const totalCost = unitCost * args.quantity;

    return {
      unitCost,
      totalCost,
      quantity: args.quantity,
      pageCount: totalPages,
    };
  },
});

// Submit print order to Lulu
export const submitPrintOrder = action({
  args: {
    orderId: v.id("orders"),
    bookId: v.id("books"),
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const client = createLuluClient();

    // Get the order
    const order = await ctx.runQuery(internal.orders.queries.getOrderInternal, {
      orderId: args.orderId,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Get the book
    const book = await ctx.runQuery(internal.books.internalQueries.getBookInternal, {
      bookId: args.bookId,
    });

    if (!book) {
      throw new Error("Book not found");
    }

    // Get PDF URLs
    let interiorPdfUrl: string | null = null;
    let coverPdfUrl: string | null = null;

    if (book.interiorPdfId) {
      interiorPdfUrl = await ctx.storage.getUrl(book.interiorPdfId);
    }
    if (book.coverPdfId) {
      coverPdfUrl = await ctx.storage.getUrl(book.coverPdfId);
    }

    if (!interiorPdfUrl || !coverPdfUrl) {
      throw new Error("PDFs not generated. Please generate PDFs before ordering.");
    }

    // Upload PDFs to Lulu if needed (Lulu accepts URLs directly too)
    // For now, we'll use the Convex storage URLs directly

    // Prepare Lulu address
    const luluAddress: LuluAddress = {
      name: order.shippingAddress.name,
      street1: order.shippingAddress.street1,
      street2: order.shippingAddress.street2,
      city: order.shippingAddress.city,
      state_code: order.shippingAddress.state,
      postal_code: order.shippingAddress.postalCode,
      country_code: order.shippingAddress.country,
      phone_number: order.shippingAddress.phone,
      email: args.userEmail,
    };

    try {
      // Create print job with Lulu
      const luluOrder = await client.createOrder({
        external_id: args.orderId,
        contact_email: args.userEmail,
        shipping_address: luluAddress,
        shipping_level: order.shippingMethod as LuluShippingMethod,
        line_items: [
          {
            external_id: args.bookId,
            title: book.title,
            cover: {
              source_url: coverPdfUrl,
            },
            interior: {
              source_url: interiorPdfUrl,
            },
            pod_package_id: LULU_PRODUCT_SPECS.productId,
            quantity: order.quantity,
          },
        ],
      });

      // Update order with Lulu IDs
      await ctx.runMutation(internal.orders.mutations.updateOrderLuluIds, {
        orderId: args.orderId,
        luluOrderId: String(luluOrder.id),
        luluPrintJobId: String(luluOrder.id),
      });

      // Update order status
      await ctx.runMutation(internal.orders.mutations.updateOrderStatus, {
        orderId: args.orderId,
        status: "submitted_to_lulu",
      });

      return {
        success: true,
        luluOrderId: luluOrder.id,
        estimatedShipDate: luluOrder.estimated_ship_date,
      };
    } catch (error) {
      console.error("Failed to submit order to Lulu:", error);
      throw new Error("Failed to submit print order. Please try again.");
    }
  },
});

// Check order status from Lulu
export const checkOrderStatus = action({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const client = createLuluClient();

    // Get the order
    const order = await ctx.runQuery(internal.orders.queries.getOrderInternal, {
      orderId: args.orderId,
    });

    if (!order || !order.luluOrderId) {
      throw new Error("Order not found or not submitted to Lulu");
    }

    try {
      const luluOrder = await client.getOrder(parseInt(order.luluOrderId));

      // Map Lulu status to our internal status
      const internalStatus = mapLuluStatusToOrderStatus(
        luluOrder.status.name as LuluPrintJobStatus
      );

      // Update order status if changed
      if (order.status !== internalStatus) {
        await ctx.runMutation(internal.orders.mutations.updateOrderStatus, {
          orderId: args.orderId,
          status: internalStatus,
        });
      }

      // Update tracking info if available
      const lineItem = luluOrder.line_items[0];
      if (lineItem?.tracking_id || lineItem?.tracking_urls?.length) {
        await ctx.runMutation(internal.orders.mutations.updateOrderTracking, {
          orderId: args.orderId,
          trackingNumber: lineItem.tracking_id,
          trackingUrl: lineItem.tracking_urls?.[0],
        });
      }

      return {
        status: luluOrder.status.name,
        internalStatus,
        estimatedShipDate: luluOrder.estimated_ship_date,
        trackingNumber: lineItem?.tracking_id,
        trackingUrl: lineItem?.tracking_urls?.[0],
      };
    } catch (error) {
      console.error("Failed to check order status:", error);
      throw new Error("Failed to get order status from Lulu.");
    }
  },
});

// Process Lulu webhook event
export const processLuluWebhook = action({
  args: {
    event: v.object({
      event_type: v.string(),
      print_job_id: v.number(),
      timestamp: v.string(),
      data: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    // Find the order by Lulu print job ID
    const orders = await ctx.runQuery(internal.orders.queries.getOrderByLuluId, {
      luluOrderId: String(args.event.print_job_id),
    });

    if (!orders || orders.length === 0) {
      console.warn(`No order found for Lulu print job ${args.event.print_job_id}`);
      return { received: true, processed: false };
    }

    const order = orders[0];

    // Handle different event types
    switch (args.event.event_type) {
      case "PRINT_JOB_STATUS_CHANGED": {
        const status = args.event.data?.status as LuluPrintJobStatus;
        if (status) {
          const internalStatus = mapLuluStatusToOrderStatus(status);
          await ctx.runMutation(internal.orders.mutations.updateOrderStatus, {
            orderId: order._id,
            status: internalStatus,
          });
        }
        break;
      }

      case "PRINT_JOB_SHIPPED": {
        await ctx.runMutation(internal.orders.mutations.updateOrderStatus, {
          orderId: order._id,
          status: "shipped",
        });

        // Update tracking if provided
        if (args.event.data?.tracking_id || args.event.data?.tracking_url) {
          await ctx.runMutation(internal.orders.mutations.updateOrderTracking, {
            orderId: order._id,
            trackingNumber: args.event.data.tracking_id,
            trackingUrl: args.event.data.tracking_url,
          });
        }
        break;
      }

      case "PRINT_JOB_DELIVERED": {
        await ctx.runMutation(internal.orders.mutations.updateOrderStatus, {
          orderId: order._id,
          status: "delivered",
        });
        break;
      }

      case "PRINT_JOB_CANCELLED":
      case "PRINT_JOB_REJECTED": {
        await ctx.runMutation(internal.orders.mutations.updateOrderStatus, {
          orderId: order._id,
          status: "cancelled",
        });
        break;
      }
    }

    return { received: true, processed: true };
  },
});
