"use node";

import { action, internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { generateStoryWithGemini } from "../ai/gemini";
import {
  generateImageWithNanoBanana,
  generateCoverImage,
  extractCharacterStyle,
  PRINT_DIMENSIONS,
  type CharacterReference,
} from "../ai/nanoBanana";

// Main book generation action
export const generateBook = action({
  args: {
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const nanoBananaApiKey = process.env.NANO_BANANA_API_KEY;

    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    if (!nanoBananaApiKey) {
      throw new Error("NANO_BANANA_API_KEY environment variable is not set");
    }

    // Get the book data
    const book = await ctx.runQuery(internal.books.internalQueries.getBookInternal, {
      bookId: args.bookId,
    });

    if (!book) {
      throw new Error("Book not found");
    }

    // Get characters
    const characters = await ctx.runQuery(
      internal.characters.internalQueries.getCharactersInternal,
      { bookId: args.bookId }
    );

    // Create a generation job for tracking
    const jobId = await ctx.runMutation(
      internal.generationJobs.mutations.createGenerationJob,
      {
        bookId: args.bookId,
        type: "story",
      }
    );

    try {
      // Update book status to generating
      await ctx.runMutation(internal.books.internalMutations.updateBookStatusInternal, {
        bookId: args.bookId,
        status: "generating",
      });

      // Step 1: Process character reference images (if any)
      await updateJobProgress(ctx, jobId, 5, "Processing character images");

      const characterRefs: CharacterReference[] = [];
      for (const char of characters) {
        let stylePrompt: string | undefined;

        if (char.referenceImageId) {
          // Get the image URL from storage
          const imageUrl = await ctx.storage.getUrl(char.referenceImageId);
          if (imageUrl) {
            try {
              stylePrompt = await extractCharacterStyle(
                await fetchImageBuffer(imageUrl),
                char.description,
                nanoBananaApiKey
              );
            } catch (error) {
              console.error(`Failed to extract style for ${char.name}:`, error);
              // Continue without style prompt
            }
          }
        }

        characterRefs.push({
          name: char.name,
          description: char.description,
          stylePrompt,
        });

        // Update character with AI style prompt
        if (stylePrompt) {
          await ctx.runMutation(
            internal.characters.internalMutations.updateCharacterStylePrompt,
            {
              characterId: char._id,
              aiStylePrompt: stylePrompt,
            }
          );
        }
      }

      // Step 2: Generate story with Gemini
      await updateJobProgress(ctx, jobId, 15, "Generating story");

      const storyParams = {
        title: book.title,
        theme: book.theme,
        mood: book.mood,
        artStyle: book.artStyle,
        authorName: book.authorName,
        characters: characters.map((c: any) => ({
          name: c.name,
          role: c.role,
          description: c.description,
          relationship: c.relationship,
        })),
        setting: book.setting,
      };

      const story = await generateStoryWithGemini(storyParams, geminiApiKey);

      // Step 3: Create page records
      await updateJobProgress(ctx, jobId, 25, "Creating pages");

      const pageIds: string[] = [];
      for (const page of story.pages) {
        const pageId = await ctx.runMutation(internal.pages.mutations.createPage, {
          bookId: args.bookId,
          pageNumber: page.pageNumber,
          pageType: page.pageType,
          textContent: page.textContent,
          textPosition: page.textPosition,
          imagePrompt: page.imagePrompt,
        });
        pageIds.push(pageId);
      }

      // Step 4: Generate images for each page
      await updateJobProgress(ctx, jobId, 30, "Generating illustrations");

      const totalPages = story.pages.length;
      for (let i = 0; i < totalPages; i++) {
        const page = story.pages[i];
        const pageId = pageIds[i];

        const progressPercent = 30 + Math.floor((i / totalPages) * 55);
        await updateJobProgress(
          ctx,
          jobId,
          progressPercent,
          `Generating illustration ${i + 1} of ${totalPages}`
        );

        try {
          const imageResult = await generateImageWithNanoBanana(
            {
              prompt: page.imagePrompt,
              style: book.artStyle,
              characters: characterRefs,
              dimensions: PRINT_DIMENSIONS,
            },
            nanoBananaApiKey
          );

          // Store the image
          if (imageResult.imageData) {
            const blob = new Blob([imageResult.imageData], { type: "image/png" });
            const storageId = await ctx.storage.store(blob);

            await ctx.runMutation(internal.pages.mutations.updatePageImage, {
              pageId,
              imageId: storageId,
            });
          }
        } catch (error) {
          console.error(`Failed to generate image for page ${i + 1}:`, error);
          // Continue with other pages - partial failures are OK
        }
      }

      // Step 5: Generate cover image
      await updateJobProgress(ctx, jobId, 90, "Generating cover");

      try {
        const coverResult = await generateCoverImage(
          story.coverPrompt,
          book.artStyle,
          book.title,
          book.authorName,
          nanoBananaApiKey
        );

        if (coverResult.imageData) {
          const blob = new Blob([coverResult.imageData], { type: "image/png" });
          const coverStorageId = await ctx.storage.store(blob);

          await ctx.runMutation(internal.books.internalMutations.updateBookCover, {
            bookId: args.bookId,
            coverImageId: coverStorageId,
          });
        }
      } catch (error) {
        console.error("Failed to generate cover:", error);
        // Continue - cover can be regenerated later
      }

      // Step 6: Update book status to draft
      await ctx.runMutation(internal.books.internalMutations.updateBookStatusInternal, {
        bookId: args.bookId,
        status: "draft",
      });

      // Mark job as completed
      await updateJobProgress(ctx, jobId, 100, "Complete");
      await ctx.runMutation(internal.generationJobs.mutations.completeGenerationJob, {
        jobId,
        status: "completed",
      });

      return { success: true, bookId: args.bookId };
    } catch (error) {
      // Mark job as failed
      await ctx.runMutation(internal.generationJobs.mutations.completeGenerationJob, {
        jobId,
        status: "failed",
        error: (error as Error).message,
      });

      throw error;
    }
  },
});

// Helper to update job progress
async function updateJobProgress(
  ctx: any,
  jobId: string,
  progress: number,
  currentStep: string
): Promise<void> {
  await ctx.runMutation(internal.generationJobs.mutations.updateJobProgress, {
    jobId,
    progress,
    currentStep,
  });
}

// Helper to fetch image buffer from URL
async function fetchImageBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  return await response.arrayBuffer();
}

// Action to regenerate a single page image
export const regeneratePageImage = action({
  args: {
    pageId: v.id("pages"),
    newPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const nanoBananaApiKey = process.env.NANO_BANANA_API_KEY;
    if (!nanoBananaApiKey) {
      throw new Error("NANO_BANANA_API_KEY environment variable is not set");
    }

    // Get the page
    const page = await ctx.runQuery(internal.pages.queries.getPageInternal, {
      pageId: args.pageId,
    });

    if (!page) {
      throw new Error("Page not found");
    }

    // Get the book for style info
    const book = await ctx.runQuery(internal.books.internalQueries.getBookInternal, {
      bookId: page.bookId,
    });

    if (!book) {
      throw new Error("Book not found");
    }

    // Get characters for consistency
    const characters = await ctx.runQuery(
      internal.characters.internalQueries.getCharactersInternal,
      { bookId: page.bookId }
    );

    const characterRefs: CharacterReference[] = characters.map((c: any) => ({
      name: c.name,
      description: c.description,
      stylePrompt: c.aiStylePrompt,
    }));

    // Generate new image
    const prompt = args.newPrompt || page.imagePrompt;
    const imageResult = await generateImageWithNanoBanana(
      {
        prompt,
        style: book.artStyle,
        characters: characterRefs,
        dimensions: PRINT_DIMENSIONS,
      },
      nanoBananaApiKey
    );

    // Store the new image
    if (imageResult.imageData) {
      const blob = new Blob([imageResult.imageData], { type: "image/png" });
      const storageId = await ctx.storage.store(blob);

      await ctx.runMutation(internal.pages.mutations.updatePageImage, {
        pageId: args.pageId,
        imageId: storageId,
      });

      // Update prompt if it changed
      if (args.newPrompt) {
        await ctx.runMutation(internal.pages.mutations.updatePagePrompt, {
          pageId: args.pageId,
          imagePrompt: args.newPrompt,
        });
      }

      // Increment regeneration count
      await ctx.runMutation(internal.pages.mutations.incrementRegenerationCount, {
        pageId: args.pageId,
      });

      return { success: true, storageId };
    }

    return { success: false };
  },
});

// Action to regenerate the book cover
export const regenerateCover = action({
  args: {
    bookId: v.id("books"),
    newPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const nanoBananaApiKey = process.env.NANO_BANANA_API_KEY;
    if (!nanoBananaApiKey) {
      throw new Error("NANO_BANANA_API_KEY environment variable is not set");
    }

    // Get the book
    const book = await ctx.runQuery(internal.books.internalQueries.getBookInternal, {
      bookId: args.bookId,
    });

    if (!book) {
      throw new Error("Book not found");
    }

    // Use new prompt or default cover prompt
    const coverPrompt =
      args.newPrompt ||
      book.coverPrompt ||
      `A beautiful children's book cover for "${book.title}" in ${book.artStyle} style, featuring magical and whimsical elements that capture the essence of a children's adventure story`;

    // Generate new cover
    const coverResult = await generateCoverImage(
      coverPrompt,
      book.artStyle,
      book.title,
      book.authorName,
      nanoBananaApiKey
    );

    if (coverResult.imageData) {
      const blob = new Blob([coverResult.imageData], { type: "image/png" });
      const coverStorageId = await ctx.storage.store(blob);

      // Update book with new cover
      await ctx.runMutation(internal.books.internalMutations.updateBookCover, {
        bookId: args.bookId,
        coverImageId: coverStorageId,
      });

      // Update cover prompt if it changed
      if (args.newPrompt) {
        await ctx.runMutation(internal.books.internalMutations.updateBookCoverPrompt, {
          bookId: args.bookId,
          coverPrompt: args.newPrompt,
        });
      }

      // Increment cover regeneration count
      await ctx.runMutation(internal.books.internalMutations.incrementCoverRegenerationCount, {
        bookId: args.bookId,
      });

      return { success: true, storageId: coverStorageId };
    }

    return { success: false };
  },
});
