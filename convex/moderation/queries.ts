import { query } from "../_generated/server";
import { v } from "convex/values";
import { getApprovedThemes } from "./contentFilter";

// Get all pending moderation flags (for admin review)
export const getPendingFlags = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("moderationFlags")
      .withIndex("by_status", (q: any) => q.eq("status", "pending_review"))
      .order("desc")
      .collect();
  },
});

// Get flags by severity (for prioritized review)
export const getFlagsBySeverity = query({
  args: {
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("moderationFlags")
      .withIndex("by_severity", (q: any) => q.eq("severity", args.severity))
      .filter((q: any) => q.eq(q.field("status"), "pending_review"))
      .collect();
  },
});

// Get flags for a specific user
export const getUserFlags = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("moderationFlags")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get flags for a specific book
export const getBookFlags = query({
  args: {
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("moderationFlags")
      .withIndex("by_book", (q: any) => q.eq("bookId", args.bookId))
      .order("desc")
      .collect();
  },
});

// Get moderation statistics
export const getModerationStats = query({
  args: {},
  handler: async (ctx) => {
    const allFlags = await ctx.db.query("moderationFlags").collect();

    const pending = allFlags.filter((f) => f.status === "pending_review").length;
    const approved = allFlags.filter((f) => f.status === "approved").length;
    const rejected = allFlags.filter((f) => f.status === "rejected").length;
    const autoBlocked = allFlags.filter((f) => f.status === "auto_blocked").length;

    const bySeverity = {
      low: allFlags.filter((f) => f.severity === "low").length,
      medium: allFlags.filter((f) => f.severity === "medium").length,
      high: allFlags.filter((f) => f.severity === "high").length,
    };

    return {
      total: allFlags.length,
      pending,
      approved,
      rejected,
      autoBlocked,
      bySeverity,
    };
  },
});

// Get list of approved themes for the frontend
export const getApprovedThemeList = query({
  args: {},
  handler: async () => {
    return getApprovedThemes();
  },
});

// Check if a user has any blocked content
export const hasBlockedContent = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const blockedFlags = await ctx.db
      .query("moderationFlags")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .filter((q: any) =>
        q.or(
          q.eq(q.field("status"), "auto_blocked"),
          q.eq(q.field("status"), "rejected")
        )
      )
      .collect();

    return {
      hasBlocked: blockedFlags.length > 0,
      count: blockedFlags.length,
    };
  },
});
