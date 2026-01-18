import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import * as crypto from "crypto";

const http = httpRouter();

// Stripe webhook handler
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    try {
      await ctx.runAction(internal.payments.actions.processWebhookEvent, {
        payload,
        signature,
      });

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      return new Response(
        JSON.stringify({ error: (error as Error).message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// Lulu webhook signature verification helper
function verifyLuluWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    return false;
  }

  try {
    // Lulu uses HMAC-SHA256 for webhook signatures
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

// Lulu webhook handler
http.route({
  path: "/lulu-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.text();
    const signature = request.headers.get("x-lulu-signature");

    // Verify webhook signature
    const webhookSecret = process.env.LULU_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("LULU_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Webhook not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!verifyLuluWebhookSignature(payload, signature, webhookSecret)) {
      console.error("Invalid Lulu webhook signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    let body: {
      event_type?: string;
      print_job_id?: number;
      timestamp?: string;
      data?: unknown;
    };

    try {
      body = JSON.parse(payload);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate the webhook payload structure
    if (!body.event_type || !body.print_job_id) {
      return new Response(
        JSON.stringify({ error: "Invalid webhook payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const result = await ctx.runAction(internal.lulu.actions.processLuluWebhook, {
        event: {
          event_type: body.event_type,
          print_job_id: body.print_job_id,
          timestamp: body.timestamp || new Date().toISOString(),
          data: body.data,
        },
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Lulu webhook error:", error);
      return new Response(
        JSON.stringify({ error: (error as Error).message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }),
});

export default http;
