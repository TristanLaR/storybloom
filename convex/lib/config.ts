/**
 * Centralized configuration and constants for the StoryBloom application.
 */

// ============================================
// PRICING CONSTANTS (in cents)
// ============================================

export const PRICING = {
  // Book generation
  generation: 499, // $4.99 for book generation

  // Image regeneration
  regeneration: 99, // $0.99 per image regeneration

  // Print costs (base + per page)
  print: {
    baseCost: 899, // $8.99 base for hardcover
    perPageCost: 4, // $0.04 per page
    minPages: 24, // Minimum pages for a book
  },
} as const;

// ============================================
// BOOK SPECIFICATIONS
// ============================================

export const BOOK_SPECS = {
  // Page count
  totalPages: 24,
  minPages: 24,

  // Page dimensions (in pixels for print-ready output)
  pageWidth: 2625, // 8.75" at 300 DPI
  pageHeight: 2625, // 8.75" at 300 DPI

  // Cover dimensions (includes bleed)
  coverWidth: 2700,
  coverHeight: 2700,

  // Text limits
  maxTextPerPage: 150, // characters
  maxTitleLength: 50,
  maxAuthorNameLength: 50,
} as const;

// ============================================
// ART STYLES
// ============================================

export const ART_STYLES = [
  "watercolor",
  "cartoon",
  "classic",
  "whimsical",
  "pastel",
  "bold",
] as const;

export type ArtStyle = (typeof ART_STYLES)[number];

// ============================================
// MOODS
// ============================================

export const MOODS = [
  "lighthearted",
  "gentle",
  "exciting",
  "educational",
] as const;

export type Mood = (typeof MOODS)[number];

// ============================================
// THEME CATEGORIES
// ============================================

export const THEME_CATEGORIES = [
  "adventure",
  "friendship",
  "family",
  "learning",
  "bedtime",
  "custom",
] as const;

export type ThemeCategory = (typeof THEME_CATEGORIES)[number];

// ============================================
// ORDER STATUSES
// ============================================

export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "submitted_to_lulu",
  "printing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// ============================================
// BOOK STATUSES
// ============================================

export const BOOK_STATUSES = [
  "setup",
  "generating",
  "draft",
  "finalized",
  "ordered",
] as const;

export type BookStatus = (typeof BOOK_STATUSES)[number];

// ============================================
// API CONFIGURATION
// ============================================

export const API_CONFIG = {
  // Gemini API
  gemini: {
    model: "gemini-1.5-flash",
    maxRetries: 3,
    retryDelayMs: 1000,
    maxOutputTokens: 8192,
    temperature: 0.8,
  },

  // Rate limiting
  rateLimit: {
    minRequestIntervalMs: 1000, // 1 second between requests
  },

  // Lulu API
  lulu: {
    baseUrl: "https://api.lulu.com",
    sandboxUrl: "https://api.sandbox.lulu.com",
  },
} as const;

// ============================================
// ENVIRONMENT VALIDATION
// ============================================

export interface RequiredEnvVars {
  GEMINI_API_KEY: string;
  NANO_BANANA_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  LULU_API_KEY: string;
  LULU_WEBHOOK_SECRET: string;
}

export interface OptionalEnvVars {
  LULU_API_SECRET?: string;
  LULU_USE_SANDBOX?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  APPLE_CLIENT_ID?: string;
  APPLE_CLIENT_SECRET?: string;
  DEBUG?: string;
}

/**
 * Validate that all required environment variables are set.
 * Throws an error if any are missing.
 */
export function validateEnvironment(): void {
  const requiredVars: (keyof RequiredEnvVars)[] = [
    "GEMINI_API_KEY",
    "NANO_BANANA_API_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "LULU_API_KEY",
    "LULU_WEBHOOK_SECRET",
  ];

  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

/**
 * Get an environment variable with a default value.
 */
export function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value || defaultValue!;
}

/**
 * Check if we're in development/sandbox mode.
 */
export function isSandboxMode(): boolean {
  return process.env.LULU_USE_SANDBOX === "true";
}

/**
 * Check if debug logging is enabled.
 */
export function isDebugEnabled(): boolean {
  return process.env.DEBUG === "true";
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate print cost for a book.
 */
export function calculatePrintCost(pageCount: number, quantity: number): number {
  const effectivePages = Math.max(PRICING.print.minPages, pageCount);
  const unitCost =
    PRICING.print.baseCost + PRICING.print.perPageCost * effectivePages;
  return unitCost * quantity;
}

/**
 * Calculate total order cost.
 */
export function calculateOrderTotal(
  pageCount: number,
  quantity: number,
  shippingCost: number,
  taxRate: number = 0
): {
  printCost: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
} {
  const printCost = calculatePrintCost(pageCount, quantity);
  const subtotal = printCost + shippingCost;
  const taxAmount = Math.round(subtotal * taxRate);
  const totalAmount = subtotal + taxAmount;

  return {
    printCost,
    shippingCost,
    taxAmount,
    totalAmount,
  };
}
