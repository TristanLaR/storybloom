import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";

export const createGenerationJob = internalMutation({
  args: {
    bookId: v.id("books"),
    type: v.union(
      v.literal("story"),
      v.literal("images"),
      v.literal("cover"),
      v.literal("single_image")
    ),
    pageId: v.optional(v.id("pages")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generationJobs", {
      bookId: args.bookId,
      type: args.type,
      status: "pending",
      progress: 0,
      pageId: args.pageId,
      createdAt: Date.now(),
    });
  },
});

export const updateJobProgress = internalMutation({
  args: {
    jobId: v.id("generationJobs"),
    progress: v.number(),
    currentStep: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      progress: args.progress,
      currentStep: args.currentStep,
      status: "in_progress",
    });
  },
});

export const completeGenerationJob = internalMutation({
  args: {
    jobId: v.id("generationJobs"),
    status: v.union(v.literal("completed"), v.literal("failed")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: args.status,
      progress: args.status === "completed" ? 100 : undefined,
      error: args.error,
      completedAt: Date.now(),
    });
  },
});

export const cancelGenerationJob = mutation({
  args: {
    jobId: v.id("generationJobs"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.status === "completed" || job.status === "failed") {
      throw new Error("Cannot cancel a completed or failed job");
    }

    await ctx.db.patch(args.jobId, {
      status: "failed",
      error: "Cancelled by user",
      completedAt: Date.now(),
    });
  },
});
