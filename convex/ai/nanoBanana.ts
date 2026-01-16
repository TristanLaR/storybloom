"use node";

// Nano Banana API integration for image generation
// Note: This is a placeholder implementation. Replace with actual API when available.

export interface CharacterReference {
  name: string;
  stylePrompt?: string;
  description: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageGenerationParams {
  prompt: string;
  style: string;
  characters: CharacterReference[];
  dimensions: ImageDimensions;
}

export interface ImageResult {
  imageUrl: string;
  imageData?: ArrayBuffer;
  width: number;
  height: number;
}

// Art style prompt enhancements
const STYLE_PROMPTS: Record<string, string> = {
  watercolor:
    "watercolor painting style, soft washes, dreamy colors, gentle brushstrokes, paper texture, wet on wet technique, flowing edges, pastel palette, delicate details",
  cartoon:
    "digital cartoon style, clean vector lines, bright vibrant colors, smooth gradients, modern illustration, cell shading, bold outlines, playful design",
  classic:
    "classic storybook illustration style, vintage picture book aesthetic, detailed pen work, warm muted colors, traditional art feel, nostalgic, timeless quality",
  whimsical:
    "whimsical fantasy illustration, magical sparkles, enchanted atmosphere, dreamlike quality, soft glow effects, fantastical elements, ethereal lighting",
  pastel:
    "soft pastel illustration style, gentle muted colors, calming aesthetic, smooth gradients, cotton candy palette, soothing tones, delicate shading",
  bold:
    "bold colorful illustration, high contrast, striking primary colors, graphic style, eye-catching design, dynamic composition, pop art influence",
};

// Print-ready dimensions for children's book
export const PRINT_DIMENSIONS = {
  width: 2625, // 8.75 inches at 300 PPI
  height: 2625,
  ppi: 300,
};

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 500; // 500ms between requests

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }
  lastRequestTime = Date.now();
}

// Build enhanced prompt with style and character information
function buildEnhancedPrompt(params: ImageGenerationParams): string {
  const { prompt, style, characters } = params;

  const styleEnhancement = STYLE_PROMPTS[style] || STYLE_PROMPTS.watercolor;

  // Build character descriptions for consistency
  const characterPrompts = characters
    .map((char) => {
      if (char.stylePrompt) {
        return `${char.name}: ${char.stylePrompt}`;
      }
      return `${char.name}: ${char.description}`;
    })
    .join(". ");

  const enhancedPrompt = [
    prompt,
    `Art style: ${styleEnhancement}`,
    characterPrompts ? `Characters: ${characterPrompts}` : null,
    "children's book illustration, high quality, professional, print-ready",
  ]
    .filter(Boolean)
    .join(". ");

  return enhancedPrompt;
}

// Extract character style from reference image
// This analyzes a reference image and generates a style prompt for consistency
export async function extractCharacterStyle(
  imageBuffer: ArrayBuffer,
  description: string,
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error("Nano Banana API key is required");
  }

  await waitForRateLimit();

  // In a real implementation, this would:
  // 1. Send the image to an AI vision model
  // 2. Extract visual features (hair color, clothing, distinctive features)
  // 3. Generate a consistent style prompt

  // Placeholder implementation - returns enhanced description
  // Replace with actual API call when Nano Banana API is available
  const stylePrompt = `${description}, consistent character design, recognizable features, distinctive appearance`;

  return stylePrompt;
}

// Main function to generate image
export async function generateImageWithNanoBanana(
  params: ImageGenerationParams,
  apiKey: string
): Promise<ImageResult> {
  if (!apiKey) {
    throw new Error("Nano Banana API key is required");
  }

  await waitForRateLimit();

  const enhancedPrompt = buildEnhancedPrompt(params);

  // Retry logic
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Placeholder implementation
      // In a real implementation, this would call the Nano Banana API
      // Replace the URL and headers with actual API details

      const apiUrl = process.env.NANO_BANANA_API_URL || "https://api.nanobanana.ai/v1/generate";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          width: params.dimensions.width,
          height: params.dimensions.height,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Nano Banana API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      // Handle different response formats
      let imageUrl: string;
      let imageData: ArrayBuffer | undefined;

      if (result.images && result.images[0]) {
        imageUrl = result.images[0].url || result.images[0];
      } else if (result.output && result.output[0]) {
        imageUrl = result.output[0];
      } else if (result.url) {
        imageUrl = result.url;
      } else {
        throw new Error("No image URL in response");
      }

      // Optionally fetch the image data
      if (imageUrl.startsWith("http")) {
        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          imageData = await imageResponse.arrayBuffer();
        }
      }

      return {
        imageUrl,
        imageData,
        width: params.dimensions.width,
        height: params.dimensions.height,
      };
    } catch (error) {
      lastError = error as Error;
      console.error(`Nano Banana API attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw new Error(
    `Failed to generate image after ${maxRetries} attempts: ${lastError?.message}`
  );
}

// Generate cover image with special formatting
export async function generateCoverImage(
  prompt: string,
  style: string,
  title: string,
  authorName: string | undefined,
  apiKey: string
): Promise<ImageResult> {
  const coverPrompt = `Book cover illustration. ${prompt}. Title: "${title}"${authorName ? ` by ${authorName}` : ""}. Front cover design with space for title text.`;

  return generateImageWithNanoBanana(
    {
      prompt: coverPrompt,
      style,
      characters: [],
      dimensions: PRINT_DIMENSIONS,
    },
    apiKey
  );
}
