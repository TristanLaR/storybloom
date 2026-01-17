"use client";

import { cn } from "@/lib/utils";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "submitted_to_lulu"
  | "printing"
  | "shipped"
  | "delivered"
  | "cancelled";

interface StatusStep {
  key: OrderStatus;
  label: string;
  description: string;
}

const STATUS_STEPS: StatusStep[] = [
  {
    key: "paid",
    label: "Order Placed",
    description: "Your order has been received",
  },
  {
    key: "submitted_to_lulu",
    label: "Processing",
    description: "Your book is being prepared for printing",
  },
  {
    key: "printing",
    label: "Printing",
    description: "Your book is being printed",
  },
  {
    key: "shipped",
    label: "Shipped",
    description: "Your order is on its way",
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Your order has been delivered",
  },
];

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  updatedAt: number;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusIndex(status: OrderStatus): number {
  if (status === "pending_payment") return -1;
  if (status === "cancelled") return -2;
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

export function OrderStatusTimeline({
  currentStatus,
  trackingNumber,
  trackingUrl,
  updatedAt,
}: OrderStatusTimelineProps) {
  const currentIndex = getStatusIndex(currentStatus);

  if (currentStatus === "cancelled") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-3">
          <svg
            className="w-6 h-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h3 className="font-semibold text-red-800">Order Cancelled</h3>
        <p className="text-sm text-red-600 mt-1">
          This order has been cancelled.
        </p>
        <p className="text-xs text-red-500 mt-2">
          Updated: {formatDate(updatedAt)}
        </p>
      </div>
    );
  }

  if (currentStatus === "pending_payment") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="w-12 h-12 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-3">
          <svg
            className="w-6 h-6 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="font-semibold text-yellow-800">Awaiting Payment</h3>
        <p className="text-sm text-yellow-600 mt-1">
          Please complete your payment to proceed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="flex items-start gap-4 pb-8 last:pb-0">
              {/* Connector Line */}
              {index < STATUS_STEPS.length - 1 && (
                <div
                  className={cn(
                    "absolute left-4 w-0.5 h-8 -translate-x-1/2",
                    isCompleted ? "bg-primary-500" : "bg-gray-200"
                  )}
                  style={{ top: `${index * 64 + 32}px` }}
                />
              )}

              {/* Status Icon */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10",
                  isCompleted
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h4
                  className={cn(
                    "font-medium",
                    isCurrent
                      ? "text-primary-700"
                      : isCompleted
                      ? "text-gray-900"
                      : "text-gray-400"
                  )}
                >
                  {step.label}
                </h4>
                <p
                  className={cn(
                    "text-sm mt-0.5",
                    isCompleted ? "text-gray-600" : "text-gray-400"
                  )}
                >
                  {step.description}
                </p>
                {isCurrent && (
                  <p className="text-xs text-gray-400 mt-1">
                    Updated: {formatDate(updatedAt)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tracking Info */}
      {currentStatus === "shipped" && (trackingNumber || trackingUrl) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-800">Tracking Information</h4>
              {trackingNumber && (
                <p className="text-sm text-blue-700 mt-1">
                  Tracking #:{" "}
                  <span className="font-mono font-medium">{trackingNumber}</span>
                </p>
              )}
              {trackingUrl && (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
                >
                  Track Package
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
