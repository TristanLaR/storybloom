/**
 * Type declarations for Convex query builders and other utilities.
 * These types help TypeScript understand Convex-specific patterns.
 */

import { Id } from "./_generated/dataModel";

// Re-export common types
export type { Id };

/**
 * Generic query builder type for index queries.
 * This provides basic type safety while allowing Convex to infer the rest.
 */
export interface QueryBuilder<T extends string> {
  eq<K extends string>(field: K, value: unknown): this;
  lt<K extends string>(field: K, value: unknown): this;
  lte<K extends string>(field: K, value: unknown): this;
  gt<K extends string>(field: K, value: unknown): this;
  gte<K extends string>(field: K, value: unknown): this;
}

/**
 * Helper type for filter expressions
 */
export interface FilterBuilder {
  eq(left: unknown, right: unknown): unknown;
  neq(left: unknown, right: unknown): unknown;
  lt(left: unknown, right: unknown): unknown;
  lte(left: unknown, right: unknown): unknown;
  gt(left: unknown, right: unknown): unknown;
  gte(left: unknown, right: unknown): unknown;
  and(...args: unknown[]): unknown;
  or(...args: unknown[]): unknown;
  not(arg: unknown): unknown;
  field(name: string): unknown;
}

/**
 * Character definition for book creation
 */
export interface CharacterInput {
  name: string;
  role: "main" | "supporting";
  description: string;
  relationship?: string;
  referenceImageId?: Id<"_storage">;
}

/**
 * Setting definition for book creation
 */
export interface SettingInput {
  primary: string;
  timeOfDay?: string;
  season?: string;
  additionalNotes?: string;
}

/**
 * Shipping address for orders
 */
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

// Art styles
export const ART_STYLES = [
  "watercolor",
  "cartoon",
  "classic",
  "whimsical",
  "pastel",
  "bold",
] as const;
export type ArtStyle = (typeof ART_STYLES)[number];

// Moods
export const MOODS = [
  "lighthearted",
  "gentle",
  "exciting",
  "educational",
] as const;
export type Mood = (typeof MOODS)[number];

// Book statuses
export const BOOK_STATUSES = [
  "setup",
  "generating",
  "draft",
  "finalized",
  "ordered",
] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];

// Order statuses
export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "submitted_to_lulu",
  "printing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
