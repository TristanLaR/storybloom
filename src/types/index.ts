// Shared TypeScript types for StoryBloom

export type BookStatus = "setup" | "generating" | "draft" | "finalized" | "ordered";

export type ThemeCategory = "adventure" | "friendship" | "family" | "learning" | "bedtime" | "custom";

export type ArtStyle = "watercolor" | "cartoon" | "classic" | "whimsical" | "pastel" | "bold";

export type Mood = "lighthearted" | "gentle" | "exciting" | "educational";

export type CharacterRole = "main" | "supporting";

export type PageType = "title" | "story" | "back_cover";

export type TextPosition = "top" | "middle" | "bottom";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "submitted_to_lulu"
  | "printing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentType = "generation" | "print_order" | "regeneration";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export type GenerationJobType = "story" | "images" | "cover" | "single_image";

export type GenerationJobStatus = "pending" | "in_progress" | "completed" | "failed";

export interface Setting {
  primary: string;
  timeOfDay?: string;
  season?: string;
  additionalNotes?: string;
}

export interface ShippingAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}
