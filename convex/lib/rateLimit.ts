import { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Database-based rate limiting for serverless environments.
 * Tracks request counts per user/operation in a rolling time window.
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// Default rate limits for different operations
export const RATE_LIMITS = {
  storyGeneration: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 5 per hour
  },
  imageGeneration: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 20 per hour
  },
  coverGeneration: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 10 per hour
  },
  orderCreation: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 10 per hour
  },
} as const;

/**
 * Check if an operation is rate limited.
 * Uses the generationJobs table to track recent operations.
 */
export async function checkRateLimit(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  operation: keyof typeof RATE_LIMITS
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const config = RATE_LIMITS[operation];
  const windowStart = Date.now() - config.windowMs;

  // For story/image/cover generation, we can use the generationJobs table
  // to count recent operations
  const recentJobs = await (ctx.db as any)
    .query("generationJobs")
    .withIndex("by_book")
    .filter((q: any) => q.gte(q.field("createdAt"), windowStart))
    .collect();

  // Filter by operation type
  const typeMap: Record<string, string[]> = {
    storyGeneration: ["story"],
    imageGeneration: ["images", "single_image"],
    coverGeneration: ["cover"],
    orderCreation: [], // Orders handled separately
  };

  const relevantTypes = typeMap[operation];
  const count = recentJobs.filter((job: { type: string }) =>
    relevantTypes.includes(job.type)
  ).length;

  if (count >= config.maxRequests) {
    // Find the oldest job in the window to calculate retry time
    const oldestJob = recentJobs
      .sort((a: { createdAt: number }, b: { createdAt: number }) =>
        a.createdAt - b.createdAt
      )[0];

    const retryAfter = oldestJob
      ? oldestJob.createdAt + config.windowMs - Date.now()
      : config.windowMs;

    return {
      allowed: false,
      retryAfter: Math.max(0, retryAfter),
    };
  }

  return { allowed: true };
}

/**
 * Simple per-minute rate limiting using a counter approach.
 * Suitable for quick checks without database overhead.
 */
export function calculateRateLimitKey(userId: string, operation: string): string {
  const minute = Math.floor(Date.now() / 60000);
  return `${userId}:${operation}:${minute}`;
}

/**
 * Format retry time for user-friendly message.
 */
export function formatRetryTime(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) {
    return `${seconds} seconds`;
  }
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.ceil(minutes / 60);
  return `${hours} hours`;
}

/**
 * Create a rate limit error with retry information.
 */
export function rateLimitError(retryAfter: number): Error {
  const formattedTime = formatRetryTime(retryAfter);
  return new Error(
    `Rate limit exceeded. Please try again in ${formattedTime}.`
  );
}
