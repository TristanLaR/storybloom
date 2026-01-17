"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OrderStatusTimeline } from "@/components/order/OrderStatusTimeline";
import type { OrderStatus } from "@/components/order/OrderStatusTimeline";

// Mock order data for development
const mockOrder = {
  _id: "order-123456",
  bookId: "book-1",
  userId: "user-1",
  status: "shipped" as OrderStatus,
  quantity: 1,
  shippingAddress: {
    name: "John Smith",
    street1: "123 Main St",
    street2: "Apt 4B",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "US",
    phone: "(555) 123-4567",
  },
  shippingMethod: "GROUND_HD",
  printCost: 999,
  shippingCost: 799,
  taxAmount: 0,
  totalAmount: 1798,
  trackingNumber: "1Z999AA10123456784",
  trackingUrl: "https://www.ups.com/track?tracknum=1Z999AA10123456784",
  createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
};

const mockBook = {
  _id: "book-1",
  title: "The Great Adventure",
  authorName: "Jane Smith",
  coverImageUrl: null,
};

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const SHIPPING_METHOD_NAMES: Record<string, string> = {
  MAIL: "Standard Mail",
  GROUND_HD: "Ground Home Delivery",
  GROUND_BUS: "Ground Business",
  EXPRESS: "Express",
  PRIORITY: "Priority",
};

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();

  // In real implementation, fetch from Convex:
  // const order = useQuery(api.orders.getOrder, { orderId });
  // const book = useQuery(api.books.getBook, { bookId: order?.bookId });
  const order = mockOrder;
  const book = mockBook;

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <svg
          className="w-16 h-16 text-gray-300 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Order Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn't find an order with this ID.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-500 mt-1">
            Order #{orderId} • Placed {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Order Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Order Status
        </h2>
        <OrderStatusTimeline
          currentStatus={order.status}
          trackingNumber={order.trackingNumber}
          trackingUrl={order.trackingUrl}
          updatedAt={order.updatedAt}
        />
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Order Items
        </h2>
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {book.coverImageUrl ? (
              <img
                src={book.coverImageUrl}
                alt={book.title}
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
            <h3 className="font-medium text-gray-900">{book.title}</h3>
            {book.authorName && (
              <p className="text-sm text-gray-500">by {book.authorName}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Hardcover, 8.75" x 8.75"
            </p>
            <p className="text-sm text-gray-500">Quantity: {order.quantity}</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900">
              {formatPrice(order.printCost)}
            </p>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Shipping Address
        </h2>
        <div className="text-gray-600 space-y-0.5">
          <p className="font-medium text-gray-900">
            {order.shippingAddress.name}
          </p>
          <p>{order.shippingAddress.street1}</p>
          {order.shippingAddress.street2 && (
            <p>{order.shippingAddress.street2}</p>
          )}
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
            {order.shippingAddress.postalCode}
          </p>
          {order.shippingAddress.phone && (
            <p className="mt-2">{order.shippingAddress.phone}</p>
          )}
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-500">
            Shipping Method:{" "}
            <span className="text-gray-700">
              {SHIPPING_METHOD_NAMES[order.shippingMethod] ||
                order.shippingMethod}
            </span>
          </p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Order Summary
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{formatPrice(order.printCost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-900">
              {formatPrice(order.shippingCost)}
            </span>
          </div>
          {order.taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">
                {formatPrice(order.taxAmount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold pt-2 border-t">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="flex-1"
        >
          Back to Dashboard
        </Button>
        {order.status !== "cancelled" && order.status !== "delivered" && (
          <Button
            variant="outline"
            onClick={() => {
              // In real implementation, implement cancel order functionality
              console.log("Cancel order:", orderId);
            }}
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            Cancel Order
          </Button>
        )}
      </div>

      {/* Help */}
      <div className="text-center text-sm text-gray-500 pt-4">
        <p>
          Need help with your order?{" "}
          <a
            href="mailto:support@storybloom.com"
            className="text-primary-600 hover:underline"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
