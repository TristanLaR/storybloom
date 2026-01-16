import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Types for story generation
export interface Character {
  name: string;
  role: "main" | "supporting";
  description: string;
  relationship?: string;
}

export interface Setting {
  primary: string;
  timeOfDay?: string;
  season?: string;
  additionalNotes?: string;
}

export interface StoryPage {
  pageNumber: number;
  pageType: "title" | "story" | "back_cover";
  textContent: string;
  imagePrompt: string;
  textPosition: "top" | "middle" | "bottom";
}

export interface StoryResult {
  pages: StoryPage[];
  coverPrompt: string;
  title: string;
}

export interface GenerateStoryParams {
  theme: string;
  characters: Character[];
  setting: Setting;
  mood: string;
  artStyle: string;
  title: string;
  authorName?: string;
}

// Rate limiting - simple in-memory implementation
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

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

// Build the prompt template for story generation
function buildStoryPrompt(params: GenerateStoryParams): string {
  const { theme, characters, setting, mood, artStyle, title, authorName } = params;

  const mainCharacters = characters.filter((c) => c.role === "main");
  const supportingCharacters = characters.filter((c) => c.role === "supporting");

  const characterDescriptions = characters
    .map(
      (c) =>
        `- ${c.name} (${c.role}): ${c.description}${c.relationship ? `. Relationship: ${c.relationship}` : ""}`
    )
    .join("\n");

  const settingDescription = [
    setting.primary,
    setting.timeOfDay ? `Time: ${setting.timeOfDay}` : null,
    setting.season ? `Season: ${setting.season}` : null,
    setting.additionalNotes ? `Details: ${setting.additionalNotes}` : null,
  ]
    .filter(Boolean)
    .join(". ");

  return `You are a children's book author creating a personalized story. Generate a complete 24-page children's picture book based on the following details.

BOOK DETAILS:
- Title: "${title}"
- Author: ${authorName || "Anonymous"}
- Theme/Story Idea: ${theme}
- Mood: ${mood}
- Art Style: ${artStyle}

CHARACTERS:
${characterDescriptions}

SETTING:
${settingDescription}

REQUIREMENTS:
1. Create exactly 24 pages for a children's picture book
2. Page 1 should be the title page
3. Page 24 should be the back cover with a concluding message
4. Pages 2-23 tell the story
5. Each page should have age-appropriate text (2-4 sentences, suitable for ages 3-8)
6. Create detailed image prompts for each page that match the ${artStyle} art style
7. The story should have a clear beginning, middle, and end
8. Include all characters naturally in the story
9. Match the ${mood} mood throughout

Respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks):
{
  "title": "${title}",
  "coverPrompt": "Detailed prompt for the book cover illustration in ${artStyle} style",
  "pages": [
    {
      "pageNumber": 1,
      "pageType": "title",
      "textContent": "Title page text",
      "imagePrompt": "Detailed illustration prompt",
      "textPosition": "middle"
    },
    {
      "pageNumber": 2,
      "pageType": "story",
      "textContent": "Story text for this page",
      "imagePrompt": "Detailed illustration prompt for this page",
      "textPosition": "bottom"
    }
  ]
}

Remember:
- textPosition should be "top", "middle", or "bottom" based on what works best with the illustration
- imagePrompt should be detailed and specific to the ${artStyle} style
- Keep text content appropriate for young children
- Make the main character(s) the hero of the story
- End with a positive, uplifting message`;
}

// Parse and validate the response
function parseStoryResponse(responseText: string): StoryResult {
  // Try to extract JSON from the response
  let jsonStr = responseText.trim();

  // Remove markdown code blocks if present
  if (jsonStr.startsWith("```json")) {
    jsonStr = jsonStr.slice(7);
  }
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith("```")) {
    jsonStr = jsonStr.slice(0, -3);
  }
  jsonStr = jsonStr.trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse story response as JSON: ${responseText.slice(0, 200)}...`);
  }

  // Validate the structure
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Invalid story response: not an object");
  }

  const result = parsed as Record<string, unknown>;

  if (!result.pages || !Array.isArray(result.pages)) {
    throw new Error("Invalid story response: missing pages array");
  }

  if (result.pages.length !== 24) {
    throw new Error(`Invalid story response: expected 24 pages, got ${result.pages.length}`);
  }

  if (typeof result.coverPrompt !== "string") {
    throw new Error("Invalid story response: missing coverPrompt");
  }

  // Validate each page
  for (const page of result.pages as unknown[]) {
    if (typeof page !== "object" || page === null) {
      throw new Error("Invalid page: not an object");
    }
    const p = page as Record<string, unknown>;
    if (typeof p.pageNumber !== "number") {
      throw new Error("Invalid page: missing pageNumber");
    }
    if (!["title", "story", "back_cover"].includes(p.pageType as string)) {
      throw new Error(`Invalid page type: ${p.pageType}`);
    }
    if (typeof p.textContent !== "string") {
      throw new Error("Invalid page: missing textContent");
    }
    if (typeof p.imagePrompt !== "string") {
      throw new Error("Invalid page: missing imagePrompt");
    }
    if (!["top", "middle", "bottom"].includes(p.textPosition as string)) {
      throw new Error(`Invalid text position: ${p.textPosition}`);
    }
  }

  return {
    title: (result.title as string) || "My Story",
    coverPrompt: result.coverPrompt as string,
    pages: result.pages as StoryPage[],
  };
}

// Main function to generate story
export async function generateStoryWithGemini(
  params: GenerateStoryParams,
  apiKey: string
): Promise<StoryResult> {
  if (!apiKey) {
    throw new Error("Gemini API key is required");
  }

  await waitForRateLimit();

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ],
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    },
  });

  const prompt = buildStoryPrompt(params);

  // Retry logic
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return parseStoryResponse(text);
    } catch (error) {
      lastError = error as Error;
      console.error(`Gemini API attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw new Error(`Failed to generate story after ${maxRetries} attempts: ${lastError?.message}`);
}
