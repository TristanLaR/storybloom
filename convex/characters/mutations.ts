import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createCharacter = mutation({
  args: {
    bookId: v.id("books"),
    name: v.string(),
    role: v.union(v.literal("main"), v.literal("supporting")),
    description: v.string(),
    relationship: v.optional(v.string()),
    referenceImageId: v.optional(v.id("_storage")),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("characters", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const createCharactersBulk = mutation({
  args: {
    bookId: v.id("books"),
    characters: v.array(
      v.object({
        name: v.string(),
        role: v.union(v.literal("main"), v.literal("supporting")),
        description: v.string(),
        relationship: v.optional(v.string()),
        referenceImageId: v.optional(v.id("_storage")),
      })
    ),
  },
  handler: async (ctx, args) => {
    const characterIds = [];
    const now = Date.now();

    for (let i = 0; i < args.characters.length; i++) {
      const character = args.characters[i];
      const id = await ctx.db.insert("characters", {
        bookId: args.bookId,
        name: character.name,
        role: character.role,
        description: character.description,
        relationship: character.relationship,
        referenceImageId: character.referenceImageId,
        order: i,
        createdAt: now,
      });
      characterIds.push(id);
    }

    return characterIds;
  },
});

export const updateCharacter = mutation({
  args: {
    characterId: v.id("characters"),
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal("main"), v.literal("supporting"))),
    description: v.optional(v.string()),
    relationship: v.optional(v.string()),
    referenceImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { characterId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    await ctx.db.patch(characterId, filteredUpdates);
  },
});

export const deleteCharacter = mutation({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.characterId);
  },
});
