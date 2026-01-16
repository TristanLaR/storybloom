# StoryBloom - Product Requirements Document

## Executive Summary

StoryBloom is a web-based application that enables users to create personalized children's books using AI-powered story and illustration generation. Users can upload reference images for characters, define story themes, and generate complete picture books that can be edited and ordered as physical prints through Lulu's print-on-demand service.

---

## Product Overview

### Vision
Empower parents, educators, and storytellers to create unique, personalized children's books featuring custom characters and stories, with professional-quality print output.

### Target Users
- Parents wanting personalized books featuring their children
- Grandparents creating keepsake gifts
- Teachers creating custom educational materials
- Self-published authors testing children's book concepts

### Business Model
- **Book Generation Fee**: Users pay to generate a book (covers AI generation costs)
- **Print Fee**: Additional cost when ordering physical prints through Lulu integration
- Revenue = Generation fees + markup on print orders

---

## Technical Specifications

### Book Format Specifications (Lulu Compliant)

| Specification | Value |
|---------------|-------|
| Trim Size | 8.5 x 8.5 inches (216 x 216 mm) |
| With Bleed | 8.75 x 8.75 inches (222 x 222 mm) |
| Page Count | 24 pages (hardcover minimum) |
| Paper Type | 80# Coated White |
| Ink Type | Premium Color |
| Image Resolution | 300 PPI (minimum) |
| File Format | PDF |
| Safety Margin | 0.5 inches from trim edge |
| Bleed Margin | 0.125 inches on all sides |

---

## Technical Architecture

### Tech Stack Overview

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14+ (App Router) | React framework with SSR/SSG |
| Styling | Tailwind CSS | Utility-first CSS framework |
| Backend | Convex | Real-time backend, database, file storage |
| Authentication | Convex Auth | Email/password + OAuth providers |
| AI (Text) | Google Gemini API | Story generation and text content |
| AI (Images) | Nano Banana API | Image generation from prompts |
| Payments | Stripe | Payment processing |
| Print | Lulu API | Print-on-demand fulfillment |
| Hosting | Vercel | Frontend deployment |
| Backend Hosting | Convex Cloud | Managed Convex deployment |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Vercel)                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Next.js App Router                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │ │
│  │  │  Auth    │  │  Book    │  │  Editor  │  │   Order     │  │ │
│  │  │  Pages   │  │  Wizard  │  │  View    │  │   Flow      │  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Convex React Hooks
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONVEX BACKEND                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Queries   │  │  Mutations  │  │        Actions          │  │
│  │  (reads)    │  │  (writes)   │  │  (external API calls)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│         │                │                      │                │
│         ▼                ▼                      ▼                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Convex Database                           │ │
│  │   users │ books │ characters │ pages │ orders │ payments    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  Convex File Storage                         │ │
│  │   Reference Images │ Generated Images │ PDFs                │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
     │   Gemini    │     │ Nano Banana │     │    Lulu     │
     │   (Text)    │     │  (Images)   │     │   (Print)   │
     └─────────────┘     └─────────────┘     └─────────────┘
```

### Convex Schema Design

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (managed by Convex Auth)
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    createdAt: v.number(),
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
    themeCategory: v.optional(v.union(
      v.literal("adventure"),
      v.literal("friendship"),
      v.literal("family"),
      v.literal("learning"),
      v.literal("bedtime"),
      v.literal("custom")
    )),
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
    referenceImageId: v.id("_storage"),
    description: v.string(),
    relationship: v.optional(v.string()),
    aiStylePrompt: v.optional(v.string()), // Generated from reference image
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_book", ["bookId"])
    .index("by_book_order", ["bookId", "order"]),

  // Pages table
  pages: defineTable({
    bookId: v.id("books"),
    pageNumber: v.number(), // 1-24
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
    imageGenerationCount: v.number(), // Track regenerations
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
    printCost: v.number(), // cents
    shippingCost: v.number(), // cents
    taxAmount: v.number(), // cents
    totalAmount: v.number(), // cents
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
    amount: v.number(), // cents
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
    progress: v.number(), // 0-100
    currentStep: v.optional(v.string()),
    error: v.optional(v.string()),
    pageId: v.optional(v.id("pages")), // For single image regeneration
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_book", ["bookId"])
    .index("by_status", ["status"]),
});
```

### Convex Functions Structure

```
convex/
├── schema.ts                 # Database schema
├── auth.config.ts           # Convex Auth configuration
├── _generated/              # Auto-generated types
│
├── users/
│   ├── queries.ts           # getUser, getUserProfile
│   └── mutations.ts         # updateProfile, deleteAccount
│
├── books/
│   ├── queries.ts           # getBook, listUserBooks, getBookWithPages
│   ├── mutations.ts         # createBook, updateBook, deleteBook, finalizeBook
│   └── actions.ts           # generateStory, generateAllImages
│
├── characters/
│   ├── queries.ts           # getCharacters, getCharacter
│   ├── mutations.ts         # createCharacter, updateCharacter, deleteCharacter
│   └── actions.ts           # processReferenceImage (extract AI style prompt)
│
├── pages/
│   ├── queries.ts           # getPages, getPage
│   ├── mutations.ts         # updatePageText, updatePageOrder
│   └── actions.ts           # regeneratePageImage
│
├── orders/
│   ├── queries.ts           # getOrder, listUserOrders, getOrderStatus
│   ├── mutations.ts         # createOrder, updateOrderStatus
│   └── actions.ts           # calculateShipping, submitToLulu, getTrackingInfo
│
├── payments/
│   ├── queries.ts           # getPayment, listUserPayments
│   ├── mutations.ts         # createPayment, updatePaymentStatus
│   └── actions.ts           # createStripeIntent, handleStripeWebhook
│
├── pdf/
│   └── actions.ts           # generateInteriorPdf, generateCoverPdf
│
├── ai/
│   ├── gemini.ts            # Gemini API wrapper (story generation)
│   └── nanoBanana.ts        # Nano Banana API wrapper (image generation)
│
├── webhooks/
│   ├── stripe.ts            # Stripe webhook handler
│   └── lulu.ts              # Lulu webhook handler
│
└── http.ts                  # HTTP routes for webhooks
```

### Key Convex Functions

#### Book Generation Flow

```typescript
// convex/books/actions.ts
import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

export const generateBook = action({
  args: { bookId: v.id("books") },
  handler: async (ctx, { bookId }) => {
    // 1. Get book data with characters
    const book = await ctx.runQuery(internal.books.queries.getBookWithCharacters, { bookId });

    // 2. Create generation job
    const jobId = await ctx.runMutation(internal.generationJobs.create, {
      bookId,
      type: "story",
      status: "in_progress",
    });

    // 3. Generate story text with Gemini
    const storyResult = await generateStoryWithGemini({
      theme: book.theme,
      characters: book.characters,
      setting: book.setting,
      mood: book.mood,
      artStyle: book.artStyle,
    });

    // 4. Create pages with story content
    for (const pageData of storyResult.pages) {
      await ctx.runMutation(internal.pages.mutations.createPage, {
        bookId,
        pageNumber: pageData.pageNumber,
        textContent: pageData.text,
        imagePrompt: pageData.imagePrompt,
      });
    }

    // 5. Update job to images phase
    await ctx.runMutation(internal.generationJobs.update, {
      jobId,
      type: "images",
      progress: 30,
    });

    // 6. Generate images with Nano Banana
    const pages = await ctx.runQuery(internal.pages.queries.getPages, { bookId });

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];

      const imageResult = await generateImageWithNanoBanana({
        prompt: page.imagePrompt,
        style: book.artStyle,
        characters: book.characters,
        dimensions: { width: 2625, height: 2625 }, // 8.75" at 300 PPI
      });

      // Store image in Convex file storage
      const imageId = await ctx.storage.store(imageResult.buffer);

      await ctx.runMutation(internal.pages.mutations.updatePageImage, {
        pageId: page._id,
        imageId,
      });

      // Update progress
      const progress = 30 + Math.round((i + 1) / pages.length * 60);
      await ctx.runMutation(internal.generationJobs.update, { jobId, progress });
    }

    // 7. Generate cover
    await ctx.runMutation(internal.generationJobs.update, {
      jobId,
      type: "cover",
      progress: 90,
    });

    const coverResult = await generateImageWithNanoBanana({
      prompt: `Book cover for "${book.title}". ${storyResult.coverPrompt}`,
      style: book.artStyle,
      characters: book.characters.filter(c => c.role === "main"),
      dimensions: { width: 2625, height: 2625 },
    });

    const coverImageId = await ctx.storage.store(coverResult.buffer);

    await ctx.runMutation(internal.books.mutations.updateBookCover, {
      bookId,
      coverImageId,
    });

    // 8. Complete generation
    await ctx.runMutation(internal.generationJobs.update, {
      jobId,
      status: "completed",
      progress: 100,
    });

    await ctx.runMutation(internal.books.mutations.updateBookStatus, {
      bookId,
      status: "draft",
    });

    return { success: true };
  },
});
```

#### PDF Generation

```typescript
// convex/pdf/actions.ts
import { action } from "../_generated/server";
import { v } from "convex/values";
import { PDFDocument, rgb } from "pdf-lib";

const BLEED_SIZE_INCHES = 8.75;
const PPI = 300;
const PAGE_SIZE_PIXELS = BLEED_SIZE_INCHES * PPI; // 2625px

export const generateInteriorPdf = action({
  args: { bookId: v.id("books") },
  handler: async (ctx, { bookId }) => {
    const book = await ctx.runQuery(internal.books.queries.getBook, { bookId });
    const pages = await ctx.runQuery(internal.pages.queries.getPages, { bookId });

    // Create PDF document
    const pdfDoc = await PDFDocument.create();

    for (const page of pages) {
      // Add page with correct dimensions (8.75" x 8.75" at 72 DPI for PDF)
      const pdfPage = pdfDoc.addPage([630, 630]); // 8.75 * 72

      // Get image from Convex storage
      if (page.imageId) {
        const imageBytes = await ctx.storage.get(page.imageId);
        const image = await pdfDoc.embedPng(imageBytes);

        // Draw full-bleed image
        pdfPage.drawImage(image, {
          x: 0,
          y: 0,
          width: 630,
          height: 630,
        });
      }

      // Add text with proper positioning (within safety margins)
      const safetyMargin = 36; // 0.5" * 72
      const textY = page.textPosition === "top" ? 580
                  : page.textPosition === "middle" ? 315
                  : 50;

      pdfPage.drawText(page.textContent, {
        x: safetyMargin,
        y: textY,
        size: 14,
        maxWidth: 630 - (safetyMargin * 2),
      });
    }

    // Save and store PDF
    const pdfBytes = await pdfDoc.save();
    const pdfId = await ctx.storage.store(new Blob([pdfBytes]));

    await ctx.runMutation(internal.books.mutations.updateInteriorPdf, {
      bookId,
      interiorPdfId: pdfId,
    });

    return { pdfId };
  },
});

export const generateCoverPdf = action({
  args: { bookId: v.id("books") },
  handler: async (ctx, { bookId }) => {
    const book = await ctx.runQuery(internal.books.queries.getBook, { bookId });
    const pages = await ctx.runQuery(internal.pages.queries.getPages, { bookId });

    // Calculate spine width for 24 pages
    // Formula: (pageCount / 444) + 0.06 inches
    const spineWidth = (24 / 444) + 0.06; // ~0.114 inches
    const spineWidthPts = spineWidth * 72; // ~8.2 points

    // Cover spread: back (8.75") + spine + front (8.75")
    const totalWidth = (BLEED_SIZE_INCHES * 2 * 72) + spineWidthPts; // ~1268 pts
    const height = BLEED_SIZE_INCHES * 72; // 630 pts

    const pdfDoc = await PDFDocument.create();
    const coverPage = pdfDoc.addPage([totalWidth, height]);

    // Get cover image
    if (book.coverImageId) {
      const imageBytes = await ctx.storage.get(book.coverImageId);
      const image = await pdfDoc.embedPng(imageBytes);

      // Draw front cover (right side)
      coverPage.drawImage(image, {
        x: 630 + spineWidthPts,
        y: 0,
        width: 630,
        height: 630,
      });

      // Draw back cover (left side) - could be same or different
      coverPage.drawImage(image, {
        x: 0,
        y: 0,
        width: 630,
        height: 630,
        opacity: 0.3, // Faded version for back
      });
    }

    // Add title to front cover
    const safetyMargin = 36;
    coverPage.drawText(book.title, {
      x: 630 + spineWidthPts + safetyMargin,
      y: 550,
      size: 24,
    });

    // Add author name if provided
    if (book.authorName) {
      coverPage.drawText(`by ${book.authorName}`, {
        x: 630 + spineWidthPts + safetyMargin,
        y: 80,
        size: 14,
      });
    }

    const pdfBytes = await pdfDoc.save();
    const pdfId = await ctx.storage.store(new Blob([pdfBytes]));

    await ctx.runMutation(internal.books.mutations.updateCoverPdf, {
      bookId,
      coverPdfId: pdfId,
    });

    return { pdfId };
  },
});
```

### AI Integration Details

#### Gemini Integration (Story Generation)

```typescript
// convex/ai/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface StoryGenerationParams {
  theme: string;
  characters: Array<{
    name: string;
    role: "main" | "supporting";
    description: string;
  }>;
  setting: {
    primary: string;
    timeOfDay?: string;
    season?: string;
  };
  mood: string;
  artStyle: string;
}

interface StoryResult {
  pages: Array<{
    pageNumber: number;
    text: string;
    imagePrompt: string;
  }>;
  coverPrompt: string;
}

export async function generateStoryWithGemini(
  params: StoryGenerationParams
): Promise<StoryResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const characterDescriptions = params.characters
    .map(c => `- ${c.name} (${c.role}): ${c.description}`)
    .join("\n");

  const prompt = `You are a children's book author. Create a 24-page picture book story.

STORY REQUIREMENTS:
- Theme: ${params.theme}
- Mood: ${params.mood}
- Setting: ${params.setting.primary}${params.setting.timeOfDay ? `, ${params.setting.timeOfDay}` : ""}${params.setting.season ? `, ${params.setting.season}` : ""}
- Art Style: ${params.artStyle}

CHARACTERS:
${characterDescriptions}

OUTPUT FORMAT (JSON):
{
  "pages": [
    {
      "pageNumber": 1,
      "text": "Story text for this page (2-4 sentences, age-appropriate)",
      "imagePrompt": "Detailed image description for AI generation, include characters by name, setting details, action, mood. Style: ${params.artStyle}"
    }
  ],
  "coverPrompt": "Description for the book cover image"
}

RULES:
- Page 1 is the title page (just title and "A story about [main character]")
- Pages 2-23 are story content
- Page 24 is "The End" with a closing scene
- Keep text simple for ages 3-8
- Each image prompt should be detailed (50-100 words)
- Maintain character consistency in image prompts
- Include emotional beats and character growth

Generate the complete 24-page story now:`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Parse JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse story generation response");
  }

  return JSON.parse(jsonMatch[0]) as StoryResult;
}
```

#### Nano Banana Integration (Image Generation)

```typescript
// convex/ai/nanoBanana.ts

interface ImageGenerationParams {
  prompt: string;
  style: string;
  characters: Array<{
    name: string;
    aiStylePrompt?: string; // Generated from reference image
  }>;
  dimensions: {
    width: number;
    height: number;
  };
}

interface ImageResult {
  buffer: ArrayBuffer;
  url?: string;
}

export async function generateImageWithNanoBanana(
  params: ImageGenerationParams
): Promise<ImageResult> {
  // Build character consistency context
  const characterContext = params.characters
    .filter(c => c.aiStylePrompt)
    .map(c => `${c.name}: ${c.aiStylePrompt}`)
    .join("; ");

  const enhancedPrompt = `
    ${params.prompt}

    Art style: ${params.style} illustration style, children's book art
    Character references: ${characterContext}

    Requirements:
    - High quality, 300 DPI print-ready
    - Vibrant colors suitable for ${params.style} style
    - Child-friendly, warm, inviting
    - No text in image
  `.trim();

  // TODO: Replace with actual Nano Banana API implementation
  // This is a placeholder interface
  const response = await fetch(process.env.NANO_BANANA_API_URL!, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.NANO_BANANA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: enhancedPrompt,
      width: params.dimensions.width,
      height: params.dimensions.height,
      format: "png",
    }),
  });

  if (!response.ok) {
    throw new Error(`Nano Banana API error: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  return { buffer };
}

// Process reference image to extract style prompt for character consistency
export async function extractCharacterStyle(
  imageBuffer: ArrayBuffer,
  description: string
): Promise<string> {
  // TODO: Replace with actual Nano Banana API for image analysis
  // This would analyze the reference image and create a consistent style prompt

  const response = await fetch(`${process.env.NANO_BANANA_API_URL}/analyze`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.NANO_BANANA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: Buffer.from(imageBuffer).toString("base64"),
      description,
      task: "extract_character_style",
    }),
  });

  const result = await response.json();
  return result.stylePrompt;
}
```

### Authentication Configuration

```typescript
// convex/auth.config.ts
import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import Apple from "@auth/core/providers/apple";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password,
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    }),
  ],
});
```

### Webhook Handlers

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import Stripe from "stripe";

const http = httpRouter();

// Stripe webhook endpoint
http.route({
  path: "/webhooks/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const signature = request.headers.get("stripe-signature")!;
    const body = await request.text();

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "payment_intent.succeeded":
        await ctx.runMutation(internal.payments.mutations.markSucceeded, {
          stripePaymentIntentId: event.data.object.id,
        });
        break;
      case "payment_intent.payment_failed":
        await ctx.runMutation(internal.payments.mutations.markFailed, {
          stripePaymentIntentId: event.data.object.id,
        });
        break;
    }

    return new Response("OK", { status: 200 });
  }),
});

// Lulu webhook endpoint
http.route({
  path: "/webhooks/lulu",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    // Verify Lulu webhook signature
    // TODO: Implement signature verification

    const { event_type, data } = body;

    switch (event_type) {
      case "PRINT_JOB.STATUS_CHANGED":
        await ctx.runMutation(internal.orders.mutations.updateFromLulu, {
          luluPrintJobId: data.id,
          status: mapLuluStatus(data.status),
          trackingNumber: data.tracking_number,
          trackingUrl: data.tracking_url,
        });
        break;
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
```

### Frontend Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx                    # My Books grid
│   │   ├── book/
│   │   │   ├── new/page.tsx            # Book creation wizard
│   │   │   ├── [bookId]/
│   │   │   │   ├── page.tsx            # Book editor
│   │   │   │   ├── generating/page.tsx # Generation progress
│   │   │   │   └── order/page.tsx      # Order flow
│   │   └── layout.tsx
│   ├── layout.tsx
│   └── page.tsx                        # Landing page
│
├── components/
│   ├── ui/                             # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── signup-form.tsx
│   ├── book/
│   │   ├── book-card.tsx
│   │   ├── book-grid.tsx
│   │   ├── page-thumbnail.tsx
│   │   ├── page-editor.tsx
│   │   ├── text-editor.tsx
│   │   └── image-controls.tsx
│   ├── wizard/
│   │   ├── step-indicator.tsx
│   │   ├── title-step.tsx
│   │   ├── theme-step.tsx
│   │   ├── characters-step.tsx
│   │   ├── setting-step.tsx
│   │   ├── style-step.tsx
│   │   └── review-step.tsx
│   ├── preview/
│   │   ├── book-preview.tsx
│   │   ├── flip-book.tsx
│   │   └── spread-view.tsx
│   └── order/
│       ├── address-form.tsx
│       ├── shipping-options.tsx
│       ├── payment-form.tsx
│       └── order-summary.tsx
│
├── lib/
│   ├── convex.ts                       # Convex client setup
│   └── utils.ts                        # Utility functions
│
├── hooks/
│   ├── use-book.ts
│   ├── use-generation-progress.ts
│   └── use-auth.ts
│
└── types/
    └── index.ts                        # Shared TypeScript types
```

### Environment Variables

```bash
# .env.local (Frontend - Vercel)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Convex Dashboard Environment Variables
GEMINI_API_KEY=xxx
NANO_BANANA_API_URL=https://api.nanobanana.com/v1
NANO_BANANA_API_KEY=xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
LULU_API_KEY=xxx
LULU_API_SECRET=xxx
LULU_WEBHOOK_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
APPLE_CLIENT_ID=xxx
APPLE_CLIENT_SECRET=xxx
```

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        PRODUCTION                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐        ┌──────────────────┐           │
│  │     Vercel       │        │   Convex Cloud    │           │
│  │  (Next.js App)   │◄──────►│    (Backend)      │           │
│  │                  │        │                   │           │
│  │  - SSR/SSG       │        │  - Database       │           │
│  │  - Edge Runtime  │        │  - File Storage   │           │
│  │  - CDN           │        │  - Real-time      │           │
│  │                  │        │  - Actions        │           │
│  └──────────────────┘        └──────────────────┘           │
│           │                           │                      │
│           │                           ├─────────────────┐    │
│           │                           │                 │    │
│           ▼                           ▼                 ▼    │
│  ┌──────────────┐            ┌─────────────┐   ┌───────────┐│
│  │    Stripe    │            │   Gemini    │   │   Lulu    ││
│  │  (Payments)  │            │ Nano Banana │   │  (Print)  ││
│  └──────────────┘            └─────────────┘   └───────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## User Flows

### Flow 1: Authentication

```
Landing Page → Sign Up/Login → Dashboard
```

**Authentication Options:**
1. Email/Password registration and login
2. Google OAuth
3. Apple Sign-In

**Requirements:**
- Email verification for new accounts
- Password reset functionality
- Session management with secure tokens
- Remember me option

---

### Flow 2: Book Creation

```
Dashboard → New Book → Setup → Story Generation → Review & Edit → Finalize
```

#### Step 1: Book Setup
User provides foundational elements:

**1.1 Book Title**
- Text input for working title
- Can be modified later

**1.2 Story Theme/Premise**
- Text area for story concept (e.g., "A brave adventure about facing fears")
- Optional: Select from suggested themes
  - Adventure
  - Friendship
  - Family
  - Learning
  - Bedtime
  - Custom

**1.3 Character Creation**
For each character (minimum 1, maximum 4):
- **Name**: Text input
- **Role**: Main character / Supporting character
- **Reference Image**: Upload photo/image for AI to base character on
- **Description**: Text description of personality, traits, notable features
- **Relationship**: How they relate to other characters (if multiple)

**1.4 Scene/Setting Selection**
- Primary setting (e.g., "enchanted forest", "cozy home", "outer space")
- Time of day preference
- Season/weather preference
- Additional setting notes

**1.5 Art Style Selection**
User selects ONE style applied consistently to all pages:
- Watercolor
- Digital cartoon
- Storybook classic
- Whimsical/fantasy
- Soft pastel
- Bold and colorful

**1.6 Tone/Mood**
- Lighthearted and funny
- Gentle and calming
- Exciting and adventurous
- Educational and informative

---

#### Step 2: AI Story Generation

**Process:**
1. System sends all setup data to AI API
2. AI generates:
   - Complete story text (24 pages worth)
   - Page-by-page breakdown with text and image prompts
3. User sees loading state with progress indicator
4. Generation completes → User reviews initial draft

**Output Structure:**
```
Book
├── Cover (front)
├── Title Page (page 1)
├── Pages 2-23 (story content)
│   ├── Text content
│   └── Image prompt (for AI generation)
└── Back Cover
```

---

#### Step 3: Review & Edit Mode

**Book Preview Interface:**
- Thumbnail view of all pages (scrollable grid)
- Click page to expand to full view
- Page-by-page navigation (previous/next)
- Spread view option (two pages side by side)

**Per-Page Editing Options:**

**Text Editing:**
- Click text to edit directly (inline editing)
- Font size adjustment (within print-safe limits)
- Text position adjustment (top, middle, bottom of page)
- Character limit indicator (based on font size and safe area)

**Image Editing:**
- "Regenerate Image" button
  - Option to modify the prompt before regenerating
  - Keep same prompt but get variation
- View current image prompt
- Edit image prompt directly
- Regeneration count display (for billing transparency)

**Page Management:**
- Reorder pages (drag and drop)
- Cannot add/remove pages (fixed at 24 for MVP)

---

#### Step 4: Finalization

**Pre-Order Review:**
- Full book preview in flip-book style viewer
- Final checklist:
  - [ ] All text reviewed and finalized
  - [ ] All images approved
  - [ ] Book title confirmed
  - [ ] Cover design approved

**Cover Customization:**
- Auto-generated cover based on:
  - Book title
  - Main character image
  - Selected art style
- Option to regenerate cover
- Author name input (optional)

---

### Flow 3: Ordering Physical Prints

```
Finalized Book → Order Options → Lulu Integration → Payment → Confirmation
```

**Order Configuration:**
- Quantity selection
- Binding type: Hardcover (default, matches 24-page minimum)
- Shipping address input
- Shipping method selection

**Lulu Integration:**
- System generates print-ready PDF:
  - Interior file: All pages in single PDF, portrait oriented
  - Cover file: Back + Spine + Front as single spread
- API call to Lulu for pricing
- API call to create print job
- Order tracking integration

**Payment:**
- Stripe integration for payment processing
- Order summary with itemized costs:
  - Generation fee (if not already paid)
  - Print cost
  - Shipping cost
  - Tax (where applicable)

---

### Flow 4: Library/Dashboard

```
Login → Dashboard (My Books)
```

**Dashboard Features:**
- Grid view of user's books
- Book cards showing:
  - Cover thumbnail
  - Title
  - Creation date
  - Status (Draft / Finalized / Ordered)
- Actions per book:
  - Continue editing (drafts)
  - View/Download PDF (finalized)
  - Reorder prints (finalized)
  - Duplicate book (create copy to edit)
  - Delete book

---

## Functional Requirements

### FR-1: User Authentication
| ID | Requirement |
|----|-------------|
| FR-1.1 | Users can register with email/password |
| FR-1.2 | Users can sign in with Google OAuth |
| FR-1.3 | Users can sign in with Apple ID |
| FR-1.4 | Users can reset forgotten passwords |
| FR-1.5 | Sessions persist across browser sessions (remember me) |
| FR-1.6 | Users can log out from all devices |

### FR-2: Book Setup
| ID | Requirement |
|----|-------------|
| FR-2.1 | Users can create a new book project |
| FR-2.2 | Users can enter book title |
| FR-2.3 | Users can select or enter story theme |
| FR-2.4 | Users can create 1-4 characters |
| FR-2.5 | Users can upload reference images for characters (JPEG, PNG) |
| FR-2.6 | System validates image format and minimum resolution |
| FR-2.7 | Users can select art style from predefined options |
| FR-2.8 | Users can define story setting and mood |

### FR-3: AI Generation
| ID | Requirement |
|----|-------------|
| FR-3.1 | System sends book setup to AI API for story generation |
| FR-3.2 | System generates 24 pages of content (text + images) |
| FR-3.3 | Characters maintain visual consistency across pages |
| FR-3.4 | Art style remains consistent throughout book |
| FR-3.5 | System displays generation progress to user |
| FR-3.6 | Generation can be cancelled before completion |

### FR-4: Editing
| ID | Requirement |
|----|-------------|
| FR-4.1 | Users can edit text on any page |
| FR-4.2 | Users can regenerate any page image |
| FR-4.3 | Users can modify image prompts before regeneration |
| FR-4.4 | Users can reorder pages via drag-and-drop |
| FR-4.5 | Users can regenerate book cover |
| FR-4.6 | Changes auto-save periodically |
| FR-4.7 | Users can manually save at any time |

### FR-5: Preview
| ID | Requirement |
|----|-------------|
| FR-5.1 | Users can preview book in thumbnail grid view |
| FR-5.2 | Users can preview book in page-by-page view |
| FR-5.3 | Users can preview book in flip-book reader |
| FR-5.4 | Preview shows bleed lines and safe zones (toggleable) |

### FR-6: PDF Generation
| ID | Requirement |
|----|-------------|
| FR-6.1 | System generates Lulu-compliant interior PDF |
| FR-6.2 | System generates Lulu-compliant cover PDF |
| FR-6.3 | PDFs use correct dimensions with bleed (8.75 x 8.75 in) |
| FR-6.4 | Images embedded at 300 PPI minimum |
| FR-6.5 | Fonts embedded in PDF |
| FR-6.6 | Users can download generated PDFs |

### FR-7: Ordering
| ID | Requirement |
|----|-------------|
| FR-7.1 | Users can order prints through integrated Lulu API |
| FR-7.2 | System calculates print and shipping costs |
| FR-7.3 | Users can enter shipping address |
| FR-7.4 | Users can pay via Stripe |
| FR-7.5 | Users receive order confirmation email |
| FR-7.6 | Users can track order status in dashboard |

### FR-8: Library Management
| ID | Requirement |
|----|-------------|
| FR-8.1 | Dashboard displays all user's book projects |
| FR-8.2 | Users can continue editing draft books |
| FR-8.3 | Users can duplicate existing books |
| FR-8.4 | Users can delete books (with confirmation) |
| FR-8.5 | Users can filter/sort books by status, date |

---

## Non-Functional Requirements

### NFR-1: Performance
| ID | Requirement |
|----|-------------|
| NFR-1.1 | Page load time < 3 seconds on broadband |
| NFR-1.2 | Image uploads complete within 10 seconds for files < 10MB |
| NFR-1.3 | Book preview renders within 2 seconds |

### NFR-2: Reliability
| ID | Requirement |
|----|-------------|
| NFR-2.1 | 99.5% uptime for web application |
| NFR-2.2 | Auto-save prevents data loss on browser crash |
| NFR-2.3 | Failed AI generations can be retried |

### NFR-3: Security
| ID | Requirement |
|----|-------------|
| NFR-3.1 | All data transmitted over HTTPS |
| NFR-3.2 | Passwords hashed with bcrypt or equivalent |
| NFR-3.3 | User images stored securely with access control |
| NFR-3.4 | Payment data handled via Stripe (PCI compliant) |

### NFR-4: Scalability
| ID | Requirement |
|----|-------------|
| NFR-4.1 | Support 1000 concurrent users |
| NFR-4.2 | Queue system for AI generation requests |
| NFR-4.3 | CDN for serving generated images |

---

## Data Models

> **Note**: The authoritative data models are defined in the Convex schema (`convex/schema.ts`).
> See the [Technical Architecture](#technical-architecture) section for the complete schema definition.

### Core Entities

| Entity | Description | Key Fields |
|--------|-------------|------------|
| **users** | User accounts (Convex Auth managed) | email, name, stripeCustomerId |
| **books** | Book projects | userId, title, status, theme, artStyle, setting, mood |
| **characters** | Characters in a book | bookId, name, role, referenceImageId, aiStylePrompt |
| **pages** | Individual book pages | bookId, pageNumber, textContent, imageId, imagePrompt |
| **orders** | Print orders | bookId, userId, luluOrderId, status, shippingAddress |
| **payments** | Payment records | userId, bookId, type, amount, stripePaymentIntentId |
| **generationJobs** | AI generation tracking | bookId, type, status, progress |

### Relationships

```
users (1) ──────< (many) books
books (1) ──────< (many) characters
books (1) ──────< (many) pages
books (1) ──────< (many) orders
users (1) ──────< (many) orders
users (1) ──────< (many) payments
books (1) ──────< (many) generationJobs
```

---

## API Integrations

### Google Gemini API
**Purpose**: Story text generation

| Endpoint | Use Case |
|----------|----------|
| `generateContent` | Generate 24-page story with text and image prompts |

**Key Features**:
- Gemini 1.5 Pro model for high-quality narrative generation
- Structured JSON output for easy parsing
- Character and theme-aware story creation

**Implementation**: `convex/ai/gemini.ts`

### Nano Banana API
**Purpose**: Image generation

| Endpoint | Use Case |
|----------|----------|
| `/generate` | Create illustrations from text prompts |
| `/analyze` | Extract character style from reference images |

**Key Features**:
- High-resolution output (2625x2625px for 300 PPI at 8.75")
- Style consistency via character style prompts
- Multiple art style support

**Implementation**: `convex/ai/nanoBanana.ts`

### Lulu Print API
**Purpose**: Print-on-demand fulfillment

| Endpoint | Use Case |
|----------|----------|
| `POST /print-jobs` | Create print order |
| `POST /print-jobs/{id}/files` | Upload PDFs |
| `GET /print-jobs/{id}` | Get order status |
| `GET /shipping-options` | Calculate shipping costs |
| `POST /webhooks` | Receive status updates |

**Integration Approach**:
- Direct API calls for order creation (Convex actions)
- Webhook-based status updates (Convex HTTP routes)

**Implementation**: `convex/orders/actions.ts`, `convex/http.ts`

### Stripe API
**Purpose**: Payment processing

| Feature | Use Case |
|---------|----------|
| Payment Intents | Charge for generation and print orders |
| Webhooks | Confirm payment success/failure |
| Customer Portal | Manage payment methods (future) |

**Integration Approach**:
- Server-side Payment Intent creation in Convex actions
- Webhook handling via Convex HTTP routes
- Client-side Stripe Elements for secure card input

**Implementation**: `convex/payments/actions.ts`, `convex/http.ts`

---

## UI/UX Requirements

### Design Principles
1. **Simplicity**: Guided, step-by-step flow for non-technical users
2. **Delight**: Magical reveal moments when AI generates content
3. **Trust**: Clear pricing, no hidden costs
4. **Reassurance**: Progress indicators, save confirmations

### Key Screens
1. Landing page with value proposition
2. Sign up / Login
3. Dashboard (My Books)
4. Book Setup Wizard (multi-step form)
5. Generation Loading Screen (with progress)
6. Book Editor (preview + edit tools)
7. Order Flow (address, shipping, payment)
8. Order Confirmation

### Responsive Breakpoints
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: Not primary target (view-only for MVP)

---

## MVP Scope

### In Scope (MVP)
- User authentication (email + Google + Apple)
- Single book format (8.5x8.5 square, 24 pages, hardcover)
- Character creation with reference image upload
- AI story and image generation
- Text editing
- Image regeneration
- PDF generation (Lulu compliant)
- Lulu print ordering integration
- Stripe payment processing
- Basic dashboard/library

### Out of Scope (Future)
- Collaborative editing
- Multiple book formats/sizes
- Mobile native apps
- Advanced text formatting (fonts, colors)
- Illustration upload (user's own art)
- Gift purchasing (send to another address with gift message)
- Subscription plans
- API access for third parties

---

## Success Metrics

| Metric | Target |
|--------|--------|
| User registration completion rate | > 60% |
| Book creation started → completed | > 40% |
| Completed books → ordered prints | > 25% |
| Average generation time | < 3 minutes |
| Customer satisfaction (post-order survey) | > 4.2/5 |

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI generates inappropriate content | High | Content moderation filters, human review queue |
| Character consistency fails | Medium | Multiple reference image processing, style lock |
| Lulu API downtime | Medium | Queue orders, retry mechanism, notify users |
| High AI generation costs | High | Usage limits, cost monitoring, pricing adjustments |
| Copyright concerns with reference images | Medium | Terms of service, user attestation |

---

## Appendix A: Lulu Print Specifications Reference

For detailed Lulu specifications, see:
- `lulu_guide.md` - Comprehensive formatting guide
- `lulu_specifications.json` - Machine-readable specifications

Key requirements for StoryBloom:
- Interior: Single page PDF, 8.75x8.75" with bleed, 300 PPI images
- Cover: Single spread PDF, includes back + spine + front
- Spine width for 24 pages: ~0.11 inches (from formula)
- Paper: 80# Coated White
- Ink: Premium Color
- Safety margin: 0.5" from trim edge

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-16 | - | Initial PRD |
| 1.1 | 2025-01-16 | - | Added detailed technical architecture: Convex backend, Gemini/Nano Banana AI split, schema design, function structure, PDF generation, auth config, webhooks, deployment |
