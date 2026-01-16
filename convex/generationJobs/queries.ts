import { query } from "../_generated/server";
import { v } from "convex/values";

export const getJobsForBook = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("generationJobs")
      .withIndex("by_book", (q: any) => q.eq("bookId", args.bookId))
      .order("desc")
      .collect();
  },
});

export const getActiveJob = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query("generationJobs")
      .withIndex("by_book", (q: any) => q.eq("bookId", args.bookId))
      .filter((q: any) =>
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "in_progress")
        )
      )
      .order("desc")
      .first();

    return jobs;
  },
});

export const getJob = query({
  args: { jobId: v.id("generationJobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});
