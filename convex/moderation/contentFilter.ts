/**
 * Content Moderation Module
 *
 * Provides safety measures for AI-generated content in a children's book platform.
 * Implements keyword blocking, pattern detection, and content flagging.
 */

// Inappropriate keywords/patterns to block (case-insensitive)
// This is a basic list - in production, use a comprehensive moderation API
const BLOCKED_KEYWORDS = [
  // Violence
  "kill",
  "murder",
  "blood",
  "gore",
  "violent",
  "weapon",
  "gun",
  "knife",
  "sword",
  "death",
  "dead",
  "die",
  "dying",
  "suicide",
  "torture",
  "abuse",

  // Adult content
  "adult",
  "explicit",
  "nude",
  "naked",
  "sexy",
  "sexual",
  "erotic",
  "porn",
  "xxx",

  // Hate/discrimination
  "racist",
  "racism",
  "hate",
  "slur",
  "discrimination",
  "nazi",
  "terrorist",

  // Drugs/alcohol
  "drug",
  "cocaine",
  "heroin",
  "meth",
  "marijuana",
  "drunk",
  "alcohol",
  "cigarette",
  "smoking",
  "vape",

  // Horror/scary (not appropriate for children's books)
  "horror",
  "nightmare",
  "terrifying",
  "gruesome",
  "demon",
  "devil",
  "satan",
  "evil",
  "zombie",
  "vampire",
  "ghost",
  "haunted",
  "creepy",
  "scary",

  // Profanity (basic list)
  "damn",
  "hell",
  "crap",
  // Additional profanity would be filtered
];

// Patterns that suggest inappropriate content
const SUSPICIOUS_PATTERNS = [
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email addresses
  /\bhttps?:\/\/\S+/i, // URLs
  /\b(?:password|credit.?card|ssn|social.?security)\b/i, // Sensitive info
];

// Safe themes for children's books
const APPROVED_THEMES = [
  "adventure",
  "friendship",
  "family",
  "learning",
  "bedtime",
  "animals",
  "nature",
  "magic",
  "fantasy",
  "exploration",
  "kindness",
  "courage",
  "creativity",
  "imagination",
  "discovery",
  "helping",
  "sharing",
  "growing up",
  "holidays",
  "seasons",
  "sports",
  "music",
  "art",
  "science",
  "space",
  "ocean",
  "farm",
  "pets",
  "school",
  "birthday",
  "custom",
];

export interface ModerationResult {
  isApproved: boolean;
  flaggedItems: string[];
  severity: "none" | "low" | "medium" | "high";
  requiresReview: boolean;
  message?: string;
}

export interface ContentToModerate {
  title?: string;
  theme?: string;
  description?: string;
  characterNames?: string[];
  characterDescriptions?: string[];
  settingDescription?: string;
  storyText?: string;
  imagePrompt?: string;
}

/**
 * Check if text contains blocked keywords
 */
function checkBlockedKeywords(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const foundKeywords: string[] = [];

  for (const keyword of BLOCKED_KEYWORDS) {
    // Use word boundary matching to avoid false positives
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    if (regex.test(normalizedText)) {
      foundKeywords.push(keyword);
    }
  }

  return foundKeywords;
}

/**
 * Check if text matches suspicious patterns
 */
function checkSuspiciousPatterns(text: string): string[] {
  const matches: string[] = [];

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(text)) {
      matches.push(pattern.source);
    }
  }

  return matches;
}

/**
 * Validate theme is appropriate for children's content
 */
export function validateTheme(theme: string): boolean {
  const normalizedTheme = theme.toLowerCase().trim();
  return APPROVED_THEMES.some(
    (approved) =>
      normalizedTheme.includes(approved) || approved.includes(normalizedTheme)
  );
}

/**
 * Main content moderation function
 */
export function moderateContent(content: ContentToModerate): ModerationResult {
  const flaggedItems: string[] = [];
  let severity: ModerationResult["severity"] = "none";

  // Collect all text to moderate
  const textsToCheck = [
    content.title,
    content.theme,
    content.description,
    content.settingDescription,
    content.storyText,
    content.imagePrompt,
    ...(content.characterNames || []),
    ...(content.characterDescriptions || []),
  ].filter((t): t is string => typeof t === "string" && t.length > 0);

  // Check each text field
  for (const text of textsToCheck) {
    // Check for blocked keywords
    const blockedFound = checkBlockedKeywords(text);
    if (blockedFound.length > 0) {
      flaggedItems.push(...blockedFound.map((k) => `Blocked keyword: "${k}"`));
      severity = "high";
    }

    // Check for suspicious patterns
    const patternsFound = checkSuspiciousPatterns(text);
    if (patternsFound.length > 0) {
      flaggedItems.push(
        ...patternsFound.map((p) => `Suspicious pattern detected`)
      );
      if (severity === "none") {
        severity = "low";
      }
    }
  }

  // Validate theme if provided
  if (content.theme && !validateTheme(content.theme)) {
    flaggedItems.push(`Unrecognized theme: "${content.theme}"`);
    if (severity === "none") {
      severity = "low";
    }
  }

  // Determine if content is approved
  const isApproved = severity === "none" || severity === "low";
  const requiresReview = severity === "medium" || flaggedItems.length > 3;

  return {
    isApproved,
    flaggedItems,
    severity,
    requiresReview,
    message:
      flaggedItems.length > 0
        ? `Content flagged for: ${flaggedItems.slice(0, 3).join(", ")}${flaggedItems.length > 3 ? ` and ${flaggedItems.length - 3} more issues` : ""}`
        : undefined,
  };
}

/**
 * Quick check for a single text input
 */
export function quickModerationCheck(text: string): {
  isClean: boolean;
  reason?: string;
} {
  const blockedFound = checkBlockedKeywords(text);
  if (blockedFound.length > 0) {
    return {
      isClean: false,
      reason: `Content contains inappropriate language: "${blockedFound[0]}"`,
    };
  }

  const patternsFound = checkSuspiciousPatterns(text);
  if (patternsFound.length > 0) {
    return {
      isClean: false,
      reason: "Content contains suspicious patterns (like personal information)",
    };
  }

  return { isClean: true };
}

/**
 * Sanitize text by removing blocked content
 * (Use with caution - may alter meaning)
 */
export function sanitizeText(text: string): string {
  let sanitized = text;

  for (const keyword of BLOCKED_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    sanitized = sanitized.replace(regex, "[removed]");
  }

  return sanitized;
}

/**
 * Get list of approved themes
 */
export function getApprovedThemes(): string[] {
  return [...APPROVED_THEMES];
}
