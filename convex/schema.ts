import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Auth tables from @convex-dev/auth
  ...authTables,

  // Users table (extended from auth)
  users: defineTable({
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_stripe", ["stripeCustomerId"]),

  // Books table
  books: defineTable({
    userId: v.id("users"),
    title: v.string(),
    status: v.union(
      v.literal("setup"),
      v.literal("generating"),
      v.literal("draft"),
      v.literal("finalized"),
      v.literal("ordered")
    ),
    theme: v.string(),
    themeCategory: v.optional(
      v.union(
        v.literal("adventure"),
        v.literal("friendship"),
        v.literal("family"),
        v.literal("learning"),
        v.literal("bedtime"),
        v.literal("custom")
      )
    ),
    artStyle: v.union(
      v.literal("watercolor"),
      v.literal("cartoon"),
      v.literal("classic"),
      v.literal("whimsical"),
      v.literal("pastel"),
      v.literal("bold")
    ),
    setting: v.object({
      primary: v.string(),
      timeOfDay: v.optional(v.string()),
      season: v.optional(v.string()),
      additionalNotes: v.optional(v.string()),
    }),
    mood: v.union(
      v.literal("lighthearted"),
      v.literal("gentle"),
      v.literal("exciting"),
      v.literal("educational")
    ),
    authorName: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
    coverPrompt: v.optional(v.string()),
    coverRegenerationCount: v.optional(v.number()),
    interiorPdfId: v.optional(v.id("_storage")),
    coverPdfId: v.optional(v.id("_storage")),
    generationCreditsUsed: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    finalizedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_status", ["status"]),

  // Characters table
  characters: defineTable({
    bookId: v.id("books"),
    name: v.string(),
    role: v.union(v.literal("main"), v.literal("supporting")),
    referenceImageId: v.optional(v.id("_storage")),
    description: v.string(),
    relationship: v.optional(v.string()),
    aiStylePrompt: v.optional(v.string()),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_book", ["bookId"])
    .index("by_book_order", ["bookId", "order"]),

  // Pages table
  pages: defineTable({
    bookId: v.id("books"),
    pageNumber: v.number(),
    pageType: v.union(
      v.literal("title"),
      v.literal("story"),
      v.literal("back_cover")
    ),
    textContent: v.string(),
    textPosition: v.union(
      v.literal("top"),
      v.literal("middle"),
      v.literal("bottom")
    ),
    imageId: v.optional(v.id("_storage")),
    imagePrompt: v.string(),
    imageGenerationCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_book", ["bookId"])
    .index("by_book_page", ["bookId", "pageNumber"]),

  // Orders table
  orders: defineTable({
    bookId: v.id("books"),
    userId: v.id("users"),
    luluOrderId: v.optional(v.string()),
    luluPrintJobId: v.optional(v.string()),
    quantity: v.number(),
    status: v.union(
      v.literal("pending_payment"),
      v.literal("paid"),
      v.literal("submitted_to_lulu"),
      v.literal("printing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
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
    stripePaymentIntentId: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_book", ["bookId"])
    .index("by_status", ["status"])
    .index("by_lulu_order", ["luluOrderId"]),

  // Payments table (for generation fees)
  payments: defineTable({
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
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stripe", ["stripePaymentIntentId"]),

  // Generation jobs table (for tracking AI generation progress)
  generationJobs: defineTable({
    bookId: v.id("books"),
    type: v.union(
      v.literal("story"),
      v.literal("images"),
      v.literal("cover"),
      v.literal("single_image")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("failed")
    ),
    progress: v.number(),
    currentStep: v.optional(v.string()),
    error: v.optional(v.string()),
    pageId: v.optional(v.id("pages")),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_book", ["bookId"])
    .index("by_status", ["status"]),
});
