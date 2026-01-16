import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const updateCharacterStylePrompt = internalMutation({
  args: {
    characterId: v.id("characters"),
    aiStylePrompt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.characterId, {
      aiStylePrompt: args.aiStylePrompt,
    });
  },
});
