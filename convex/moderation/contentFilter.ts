/**
 * Content Moderation Module
 *
 * Provides safety measures for AI-generated content in a children's book platform.
 * Implements keyword blocking, pattern detection, content flagging, and prompt injection detection.
 */

// Inappropriate keywords/patterns to block (case-insensitive)
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
];

// Patterns that suggest inappropriate content
const SUSPICIOUS_PATTERNS = [
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email addresses
  /\bhttps?:\/\/\S+/i, // URLs
  /\b(?:password|credit.?card|ssn|social.?security)\b/i, // Sensitive info
];

// Prompt injection detection patterns
const PROMPT_INJECTION_PATTERNS = [
  // Direct instruction attempts
  /ignore\s+(previous|above|all|the)\s+(instructions?|prompt|rules?)/i,
  /disregard\s+(previous|above|all|the)\s+(instructions?|prompt|rules?)/i,
  /forget\s+(previous|above|all|the)\s+(instructions?|prompt|rules?)/i,
  /override\s+(previous|above|all|the)\s+(instructions?|prompt|rules?)/i,

  // System prompt manipulation
  /\bsystem\s*:?\s*you\s+(are|will|must|should)/i,
  /\bassistant\s*:?\s*you\s+(are|will|must|should)/i,
  /\buser\s*:?\s*you\s+(are|will|must|should)/i,
  /\brole\s*:?\s*(system|assistant|user)/i,

  // Jailbreak attempts
  /\bDAN\s*mode\b/i,
  /\bjailbreak\b/i,
  /\bbypass\s+(safety|filter|moderation)/i,
  /\bdeveloper\s*mode\b/i,

  // Role-play manipulation
  /pretend\s+(you\s+are|to\s+be)\s+(a|an)\s+(different|new|unrestricted)/i,
  /act\s+as\s+(if|though)\s+you\s+(have|had)\s+no\s+(restrictions?|limits?)/i,

  // Output manipulation
  /\bprint\s+(the|your)\s+(system|initial|original)\s+prompt/i,
  /\bshow\s+me\s+(your|the)\s+(system|initial|original)\s+(prompt|instructions?)/i,
  /\brepeat\s+(the|your)\s+(system|initial|original)\s+(prompt|instructions?)/i,

  // Special character injection
  /[<>{}[\]]{3,}/, // Multiple special characters in a row
  /\\n\\n|\\r\\n\\r\\n/, // Newline injection attempts
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
 * Check for prompt injection attempts
 */
export function detectPromptInjection(text: string): {
  detected: boolean;
  patterns: string[];
} {
  const detectedPatterns: string[] = [];

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      detectedPatterns.push(pattern.source);
    }
  }

  return {
    detected: detectedPatterns.length > 0,
    patterns: detectedPatterns,
  };
}

/**
 * Sanitize user input to prevent prompt injection
 */
export function sanitizeForPrompt(input: string): string {
  // Remove or escape potentially dangerous characters
  let sanitized = input
    // Remove newlines that could be used to inject new prompts
    .replace(/[\r\n]+/g, " ")
    // Remove excessive whitespace
    .replace(/\s{2,}/g, " ")
    // Remove special characters used in prompt formatting
    .replace(/[<>{}[\]|\\]/g, "")
    // Remove colon sequences that might look like role prefixes
    .replace(/:\s*:/g, "")
    // Limit length to prevent extremely long inputs
    .slice(0, 500)
    .trim();

  return sanitized;
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
        ...patternsFound.map(() => `Suspicious pattern detected`)
      );
      if (severity === "none") {
        severity = "low";
      }
    }

    // Check for prompt injection
    const injectionCheck = detectPromptInjection(text);
    if (injectionCheck.detected) {
      flaggedItems.push("Potential prompt injection detected");
      severity = "high";
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
  const requiresReview = ["medium", "high"].includes(severity) || flaggedItems.length > 3;

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

  const injectionCheck = detectPromptInjection(text);
  if (injectionCheck.detected) {
    return {
      isClean: false,
      reason: "Content contains potentially harmful instructions",
    };
  }

  return { isClean: true };
}

/**
 * Moderate AI-generated story content
 */
export function moderateGeneratedStory(pages: Array<{
  textContent: string;
  imagePrompt: string;
}>): ModerationResult {
  const flaggedItems: string[] = [];
  let severity: ModerationResult["severity"] = "none";

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    // Check story text
    const textCheck = quickModerationCheck(page.textContent);
    if (!textCheck.isClean) {
      flaggedItems.push(`Page ${i + 1} text: ${textCheck.reason}`);
      severity = "high";
    }

    // Check image prompt
    const promptCheck = quickModerationCheck(page.imagePrompt);
    if (!promptCheck.isClean) {
      flaggedItems.push(`Page ${i + 1} image: ${promptCheck.reason}`);
      severity = "high";
    }
  }

  return {
    isApproved: ["none", "low"].includes(severity),
    flaggedItems,
    severity,
    requiresReview: flaggedItems.length > 0,
    message: flaggedItems.length > 0
      ? `Generated content flagged: ${flaggedItems[0]}`
      : undefined,
  };
}

/**
 * Sanitize text by removing blocked content
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
