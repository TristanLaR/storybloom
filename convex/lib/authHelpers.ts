import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

/**
 * Authentication helper functions for Convex mutations and queries.
 * Provides consistent authorization checks across all endpoints.
 */

export class AuthenticationError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = "You don't have permission to access this resource") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Gets the authenticated user from the context.
 * Throws AuthenticationError if not authenticated.
 */
export async function getAuthenticatedUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new AuthenticationError();
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", identity.email))
    .first();

  if (!user) {
    throw new AuthenticationError("User account not found");
  }

  return user;
}

/**
 * Gets the authenticated user or returns null if not authenticated.
 * Use this for queries that should work for both authenticated and unauthenticated users.
 */
export async function getOptionalAuthenticatedUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", identity.email))
    .first();
}

/**
 * Verifies that the authenticated user owns the specified book.
 * Throws AuthorizationError if not the owner.
 */
export async function verifyBookOwnership(
  ctx: QueryCtx | MutationCtx,
  bookId: Id<"books">,
  user: Doc<"users">
): Promise<Doc<"books">> {
  const book = await ctx.db.get(bookId);
  if (!book) {
    throw new Error("Book not found");
  }

  if (book.userId !== user._id) {
    throw new AuthorizationError("You don't have permission to access this book");
  }

  return book;
}

/**
 * Verifies that the authenticated user owns the book that contains the specified character.
 * Throws AuthorizationError if not the owner.
 */
export async function verifyCharacterOwnership(
  ctx: QueryCtx | MutationCtx,
  characterId: Id<"characters">,
  user: Doc<"users">
): Promise<{ character: Doc<"characters">; book: Doc<"books"> }> {
  const character = await ctx.db.get(characterId);
  if (!character) {
    throw new Error("Character not found");
  }

  const book = await verifyBookOwnership(ctx, character.bookId, user);
  return { character, book };
}

/**
 * Verifies that the authenticated user owns the book that contains the specified page.
 * Throws AuthorizationError if not the owner.
 */
export async function verifyPageOwnership(
  ctx: QueryCtx | MutationCtx,
  pageId: Id<"pages">,
  user: Doc<"users">
): Promise<{ page: Doc<"pages">; book: Doc<"books"> }> {
  const page = await ctx.db.get(pageId);
  if (!page) {
    throw new Error("Page not found");
  }

  const book = await verifyBookOwnership(ctx, page.bookId, user);
  return { page, book };
}

/**
 * Verifies that the authenticated user owns the specified order.
 * Throws AuthorizationError if not the owner.
 */
export async function verifyOrderOwnership(
  ctx: QueryCtx | MutationCtx,
  orderId: Id<"orders">,
  user: Doc<"users">
): Promise<Doc<"orders">> {
  const order = await ctx.db.get(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  if (order.userId !== user._id) {
    throw new AuthorizationError("You don't have permission to access this order");
  }

  return order;
}
