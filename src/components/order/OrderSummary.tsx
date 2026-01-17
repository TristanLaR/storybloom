"use client";

import { Button } from "@/components/ui/button";
import type { ShippingAddress } from "./ShippingAddressForm";

interface OrderSummaryProps {
  bookTitle: string;
  coverImageUrl?: string | null;
  quantity: number;
  printCost: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  shippingMethod: string;
  onProceedToPayment: () => void;
  onBack: () => void;
  onChangeQuantity?: (quantity: number) => void;
  isLoading?: boolean;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function OrderSummary({
  bookTitle,
  coverImageUrl,
  quantity,
  printCost,
  shippingCost,
  taxAmount,
  totalAmount,
  shippingAddress,
  shippingMethod,
  onProceedToPayment,
  onBack,
  onChangeQuantity,
  isLoading = false,
}: OrderSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Book Item */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt={bookTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{bookTitle}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Hardcover, 8.75" x 8.75"
            </p>
            {onChangeQuantity ? (
              <div className="flex items-center gap-2 mt-2">
                <label className="text-sm text-gray-600">Qty:</label>
                <select
                  value={quantity}
                  onChange={(e) => onChangeQuantity(parseInt(e.target.value))}
                  className="h-8 px-2 rounded border border-gray-300 text-sm"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-1">Quantity: {quantity}</p>
            )}
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900">
              {formatPrice(printCost)}
            </p>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">Shipping Address</h4>
          <button
            onClick={onBack}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Edit
          </button>
        </div>
        <div className="text-sm text-gray-600 space-y-0.5">
          <p>{shippingAddress.name}</p>
          <p>{shippingAddress.street1}</p>
          {shippingAddress.street2 && <p>{shippingAddress.street2}</p>}
          <p>
            {shippingAddress.city}, {shippingAddress.state}{" "}
            {shippingAddress.postalCode}
          </p>
          <p>{shippingAddress.country}</p>
          {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
        </div>
      </div>

      {/* Shipping Method */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">Shipping Method</h4>
        </div>
        <p className="text-sm text-gray-600">{shippingMethod}</p>
      </div>

      {/* Price Breakdown */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">{formatPrice(printCost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">{formatPrice(shippingCost)}</span>
        </div>
        {taxAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="text-gray-900">{formatPrice(taxAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-semibold pt-2 border-t">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">{formatPrice(totalAmount)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={onProceedToPayment}
          disabled={isLoading}
          isLoading={isLoading}
          className="flex-1"
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}
