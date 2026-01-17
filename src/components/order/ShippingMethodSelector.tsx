"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ShippingOption {
  level: string;
  name: string;
  cost: number;
  currency: string;
  estimatedDelivery: {
    minimum: string;
    maximum: string;
  };
}

interface ShippingMethodSelectorProps {
  options: ShippingOption[];
  selectedMethod: string | null;
  onSelect: (method: string) => void;
  onContinue: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

function formatDeliveryDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function ShippingMethodSelector({
  options,
  selectedMethod,
  onSelect,
  onContinue,
  onBack,
  isLoading = false,
}: ShippingMethodSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-gray-500">Calculating shipping options...</p>
        </div>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <svg
            className="w-12 h-12 text-yellow-400 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-yellow-800 font-medium">
            No shipping options available
          </p>
          <p className="text-yellow-600 text-sm mt-1">
            Please check your shipping address and try again.
          </p>
        </div>
        <Button variant="outline" onClick={onBack} className="w-full">
          Back to Address
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.level}
            onClick={() => onSelect(option.level)}
            className={cn(
              "w-full p-4 rounded-lg border-2 text-left transition-all",
              selectedMethod === option.level
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    selectedMethod === option.level
                      ? "border-primary-500"
                      : "border-gray-300"
                  )}
                >
                  {selectedMethod === option.level && (
                    <div className="w-3 h-3 rounded-full bg-primary-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{option.name}</p>
                  <p className="text-sm text-gray-500">
                    Est. delivery:{" "}
                    {formatDeliveryDate(option.estimatedDelivery.minimum)}
                    {option.estimatedDelivery.minimum !==
                      option.estimatedDelivery.maximum && (
                      <>
                        {" "}
                        - {formatDeliveryDate(option.estimatedDelivery.maximum)}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <span className="font-semibold text-gray-900">
                {formatPrice(option.cost)}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={onContinue}
          disabled={!selectedMethod}
          className="flex-1"
        >
          Continue to Review
        </Button>
      </div>
    </div>
  );
}
