// Lulu Print API Client
// API Documentation: https://developers.lulu.com/

export const LULU_API_BASE_URL = "https://api.lulu.com";
export const LULU_SANDBOX_API_BASE_URL = "https://api.sandbox.lulu.com";

// Product specifications for 8.75" x 8.75" hardcover book
export const LULU_PRODUCT_SPECS = {
  productId: "0600X0600CHWW060UW444MXX", // 6"x6" to 8.75"x8.75" square hardcover
  interior: {
    pod_package_id: "0600X0600BWSTDLW060UW444MXX", // Black & white standard pages
  },
  cover: {
    pod_package_id: "0600X0600HWCO000000001", // Hardcover
  },
};

// Shipping methods
export type LuluShippingMethod =
  | "MAIL"
  | "GROUND_HD"
  | "GROUND_BUS"
  | "EXPRESS"
  | "PRIORITY";

export interface LuluShippingOption {
  level: LuluShippingMethod;
  name: string;
  estimatedDays: { min: number; max: number };
}

export const SHIPPING_OPTIONS: LuluShippingOption[] = [
  { level: "MAIL", name: "Standard Mail", estimatedDays: { min: 7, max: 14 } },
  { level: "GROUND_HD", name: "Ground Home Delivery", estimatedDays: { min: 5, max: 7 } },
  { level: "GROUND_BUS", name: "Ground Business", estimatedDays: { min: 3, max: 5 } },
  { level: "EXPRESS", name: "Express", estimatedDays: { min: 2, max: 3 } },
  { level: "PRIORITY", name: "Priority", estimatedDays: { min: 1, max: 2 } },
];

// Address type
export interface LuluAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state_code: string;
  postal_code: string;
  country_code: string;
  phone_number?: string;
  email?: string;
}

// Line item for orders
export interface LuluLineItem {
  external_id?: string;
  title: string;
  cover: {
    source_url: string;
  };
  interior: {
    source_url: string;
  };
  pod_package_id: string;
  quantity: number;
}

// Order request
export interface LuluOrderRequest {
  external_id?: string;
  contact_email: string;
  shipping_address: LuluAddress;
  shipping_level: LuluShippingMethod;
  line_items: LuluLineItem[];
}

// Shipping cost response
export interface LuluShippingCost {
  shipping_level: LuluShippingMethod;
  total_cost_excl_tax: string;
  total_cost_incl_tax: string;
  currency: string;
  estimated_delivery_dates: {
    minimum: string;
    maximum: string;
  };
}

// Print job status
export type LuluPrintJobStatus =
  | "CREATED"
  | "UNPAID"
  | "PAYMENT_IN_PROGRESS"
  | "PRODUCTION_READY"
  | "PRODUCTION_DELAYED"
  | "IN_PRODUCTION"
  | "SHIPPED"
  | "ERROR"
  | "REJECTED"
  | "CANCELLED";

// Order status response
export interface LuluOrder {
  id: number;
  external_id?: string;
  status: {
    name: LuluPrintJobStatus;
    messages?: string[];
  };
  line_items: Array<{
    id: number;
    external_id?: string;
    tracking_urls?: string[];
    tracking_id?: string;
  }>;
  shipping_address: LuluAddress;
  date_created: string;
  date_modified: string;
  estimated_ship_date?: string;
}

// Map Lulu status to internal order status
export function mapLuluStatusToOrderStatus(
  luluStatus: LuluPrintJobStatus
): "paid" | "submitted_to_lulu" | "printing" | "shipped" | "cancelled" {
  switch (luluStatus) {
    case "CREATED":
    case "UNPAID":
    case "PAYMENT_IN_PROGRESS":
      return "submitted_to_lulu";
    case "PRODUCTION_READY":
    case "PRODUCTION_DELAYED":
    case "IN_PRODUCTION":
      return "printing";
    case "SHIPPED":
      return "shipped";
    case "ERROR":
    case "REJECTED":
    case "CANCELLED":
      return "cancelled";
    default:
      return "submitted_to_lulu";
  }
}

// API Client class
export class LuluApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string, sandbox = false) {
    this.baseUrl = sandbox ? LULU_SANDBOX_API_BASE_URL : LULU_API_BASE_URL;
    this.apiKey = apiKey;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: object
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Lulu API error (${response.status}): ${errorText}`
      );
    }

    return await response.json();
  }

  // Get shipping cost estimate
  async calculateShipping(
    address: LuluAddress,
    lineItems: Array<{ pod_package_id: string; quantity: number }>,
    shippingLevel: LuluShippingMethod
  ): Promise<LuluShippingCost> {
    return this.request<LuluShippingCost>("POST", "/v1/print-job-cost-calculations/", {
      shipping_address: address,
      shipping_level: shippingLevel,
      line_items: lineItems.map((item) => ({
        pod_package_id: item.pod_package_id,
        quantity: item.quantity,
      })),
    });
  }

  // Get all shipping options for an address
  async getShippingOptions(
    address: LuluAddress,
    lineItems: Array<{ pod_package_id: string; quantity: number }>
  ): Promise<LuluShippingCost[]> {
    const results: LuluShippingCost[] = [];

    for (const option of SHIPPING_OPTIONS) {
      try {
        const cost = await this.calculateShipping(address, lineItems, option.level);
        results.push(cost);
      } catch (error) {
        // Some shipping options may not be available for all addresses
        console.warn(`Shipping option ${option.level} not available:`, error);
      }
    }

    return results;
  }

  // Create a print job (order)
  async createOrder(order: LuluOrderRequest): Promise<LuluOrder> {
    return this.request<LuluOrder>("POST", "/v1/print-jobs/", order);
  }

  // Get order status
  async getOrder(orderId: number): Promise<LuluOrder> {
    return this.request<LuluOrder>("GET", `/v1/print-jobs/${orderId}/`);
  }

  // Cancel an order
  async cancelOrder(orderId: number): Promise<void> {
    await this.request<void>("DELETE", `/v1/print-jobs/${orderId}/`);
  }

  // Upload a file to Lulu
  async uploadFile(fileData: ArrayBuffer, filename: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", new Blob([fileData], { type: "application/pdf" }), filename);

    const url = `${this.baseUrl}/v1/files/`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lulu file upload error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    return result.source_url;
  }
}

// Create a client instance
export function createLuluClient(): LuluApiClient {
  const apiKey = process.env.LULU_API_KEY;
  const useSandbox = process.env.LULU_USE_SANDBOX === "true";

  if (!apiKey) {
    throw new Error("LULU_API_KEY environment variable is not set");
  }

  return new LuluApiClient(apiKey, useSandbox);
}
