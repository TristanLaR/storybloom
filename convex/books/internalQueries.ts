import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

export const getBookInternal = internalQuery({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bookId);
  },
});
